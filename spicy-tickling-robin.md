# Kalender-Feature Implementierungsplan

## Übersicht
Implementierung eines vollständigen Kalendersystems mit mehreren Ansichten (Monat, Woche, Tag, Liste, Jahr), Drag & Drop zum Verschieben und Erstellen von Aufgaben, Filterung nach Priorität/Status, Suche und Wiederholende Aufgaben.

## Anforderungen

### Ansichten (Tab-basiert)
- **Monatsansicht**: 7x5-6 Raster mit Aufgaben-Indikatoren
- **Wochenansicht**: 7 Spalten mit Zeitslots (0:00-23:00)
- **Tagesansicht**: Einzelne Spalte mit detaillierten Zeitslots
- **Listenansicht**: Nach Datum gruppierte Liste (Heute, Diese Woche, Später)
- **Jahresansicht**: 12 Mini-Kalender (4x3 Raster) mit Aufgabenzählern

### Navigation
- "Heute"-Button springt zu aktuellem Datum
- Links/Rechts-Pfeile für Wochen/Monate/Jahre
- Doppelklick auf Tag (Monatsansicht) erstellt neue Aufgabe

### Drag & Drop
- Aufgaben verschieben (ändert dueDate)
- Auf leeren Zeitslot klicken und ziehen → neue Aufgabe mit gewähltem Zeitraum

### Filterung
- Nach Priorität (A, B, C)
- Nach Status (initial nur OPEN, optional DONE/CANCELLED)
- Suche nach Titel oder Beschreibung

