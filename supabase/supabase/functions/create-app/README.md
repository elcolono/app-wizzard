# Create App Edge Function

Diese Supabase Edge Function erstellt neue Apps mit eigenen Supabase-Projekten für jeden User.

## Funktionalität

- Erstellt ein neues Supabase-Projekt via Management API
- Speichert App-Daten in der `apps` Tabelle
- Speichert sensitive Credentials in der `apps_credentials` Tabelle
- Vollständige RLS-Sicherheit

## Environment Variables

### Supabase Projekt (Master - wo die apps Tabelle liegt)

Setze diese Variablen in deinem Supabase Dashboard unter Settings > Edge Functions:

```bash
# Supabase Management API
SUPABASE_MANAGEMENT_TOKEN=your_personal_access_token
SUPABASE_ORG_ID=your_organization_id
SUPABASE_DEFAULT_REGION=eu-central-1
SUPABASE_DEFAULT_DB_PASS=your_secure_password_or_leave_empty_for_auto_generation
```

### Wie man die Werte bekommt:

1. **SUPABASE_MANAGEMENT_TOKEN**: 
   - Gehe zu https://supabase.com/dashboard/account/tokens
   - Erstelle einen neuen Personal Access Token
   - Kopiere den Token

2. **SUPABASE_ORG_ID**:
   - Gehe zu https://supabase.com/dashboard/organizations
   - Kopiere die Organization ID aus der URL oder den Settings

3. **SUPABASE_DEFAULT_REGION**:
   - Wähle deine bevorzugte Region (z.B. `eu-central-1`, `us-east-1`)

4. **SUPABASE_DEFAULT_DB_PASS**:
   - Optional: Setze ein Standard-Passwort für neue Projekte
   - Falls leer, wird automatisch ein sicheres Passwort generiert

## Deployment

```bash
# Im backend/supabase Verzeichnis
supabase functions deploy create-app
```

## API Usage

### Request

```typescript
POST /functions/v1/create-app
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "title": "My New App",
  "description": "App description",
  "image": "https://example.com/image.jpg",
  "appConfig": {
    "app": {
      "id": "my-app-123",
      "name": "My New App",
      "version": "1.0.0"
    },
    "pages": {},
    "layouts": {},
    "components": {},
    "utils": {},
    "themes": {},
    "i18n": {}
  },
  "region": "eu-central-1"
}
```

### Response

```typescript
// Success
{
  "success": true,
  "appId": "uuid",
  "projectRef": "project-reference",
  "supabaseUrl": "https://project-ref.supabase.co",
  "message": "App created successfully"
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

## Sicherheit

- **RLS aktiviert**: User können nur ihre eigenen Apps sehen
- **Credentials getrennt**: Sensitive Daten in separater Tabelle mit RLS-Deny
- **Service Role**: Edge Function läuft mit Service Role und umgeht RLS
- **Keine Secrets im Response**: API Keys werden nie an den Client gesendet

## Fehlerbehandlung

- Retry-Logik für API Key Fetching (bis zu 3 Versuche)
- Validierung von Input-Daten
- Detaillierte Error-Logs
- Graceful Fallbacks

## Monitoring

Überwache die Function Logs im Supabase Dashboard unter:
- Edge Functions > create-app > Logs

Häufige Issues:
- Management Token expired → Token erneuern
- Organization ID falsch → Korrekte ID setzen
- Region nicht verfügbar → Andere Region wählen
