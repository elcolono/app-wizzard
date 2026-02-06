// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import Ajv from "https://esm.sh/ajv@8.12.0";
import configSchema from "../../config_schema.json" assert { type: "json" };

// Compile JSON Schema validator once
const ajv = new Ajv({ allErrors: true, strict: false });
const validateConfig = ajv.compile(configSchema as any);

export function validateAppConfig(config: any): {
  valid: boolean;
  errors?: any[];
} {
  const valid = validateConfig(config);
  if (!valid) {
    return {
      valid: false,
      errors: validateConfig.errors,
    };
  }
  return { valid: true };
}