### Farbcodierung nach Priorität
- A-Aufgaben: Gelb (#FFEB3B)
- B-Aufgaben: Orange (#FF9800)
- C-Aufgaben: Blau (#2196F3)

### Wiederholende Aufgaben
- Dialog zur Erstellung mehrerer Aufgaben mit gleichem Titel
- Frequenz: Täglich, Wöchentlich, Monatlich
- Anzahl der Wiederholungen oder Enddatum

## Tech Stack & Kontext

**Frontend**:
- Svelte 5.51 + SvelteKit 2.50
- Bits UI (headless components) + Flowbite Svelte
- Tailwind CSS 4 mit oklch-Farben
- TanStack Svelte Query (Datenabruf)
- TanStack Svelte Form (Formulare)

**Backend**:
- Spring Boot 3.5.6 (Java 21)
- PostgreSQL mit bestehenden Task-Endpunkten

**Bestehende Task-Struktur**:
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;  // LocalDate (YYYY-MM-DD)
  dueDate: string;    // LocalDate
  category: 'A' | 'B' | 'C';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
}
```

**Verfügbare API-Endpunkte**:
- GET `/tasks/inbox` - Inbox-Aufgaben abrufen
- POST `/tasks` - Aufgabe erstellen
- PUT `/tasks/{id}` - Aufgabe aktualisieren
- DELETE `/tasks/{id}` - Aufgabe löschen

## Komponenten-Architektur

### Hauptkomponente
**`/src/routes/(protected)/calendar/+page.svelte`**
- Orchestriert alle Ansichten und State
- Verwaltet View-Modus, Filter, Suche
- TanStack Query für Datenabruf

### Neue Feature-Komponenten
**Verzeichnis**: `/src/lib/features/calendar/`

#### Toolbar & Navigation
1. **`calendar-toolbar.svelte`**
   - Tab-Buttons (5 Ansichten)
   - "Heute"-Button, Pfeile (vor/zurück)
   - Filter-Dropdown (Priorität, Status)
   - Suchfeld
   - "Aufgabe erstellen"-Button

#### Ansichten
2. **`calendar-month-view.svelte`**
   - 7x5-6 Raster mit Kalendertagen
   - Aufgaben-Dots/Bars pro Tag
   - Farbcodierung nach Priorität
   - Doppelklick → neue Aufgabe
   - Drag & Drop-Zonen

3. **`calendar-week-view.svelte`**
   - 7 Spalten (Mo-So) mit Stundenraster
   - Aufgaben als Blöcke positioniert
   - Drag-to-Reschedule
   - Drag-to-Create (leere Slots)

4. **`calendar-day-view.svelte`**
   - Einzelne Spalte mit Stundenslots
   - Detaillierte Aufgabeninformationen

5. **`calendar-list-view.svelte`**
   - Gruppiert: "Heute", "Diese Woche", "Später"
   - Ähnlich wie Inbox-View
   - Sortier- und filterbar

6. **`calendar-year-view.svelte`**
   - 12 Mini-Kalender (4x3)
   - Aufgabenzähler pro Monat
   - Klick auf Monat → Monatsansicht

#### Hilfskomponenten
7. **`calendar-task-item.svelte`**
   - Wiederverwendbar für alle Ansichten
   - Farbcodiert nach Priorität
   - Klick → Bearbeiten
   - Draggable

8. **`recurring-task-dialog.svelte`**
   - Formular: Titel, Frequenz, Anzahl/Enddatum
   - Frequenz-Optionen: Täglich, Wöchentlich, Monatlich
   - Batch-Erstellung via API

#### State & Utilities
9. **`calendar-store.ts`**
   - Svelte 5 Runes ($state, $derived)
   - View-Modus, aktuelles Datum, Filter, Suche

10. **`drag-drop.ts`**
    - Custom Svelte Actions für HTML5 Drag & Drop
    - `draggable(node, task)`
    - `dropzone(node, onDrop)`
    - `dragToCreate(node, onCreate)`

11. **`calendar-utils.ts`**
    - Datumshilfen, Farbfunktionen
    - `getPriorityColor(category)` → Tailwind-Klassen

## API-Erweiterungen

### Option 1: Neue Backend-Endpunkte (ideal)
```
GET  /tasks
     Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=OPEN&category=A
     Returns: Task[]

POST /tasks/batch
     Body: CreateTaskInput[]
     Returns: Task[]
```

### Option 2: Frontend-Workaround (falls Backend nicht änderbar)
- Alle Aufgaben über `/tasks/inbox` abrufen
- Client-seitige Filterung nach Datumsbereich
- Wiederholende Aufgaben via Loop mit POST `/tasks`

### TanStack Query Erweiterungen
**In `/src/lib/features/tasks/queries.ts`**:
```typescript
// Alle Aufgaben für Kalender
export const allTasksQuery = () => createQuery({
  queryKey: ['tasks', 'all'],
  queryFn: fetchAllTasks
});

// Batch-Erstellung für wiederholende Aufgaben
export const batchCreateTasksMutation = () => {
  const queryClient = useQueryClient();
  return createMutation({
    mutationFn: batchCreateTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  }, queryClient);
};
```

**In `/src/lib/api/tasks.ts`**:
```typescript
export async function fetchAllTasks(): Promise<Task[]>
export async function batchCreateTasks(inputs: CreateTaskInput[]): Promise<Task[]>
```

## Farbcodierung

### CSS Custom Properties
**In `/src/routes/layout.css`** ergänzen:
```css
:root {
  /* Priorität A - Gelb */
  --priority-a: oklch(0.9 0.15 100);
  --priority-a-dark: oklch(0.8 0.2 100);

  /* Priorität B - Orange */
  --priority-b: oklch(0.85 0.15 50);
  --priority-b-dark: oklch(0.75 0.2 50);

  /* Priorität C - Blau */
  --priority-c: oklch(0.85 0.15 250);
  --priority-c-dark: oklch(0.65 0.2 250);
}

.dark {
  --priority-a: oklch(0.5 0.2 100);
  --priority-b: oklch(0.55 0.18 50);
  --priority-c: oklch(0.6 0.18 250);
  /* ... */
}
```

### Utility-Funktion
```typescript
// calendar-utils.ts
export function getPriorityColor(category: TaskPriorityCategory): string {
  const colors = {
    A: 'bg-[var(--priority-a)] border-[var(--priority-a-dark)]',
    B: 'bg-[var(--priority-b)] border-[var(--priority-b-dark)]',
    C: 'bg-[var(--priority-c)] border-[var(--priority-c-dark)]'
  };
  return colors[category];
}
```

## State Management

### Lokaler State (Svelte 5 Runes)
```typescript
let view = $state<'month' | 'week' | 'day' | 'list' | 'year'>('month');
let currentDate = $state(new Date());
let selectedPriorities = $state<Set<'A' | 'B' | 'C'>>(new Set(['A', 'B', 'C']));
let selectedStatuses = $state<Set<TaskStatus>>(new Set(['OPEN']));
let showCompleted = $state(false);
let searchQuery = $state('');

// Derived state für gefilterte Aufgaben
const allTasks = $derived($tasksQuery.data ?? []);
const filteredTasks = $derived(
  allTasks.filter(task =>
    selectedPriorities.has(task.category) &&
    selectedStatuses.has(task.status) &&
    (showCompleted || !['DONE', 'CANCELLED'].includes(task.status)) &&
    (!searchQuery ||
     task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     task.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )
);
```

### Optimistic Updates (Drag & Drop)
```typescript
const updateMutation = updateTaskMutation();

function handleDrop(task: Task, newDate: string) {
  updateMutation.mutate(
    { id: task.id, input: { ...task, dueDate: newDate } },
    {
      // Optimistisch UI aktualisieren
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ['tasks'] });
        // Snapshot für Rollback
      },
      onError: (err, variables, context) => {
        // Rollback bei Fehler
      }
    }
  );
}
```

## Drag & Drop Implementierung

### Strategie: Custom HTML5 Drag & Drop API
Keine zusätzlichen Dependencies, nutzt native Browser-API + Svelte Actions.

### Drag Actions
**`drag-drop.ts`**:
```typescript
export function draggable(node: HTMLElement, task: Task) {
  node.draggable = true;
  node.ondragstart = (e) => {
    e.dataTransfer?.setData('application/json', JSON.stringify(task));
  };
}

