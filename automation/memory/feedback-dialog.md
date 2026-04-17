---
name: Feedback-Dialog (AUFG-008)
description: Nutzer-Feedback-Dialog mit Convex-Backend und Sidebar-Integration
type: project
---

## Feedback-Dialog — Implementierungsdetails

### Dateien
- `convex/feedback/_model/feedback.ts` — Zod-Schema, Typen, FEEDBACK_TYPE_LABELS
- `convex/feedback/feedback/mutations.ts` — `submit` Mutation
- `convex/feedback/feedback/queries.ts` — `listMine` Query
- `components/FeedbackDialog.tsx` — Dialog-Komponente (wiederverwendbar, akzeptiert `trigger` prop)

### API-Pfade
- `api.feedback.feedback.mutations.submit`
- `api.feedback.feedback.queries.listMine`

### Features
- 3 Feedback-Typen: Feature-Wunsch / Fehler melden / Sonstiges
- Titel + Beschreibung Pflichtfelder
- Status: new → in_review → done
- In Sidebar als "Feedback geben" Button integriert

### Noch offen
- Automatischer GitHub-Issue oder E-Mail an Developer (optionale Erweiterung)
