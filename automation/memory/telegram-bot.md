# Telegram Bot Feature

## Implementiert in Lauf #8 (2026-04-17)

### Architektur

```
telegramSettings (Convex DB)
  └── botToken, authorizedChatId, webhookRegistered, userId

HTTP: POST /telegram/webhook
  → convex/telegram/webhook/actions.ts (handleWebhook)
  → internal.telegram.bot.queries.getByChatId (Nutzer-Lookup)
  → internal.agents.agents.queries.listByUser (Agenten des Nutzers)
  → api.agents.run.actions.runAgent (Agent ausführen)

Frontend: /agenten/telegram
  → useTelegram() Hook
  → TelegramSettingsPage
```

### Wichtige Entscheidungen

- **Sicherheit**: Nur eine autorisierte Chat-ID pro User (by_chat Index)
- **Webhook-URL**: `{CONVEX_SITE_URL}/telegram/webhook` — gleicher Endpunkt für alle User
- **User-Identifikation**: Lookup via `authorizedChatId` im internalQuery
- **internalQuery**: Für Webhook nötig (kein Auth-Kontext im HTTP-Handler)
- **requireAuth** wurde für `ActionCtx` erweitert (in `convex/lib/auth.ts`)

### API-Pfade

- `api.telegram.bot.queries.getMine` — Eigene Einstellungen (Frontend)
- `internal.telegram.bot.queries.getByChatId` — Lookup im Webhook (kein Auth)
- `api.telegram.bot.mutations.upsertSettings` — create/update Bot-Token + Chat-ID
- `api.telegram.bot.mutations.setWebhookRegistered` — Webhook-Status pflegen
- `api.telegram.bot.mutations.removeSettings` — Bot-Verbindung entfernen
- `api.telegram.bot.actions.registerWebhook` — Telegram API: setWebhook
- `api.telegram.bot.actions.removeWebhook` — Telegram API: deleteWebhook
- `internal.agents.agents.queries.listByUser` — Agenten eines Nutzers (intern)

### Telegram-Befehle

| Befehl | Funktion |
|--------|----------|
| `/start` / `/help` | Hilfetext anzeigen |
| `/list` | Alle Agenten auflisten |
| `/run <Name>` | Agenten nach Name ausführen |
| `/status` | Letzten Run-Zeitpunkt aller Agenten |

### Offene Folgeaufgaben

- Telegram-Push-Benachrichtigung nach Agent-Run (proaktiv, ohne User-Befehl)
- `/stop` Befehl um laufende Agenten abzubrechen

### Setup-Anforderungen (Nutzer)

1. Bot via @BotFather erstellen → Token kopieren
2. Chat-ID über @userinfobot ermitteln
3. In `/agenten/telegram` konfigurieren + Webhook registrieren
4. Env-Variable `CONVEX_SITE_URL` muss gesetzt sein