export function dropzone(node: HTMLElement, onDrop: (task: Task, date: string) => void) {
  node.ondragover = (e) => e.preventDefault();
  node.ondrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer?.getData('application/json');
    if (data) {
      const task = JSON.parse(data);
      onDrop(task, node.dataset.date!);
    }
  };
}

export function dragToCreate(node: HTMLElement, onCreate: (start: string, end: string) => void) {
  let startY: number;
  let startTime: string;

  node.onmousedown = (e) => {
    startY = e.clientY;
    startTime = calculateTimeFromY(e.clientY);
  };

  node.onmouseup = (e) => {
    const endTime = calculateTimeFromY(e.clientY);
    if (Math.abs(e.clientY - startY) > 20) {
      onCreate(startTime, endTime);
    }
  };
}
```

## Wiederholende Aufgaben

### Dialog-Komponente
**`recurring-task-dialog.svelte`**:
- TanStack Svelte Form
- Felder: Titel, Beschreibung, Startdatum, Frequenz, Anzahl, Priorität
- Button "Wiederholende Aufgabe erstellen"

### Generierungs-Logik
```typescript
// recurring-utils.ts
interface RecurringTaskInput {
  title: string;
  description: string;
  startDate: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  occurrences: number;
  category: TaskPriorityCategory;
  status: TaskStatus;
}

