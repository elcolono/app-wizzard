import { isValidBuildOp, normalizeTransientZone } from "../build-ops.ts";

export class PuckStreamManager {
  private encoder = new TextEncoder();
  private resetSent = new Set<string>();
  private lastSentDescription = new Map<string, string>();
  private previousDescription = new Map<string, string>();
  private buildStatusSent = new Set<string>();
  private lastSentPayloadByOp = new Map<string, string>();
  private addSentByToolCall = new Map<string, Set<string>>();
  private lastBuildLengthByToolCall = new Map<string, number>();
  private knownComponentIds = new Set<string>();

  constructor(
    private controller: ReadableStreamDefaultController,
    initialComponentIds: string[] = [],
  ) {
    for (const id of initialComponentIds) this.knownComponentIds.add(id);
  }

  send(data: unknown) {
    this.controller.enqueue(
      this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
    );
  }

  sendToolStatus(toolCallId: string, label: string, loading: boolean) {
    this.send({
      type: "data-tool-status",
      id: toolCallId,
      data: { toolCallId, status: { loading, label } },
    });
  }

  sendToolInputDelta(toolCallId: string, delta: string) {
    this.send({
      type: "tool-input-delta",
      toolCallId,
      inputTextDelta: delta,
    });
  }

  hasResetSent(toolCallId: string): boolean {
    return this.resetSent.has(toolCallId);
  }

  markResetSent(toolCallId: string) {
    this.resetSent.add(toolCallId);
  }

  getLastSentDescription(toolCallId: string): string | undefined {
    return this.lastSentDescription.get(toolCallId);
  }

  setLastSentDescription(toolCallId: string, description: string) {
    this.lastSentDescription.set(toolCallId, description);
  }

  getPreviousDescription(toolCallId: string): string | undefined {
    return this.previousDescription.get(toolCallId);
  }

  setPreviousDescription(toolCallId: string, description: string) {
    this.previousDescription.set(toolCallId, description);
  }

  hasBuildStatusSent(toolCallId: string): boolean {
    return this.buildStatusSent.has(toolCallId);
  }

  markBuildStatusSent(toolCallId: string) {
    this.buildStatusSent.add(toolCallId);
  }

  private hasAddSent(toolCallId: string, id: string): boolean {
    return this.addSentByToolCall.get(toolCallId)?.has(id) ?? false;
  }

  private markAddSent(toolCallId: string, id: string) {
    const set = this.addSentByToolCall.get(toolCallId) ?? new Set<string>();
    set.add(id);
    this.addSentByToolCall.set(toolCallId, set);
  }

  private splitAddPropsToUpdate(payload: any, toolCallId: string): boolean {
    if (
      payload.op !== "add" ||
      !payload.props ||
      typeof payload.props !== "object"
    ) {
      return false;
    }

    const { content, ...rest } = payload.props as Record<string, unknown>;
    const hasOtherProps = Object.keys(rest).length > 0;
    if (!hasOtherProps) return false;

    const addPayload = {
      ...payload,
      props: content !== undefined ? { content } : {},
    };
    const addKey = `${toolCallId}:add:${addPayload.id ?? "root"}`;
    const addSignature = JSON.stringify(addPayload);
    if (this.lastSentPayloadByOp.get(addKey) !== addSignature) {
      if (!this.hasAddSent(toolCallId, addPayload.id)) {
        this.markAddSent(toolCallId, addPayload.id);
        if (typeof addPayload.id === "string") {
          this.knownComponentIds.add(addPayload.id);
        }
        this.lastSentPayloadByOp.set(addKey, addSignature);
        this.send({
          type: "data-build-op",
          transient: true,
          data: addPayload,
        });
      }
    }

    const updatePayload = {
      op: "update",
      id: payload.id,
      props: rest,
    };
    const updateKey = `${toolCallId}:update:${updatePayload.id ?? "root"}`;
    const updateSignature = JSON.stringify(updatePayload);
    if (this.lastSentPayloadByOp.get(updateKey) !== updateSignature) {
      this.lastSentPayloadByOp.set(updateKey, updateSignature);
      this.send({
        type: "data-build-op",
        transient: true,
        data: updatePayload,
      });
    }

    return true;
  }

  private hasNonEmptyProps(props: unknown): boolean {
    if (!props || typeof props !== "object") return false;
    const entries = Object.entries(props as Record<string, unknown>);
    if (entries.length === 0) return false;
    for (const [, value] of entries) {
      if (typeof value === "string" && value.trim() === "") return false;
    }
    return true;
  }

  processBuildStream(partial: { build?: any[] }, toolCallId: string) {
    const build = partial?.build;
    if (!Array.isArray(build) || build.length === 0) return;
    const lastOp = build[build.length - 1];
    const previousLength = this.lastBuildLengthByToolCall.get(toolCallId) ?? 0;
    if (build.length > previousLength) {
      if (build.length >= 2) {
        const previousOp = build[build.length - 2];
        this.processBuildOp(previousOp, toolCallId);
      }
      this.lastBuildLengthByToolCall.set(toolCallId, build.length);
    }
    if (lastOp?.op !== "add") {
      this.processBuildOp(lastOp, toolCallId);
    }
  }

  processBuildOp(op: any, toolCallId: string) {
    try {
      if (!op || typeof op !== "object" || typeof op.op !== "string") return;
      const normalized =
        op.op === "add" ? { ...op, zone: normalizeTransientZone(op) } : op;
      if (!isValidBuildOp(normalized)) return;

      if (normalized.op === "reset") {
        if (this.resetSent.has(toolCallId)) return;
        this.resetSent.add(toolCallId);
        this.knownComponentIds.clear();
        this.lastSentPayloadByOp = new Map(
          [...this.lastSentPayloadByOp.entries()].filter(
            ([k]) => !k.startsWith(`${toolCallId}:`),
          ),
        );
        this.addSentByToolCall.delete(toolCallId);
        this.lastBuildLengthByToolCall.delete(toolCallId);
      }

      const payload: any = {
        ...normalized,
        props: normalized.props ?? normalized.value ?? {},
      };

      if (
        (payload.op === "update" ||
          payload.op === "move" ||
          payload.op === "delete") &&
        typeof payload.id === "string" &&
        !this.knownComponentIds.has(payload.id)
      ) {
        return;
      }
      if (payload.op === "update" && !this.hasNonEmptyProps(payload.props)) {
        return;
      }

      const opKey = `${toolCallId}:${payload.op}:${payload.id ?? "root"}`;
      const signature = JSON.stringify(payload);

      if (this.splitAddPropsToUpdate(payload, toolCallId)) return;

      if (payload.op === "add" && typeof payload.id === "string") {
        if (this.hasAddSent(toolCallId, payload.id)) return;
        this.markAddSent(toolCallId, payload.id);
        this.knownComponentIds.add(payload.id);
      }
      if (this.lastSentPayloadByOp.get(opKey) === signature) return;
      this.lastSentPayloadByOp.set(opKey, signature);

      this.send({
        type: "data-build-op",
        transient: true,
        data: payload,
      });
    } catch (error) {
      console.error("Error handling live parsing:", error);
    }
  }
}