export function generateRecurringTasks(input: RecurringTaskInput): CreateTaskInput[] {
  const tasks: CreateTaskInput[] = [];
  let currentDate = new Date(input.startDate);

  for (let i = 0; i < input.occurrences; i++) {
    tasks.push({
      title: input.title,
      description: input.description,
      startDate: formatDate(currentDate),
      dueDate: formatDate(currentDate),
      category: input.category,
      status: input.status
    });

    // Datum inkrementieren
    if (input.frequency === 'daily') currentDate.setDate(currentDate.getDate() + 1);
    else if (input.frequency === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
    else if (input.frequency === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return tasks;
}
```

### Batch-Erstellung
```typescript
const batchMutation = batchCreateTasksMutation();

async function createRecurring(input: RecurringTaskInput) {
  const taskInputs = generateRecurringTasks(input);
  batchMutation.mutate(taskInputs);
}
```

## Implementierungs-Schritte

### Phase 1: Foundation
1. CSS-Variablen für Prioritätsfarben in `layout.css`
2. `calendar-store.ts` mit State-Management
3. `calendar-utils.ts` mit Hilfsfunktionen
4. API-Funktionen in `tasks.ts` erweitern (`fetchAllTasks`, `batchCreateTasks`)
5. TanStack Query Hooks in `queries.ts` ergänzen

### Phase 2: Toolbar & Navigation
6. `calendar-toolbar.svelte` bauen (Tabs, Heute, Pfeile, Filter, Suche)
7. Filter-Dropdown mit Checkboxen (Priorität, Status)
8. Suchfeld mit Debouncing
9. Navigation-Logik (heute springen, vor/zurück)

### Phase 3: Listenansicht (einfachster Start)
10. `calendar-list-view.svelte` (ähnlich Inbox)
11. Gruppierung nach Datum ("Heute", "Diese Woche", "Später")
12. `calendar-task-item.svelte` mit Farbcodierung
13. Filterung & Suche testen

### Phase 4: Monatsansicht
14. `calendar-month-view.svelte` mit 7x5-6 Raster
15. Bestehende Calendar-UI-Komponenten nutzen
16. Aufgaben-Indikatoren in Tageszellen
17. Doppelklick → Dialog öffnen
18. Basic Drag & Drop (Task verschieben)

### Phase 5: Wochen- & Tagesansicht
19. `calendar-week-view.svelte` mit Zeitraster (0:00-23:00)
20. Aufgaben als Blöcke in Zeitslots positionieren
21. `calendar-day-view.svelte` (vereinfachte Wochenansicht)
22. Drag-to-Reschedule
23. Drag-to-Create (leere Slots)

### Phase 6: Jahresansicht
24. `calendar-year-view.svelte` mit 12 Mini-Kalendern (4x3)
25. Aufgabenzähler pro Monat
26. Klick auf Monat → Monatsansicht

### Phase 7: Wiederholende Aufgaben
27. `recurring-task-dialog.svelte` mit Formular
28. `recurring-utils.ts` mit Generierungs-Logik
29. Batch-API-Endpunkt oder Loop mit POST /tasks
30. Integration in Toolbar ("Wiederholen"-Button)

### Phase 8: Drag & Drop Verfeinerung
31. `drag-drop.ts` mit Custom Actions
32. Visuelles Feedback beim Dragging
33. Optimistic Updates mit TanStack Query
34. Edge-Cases testen (außerhalb Kalender, Abbruch)

### Phase 9: Polishing
35. Loading-States für alle Queries
36. Fehlerbehandlung & Toasts
37. Responsive Design (Mobile: nur Liste, Tablet/Desktop: alle Ansichten)
38. Accessibility (Tastatur-Navigation, ARIA-Labels)
39. Deutsche Übersetzungen vervollständigen
40. Performance-Optimierung (Virtualisierung bei vielen Aufgaben)

## Kritische Dateien

### Zu modifizieren:
1. `/src/routes/(protected)/calendar/+page.svelte` - Hauptkomponente
2. `/src/lib/features/tasks/queries.ts` - Query-Hooks erweitern
3. `/src/lib/api/tasks.ts` - API-Funktionen ergänzen
4. `/src/routes/layout.css` - CSS-Variablen für Farben

### Neu zu erstellen:
5. `/src/lib/features/calendar/calendar-toolbar.svelte`
6. `/src/lib/features/calendar/calendar-month-view.svelte`
7. `/src/lib/features/calendar/calendar-week-view.svelte`
8. `/src/lib/features/calendar/calendar-day-view.svelte`
9. `/src/lib/features/calendar/calendar-list-view.svelte`
10. `/src/lib/features/calendar/calendar-year-view.svelte`
11. `/src/lib/features/calendar/calendar-task-item.svelte`
12. `/src/lib/features/calendar/recurring-task-dialog.svelte`
13. `/src/lib/features/calendar/calendar-store.ts`
14. `/src/lib/features/calendar/drag-drop.ts`
15. `/src/lib/features/calendar/calendar-utils.ts`
16. `/src/lib/features/calendar/recurring-utils.ts`

## Verifikation

### End-to-End Tests:
1. **Navigation**: Heute-Button, Pfeile vor/zurück funktionieren in allen Ansichten
2. **Ansichten**: Alle 5 Tabs (Monat, Woche, Tag, Liste, Jahr) wechseln korrekt
3. **Aufgaben anzeigen**: Aufgaben erscheinen in allen Ansichten mit korrekter Farbcodierung
4. **Filterung**:
   - Priorität A/B/C Filter aktivieren/deaktivieren
   - Status-Filter (initial nur OPEN, dann auch DONE/CANCELLED)
5. **Suche**: Titelsuche findet Aufgaben, Beschreibungssuche funktioniert
6. **Drag & Drop Verschieben**:
   - Aufgabe auf neuen Tag ziehen → dueDate aktualisiert
   - API-Call erfolgreich, UI optimistisch aktualisiert
7. **Drag & Drop Erstellen**:
   - Leeren Slot in Woche/Tag ziehen → Dialog öffnet mit vorausgefülltem Datum
   - Aufgabe wird erstellt
8. **Doppelklick (Monat)**: Auf Tag doppelklicken → Dialog öffnet
9. **Wiederholende Aufgaben**:
   - Dialog öffnen, Frequenz wählen (täglich/wöchentlich/monatlich)
   - 5 Aufgaben erstellen → 5 Einträge im Kalender
10. **Responsive**: Mobile zeigt nur Liste, Desktop alle Ansichten
11. **Backend-Aufrufe**:
    - GET /tasks/inbox (oder GET /tasks) lädt Aufgaben
    - PUT /tasks/{id} nach Drag & Drop
    - POST /tasks oder POST /tasks/batch für wiederholende Aufgaben

### Manuelle Tests:
- Kalender öffnen: `./mvnw spring-boot:run` (Backend), dann Frontend
- In Browser zu http://localhost:5173/calendar navigieren
- Alle Ansichten durchklicken
- Filter und Suche testen
- Aufgaben erstellen, verschieben, bearbeiten
- Farbcodierung A (gelb), B (orange), C (blau) visuell prüfen
- Dark Mode testen (Farben passen sich an)

### Performance-Checks:
- 100+ Aufgaben: Listenansicht scrollt flüssig
- Monatsansicht zeigt max 3 Aufgaben pro Tag ("+X mehr" Indikator)
- Suchfeld reagiert mit <300ms Delay (Debouncing)
