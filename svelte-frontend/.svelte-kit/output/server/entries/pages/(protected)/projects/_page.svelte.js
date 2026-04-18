import { l as attr, h as ensure_array_like, e as escape_html, m as attr_class, k as stringify, r as attr_style, d as derived, t as head, g as store_get, i as unsubscribe_stores } from "../../../../chunks/index.js";
import { p as page } from "../../../../chunks/index3.js";
import { p as projectStore } from "../../../../chunks/project-store.js";
import { B as Button } from "../../../../chunks/button.js";
import "../../../../chunks/create-task-dialog-store.js";
import "../../../../chunks/toast-store.js";
import { C as Chevron_right } from "../../../../chunks/chevron-right.js";
import { C as Chevron_down, T as Trash_2 } from "../../../../chunks/trash-2.js";
import { C as Circle_check_big, a as Circle } from "../../../../chunks/circle-check-big.js";
function Project_gantt_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const DAY_MS = 24 * 60 * 60 * 1e3;
    const INDENT_STEP = 22;
    const COLUMN_COUNT = 180;
    const CENTER_INDEX = Math.floor(COLUMN_COUNT / 2);
    let { lists, onCreateCard } = $$props;
    let scale = "week";
    let searchQuery = "";
    let statusFilter = "all";
    let selectedListId = "all";
    let columnWidth = 90;
    let quickCreateTitle = "";
    let collapsed = {};
    let dropState = null;
    let timelineAnchor = startOfUnit(/* @__PURE__ */ new Date());
    function toDayStartMs(value) {
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    function parseDateMs(value) {
      if (!value) return null;
      const ms = new Date(value).getTime();
      if (Number.isNaN(ms)) return null;
      return toDayStartMs(ms);
    }
    function startOfUnit(date, view) {
      const d = new Date(date);
      d.setMilliseconds(0);
      d.setSeconds(0);
      d.setMinutes(0);
      d.setHours(0);
      {
        const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day);
      }
      return d;
    }
    function addUnit(date, view, count) {
      const d = new Date(date);
      d.setDate(d.getDate() + count * 7);
      return d;
    }
    function formatColumnLabel(start, view) {
      return start.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
    }
    function rowShade(level) {
      if (level <= 0) return "";
      const alpha = Math.min(0.05 + level * 0.035, 0.24);
      return `background-color: hsl(var(--primary) / ${alpha});`;
    }
    function barShade(level, done) {
      const lightness = Math.max(44, 64 - level * 5);
      const borderLightness = Math.max(34, lightness - 9);
      const opacity = done ? 0.45 : 0.92;
      return `background-color: hsl(38 95% ${lightness}% / ${opacity}); border-color: hsl(38 85% ${borderLightness}%);`;
    }
    function buildRows(cards, listId) {
      const byId = new Map(cards.map((card) => [card.id, card]));
      const children = /* @__PURE__ */ new Map();
      for (const card of cards) {
        const parentId = card.parentId && byId.has(card.parentId) ? card.parentId : null;
        const existing = children.get(parentId) ?? [];
        existing.push(card);
        children.set(parentId, existing);
      }
      for (const entry of children.values()) {
        entry.sort((a, b) => a.order - b.order);
      }
      const rows = [];
      const visited = /* @__PURE__ */ new Set();
      function visit(card, level) {
        if (visited.has(card.id)) return;
        visited.add(card.id);
        rows.push({
          listId,
          card,
          level,
          hasChildren: (children.get(card.id)?.length ?? 0) > 0
        });
        for (const child of children.get(card.id) ?? []) {
          visit(child, level + 1);
        }
      }
      for (const root of children.get(null) ?? []) {
        visit(root, 0);
      }
      for (const card of cards) {
        if (!visited.has(card.id)) {
          visit(card, 0);
        }
      }
      return rows;
    }
    const allRows = derived(() => {
      const rows = [];
      for (const list of lists) {
        rows.push(...buildRows([...list.cards].sort((a, b) => a.order - b.order), list.id));
      }
      return rows;
    });
    function passesFilters(row) {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!row.card.title.toLowerCase().includes(q) && !row.card.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }
    function hasCollapsedAncestor(row) {
      const list = lists.find((entry) => entry.id === row.listId);
      if (!list) return false;
      const byId = new Map(list.cards.map((card) => [card.id, card]));
      let parent = row.card.parentId;
      while (parent) {
        if (collapsed[parent]) return true;
        parent = byId.get(parent)?.parentId ?? null;
      }
      return false;
    }
    const visibleRows = derived(() => allRows().filter((row) => passesFilters(row) && !hasCollapsedAncestor(row)));
    const columns = derived(() => {
      const cols = [];
      const base = startOfUnit(timelineAnchor);
      let cursor = addUnit(base, scale, -CENTER_INDEX);
      for (let i = 0; i < COLUMN_COUNT; i += 1) {
        const next = addUnit(cursor, scale, 1);
        cols.push({
          start: cursor,
          end: next,
          label: formatColumnLabel(cursor)
        });
        cursor = next;
      }
      return cols;
    });
    const timelineWidth = derived(() => Math.max(columns().length * columnWidth, 700));
    const rangeStartMs = derived(() => columns()[0]?.start.getTime() ?? Date.now());
    const rangeEndMs = derived(() => columns()[columns().length - 1]?.end.getTime() ?? Date.now() + DAY_MS);
    const rangeMs = derived(() => Math.max(rangeEndMs() - rangeStartMs(), DAY_MS));
    function msToPx(ms) {
      return (ms - rangeStartMs()) / rangeMs() * timelineWidth();
    }
    function getRowRange(row) {
      const startMs = parseDateMs(row.card.startDate);
      const endMs = parseDateMs(row.card.dueDate);
      if (startMs === null || endMs === null) return null;
      return {
        startMs: Math.min(startMs, endMs),
        endMs: Math.max(startMs, endMs)
      };
    }
    function getDisplayEndMs(endMs) {
      return endMs + DAY_MS;
    }
    function getPreviewRange(row) {
      {
        return getRowRange(row);
      }
    }
    function quickCreateCard() {
      const title = quickCreateTitle.trim();
      if (!title) return;
      const created = onCreateCard(null, title);
      if (created) {
        quickCreateTitle = "";
      }
    }
    $$renderer2.push(`<div class="flex min-h-0 flex-1 flex-col gap-3"><div class="flex flex-wrap items-center gap-2"><input type="text"${attr("value", searchQuery)} placeholder="Aufgaben filtern..." class="h-9 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"/> `);
    $$renderer2.select(
      {
        value: statusFilter,
        class: "h-9 rounded-md border border-input bg-background px-3 text-sm"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "all" }, ($$renderer4) => {
          $$renderer4.push(`Alle Status`);
        });
        $$renderer3.option({ value: "open" }, ($$renderer4) => {
          $$renderer4.push(`Offen`);
        });
        $$renderer3.option({ value: "done" }, ($$renderer4) => {
          $$renderer4.push(`Abgeschlossen`);
        });
      }
    );
    $$renderer2.push(` `);
    $$renderer2.select(
      {
        value: selectedListId,
        class: "h-9 rounded-md border border-input bg-background px-3 text-sm"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "all" }, ($$renderer4) => {
          $$renderer4.push(`Alle Listen`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(lists);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let list = each_array[$$index];
          $$renderer3.option({ value: list.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(list.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <div class="ml-auto flex flex-wrap items-center gap-2">`);
    $$renderer2.select(
      {
        value: scale,
        class: "h-9 rounded-md border border-input bg-background px-3 text-sm"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "day" }, ($$renderer4) => {
          $$renderer4.push(`Tage`);
        });
        $$renderer3.option({ value: "week" }, ($$renderer4) => {
          $$renderer4.push(`Wochen`);
        });
        $$renderer3.option({ value: "month" }, ($$renderer4) => {
          $$renderer4.push(`Monate`);
        });
        $$renderer3.option({ value: "quarter" }, ($$renderer4) => {
          $$renderer4.push(`Quartale`);
        });
        $$renderer3.option({ value: "year" }, ($$renderer4) => {
          $$renderer4.push(`Jahre`);
        });
      }
    );
    $$renderer2.push(` <button type="button" class="rounded-md border border-border px-3 py-1.5 text-xs">Heute</button> <div class="flex items-center gap-2 text-xs text-muted-foreground"><input type="range" min="44" max="220" step="2"${attr("value", columnWidth)} aria-label="Spaltenbreite"/></div></div></div> <div class="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-card/40"><div class="grid h-full min-w-[980px] grid-cols-[420px_1fr]"><div class="flex min-h-0 flex-col border-r border-border"><div class="sticky top-0 z-20 grid grid-cols-[1fr] border-b border-border bg-card/95 px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur"><span>Aufgabe</span></div> <div class="min-h-0 flex-1 overflow-auto">`);
    if (visibleRows().length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-4 text-sm text-muted-foreground">Keine Aufgaben für den aktuellen Filter.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(visibleRows());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let row = each_array_1[$$index_1];
        $$renderer2.push(`<div role="listitem"${attr_class(`grid h-10 grid-cols-[1fr] items-center border-b border-border/70 px-3 text-sm ${stringify(dropState?.targetId === row.card.id ? "bg-primary/10" : "")}`)}${attr_style(rowShade(row.level))}${attr("draggable", true)}><div class="flex min-w-0 items-center gap-2"${attr_style(`padding-left: ${row.level * INDENT_STEP}px;`)}>`);
        if (row.hasChildren) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button type="button" class="text-muted-foreground hover:text-foreground" aria-label="Unteraufgaben ein-/ausblenden">`);
          if (collapsed[row.card.id]) {
            $$renderer2.push("<!--[-->");
            Chevron_right($$renderer2, { class: "size-4" });
          } else {
            $$renderer2.push("<!--[!-->");
            Chevron_down($$renderer2, { class: "size-4" });
          }
          $$renderer2.push(`<!--]--></button>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span class="inline-block size-4"></span>`);
        }
        $$renderer2.push(`<!--]--> <button type="button" class="text-muted-foreground hover:text-foreground">`);
        if (row.card.done) {
          $$renderer2.push("<!--[-->");
          Circle_check_big($$renderer2, { class: "size-4" });
        } else {
          $$renderer2.push("<!--[!-->");
          Circle($$renderer2, { class: "size-4" });
        }
        $$renderer2.push(`<!--]--></button> <button type="button"${attr_class(`min-w-0 truncate text-left ${stringify(row.card.done ? "text-muted-foreground line-through" : "")}`)}>${escape_html(row.card.title)}</button></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="border-t border-border bg-card/95 p-3 backdrop-blur"><div class="flex gap-2"><input type="text"${attr("value", quickCreateTitle)} placeholder="Aufgabe hinzufügen" class="h-8 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"/> `);
    Button($$renderer2, {
      class: "shrink-0",
      size: "sm",
      variant: "outline",
      onclick: quickCreateCard,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->+`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div></div> <div class="min-h-0 overflow-auto"><div${attr_style(`width: ${timelineWidth()}px; min-height: 100%; background-image: linear-gradient(to right, hsl(var(--border) / 0.85) 1px, transparent 1px); background-size: ${columnWidth}px 100%;`)}><div class="sticky top-0 z-20 grid h-10 border-b border-border bg-card/95 text-xs text-muted-foreground backdrop-blur"${attr_style(`grid-template-columns: repeat(${columns().length}, minmax(0, 1fr));`)}><!--[-->`);
    const each_array_2 = ensure_array_like(columns());
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let column = each_array_2[$$index_2];
      $$renderer2.push(`<div class="flex items-center justify-center border-r border-border px-1">${escape_html(column.label)}</div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (visibleRows().length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-4 text-sm text-muted-foreground">Keine Zeitleiste verfügbar.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_3 = ensure_array_like(visibleRows());
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let row = each_array_3[$$index_3];
        $$renderer2.push(`<div role="presentation" class="relative h-10 border-b border-border/70"${attr_style(rowShade(row.level))}>`);
        if (getPreviewRange(row)) {
          $$renderer2.push("<!--[-->");
          const range = getPreviewRange(row);
          $$renderer2.push(`<div data-bar="" role="button" class="absolute top-1.5 h-7 cursor-move rounded-full border px-2 text-xs leading-7 text-amber-950"${attr_style(`${barShade(row.level, row.card.done)} left: ${msToPx(range.startMs)}px; width: ${Math.max(msToPx(getDisplayEndMs(range.endMs)) - msToPx(range.startMs), 12)}px;`)}><div class="truncate pr-2">${escape_html(row.card.title)}</div> <button type="button" data-bar="" class="absolute top-0 left-0 h-full w-2 cursor-ew-resize rounded-l-full bg-amber-500/70" aria-label="Startzeit anpassen"></button> <button type="button" data-bar="" class="absolute top-0 right-0 h-full w-2 cursor-ew-resize rounded-r-full bg-amber-500/70" aria-label="Endzeit anpassen"></button></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const projectState = derived(() => store_get($$store_subs ??= {}, "$projectStore", projectStore));
    const projects = derived(() => projectState().projects);
    const selectedProjectId = derived(() => page.url.searchParams.get("project") ?? projects()[0]?.id ?? null);
    const selectedProject = derived(() => projects().find((project) => project.id === selectedProjectId()) ?? null);
    let viewMode = "board";
    let newListName = "";
    let newCardTitleByList = {};
    function setViewMode(mode) {
      viewMode = mode;
      return;
    }
    function addList() {
      if (!selectedProject()) return;
      projectStore.addList(selectedProject().id, newListName);
      newListName = "";
    }
    function addCard(listId) {
      if (!selectedProject()) return;
      const title = (newCardTitleByList[listId] ?? "").trim();
      if (!title) return;
      projectStore.addCard(selectedProject().id, listId, title);
      newCardTitleByList = { ...newCardTitleByList, [listId]: "" };
    }
    function createCardFromGantt(preferredListId, title) {
      const project = selectedProject();
      if (!project) return false;
      const fallbackListId = project.lists[0]?.id;
      const targetListId = preferredListId ?? fallbackListId;
      if (!targetListId) return false;
      const createdCardId = projectStore.addCard(project.id, targetListId, title);
      return Boolean(createdCardId);
    }
    head("1y2z969", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Projekte | Venera</title>`);
      });
    });
    $$renderer2.push(`<section class="relative z-10 flex h-full flex-col gap-4"><header class="flex flex-wrap items-center justify-between gap-3"><div class="space-y-1"><h2 class="text-2xl font-semibold">${escape_html(selectedProject()?.name ?? "Projekte")}</h2> `);
    if (selectedProject()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-sm text-muted-foreground">${escape_html(selectedProject().description || "Keine Beschreibung")}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-sm text-muted-foreground">Erstelle in der Sidebar dein erstes Projekt.</p>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex flex-wrap items-center justify-end gap-2">`);
    Button($$renderer2, {
      variant: viewMode === "list" ? "default" : "outline",
      size: "sm",
      onclick: () => setViewMode("list"),
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Liste`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: viewMode === "board" ? "default" : "outline",
      size: "sm",
      onclick: () => setViewMode("board"),
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Board`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: viewMode === "gantt" ? "default" : "outline",
      size: "sm",
      onclick: () => setViewMode("gantt"),
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Gantt`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></header> `);
    if (!selectedProject()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">Kein Projekt ausgewählt.</div>`);
    } else if (viewMode === "gantt") {
      $$renderer2.push("<!--[1-->");
      Project_gantt_view($$renderer2, {
        projectId: selectedProject().id,
        lists: selectedProject().lists,
        onCreateCard: createCardFromGantt
      });
    } else if (viewMode === "board") {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden pb-2"><div class="flex h-full items-start gap-3 pr-4"><!--[-->`);
      const each_array = ensure_array_like(selectedProject().lists);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let list = each_array[$$index_1];
        $$renderer2.push(`<div role="region"${attr("aria-label", `Drop-Zone für Liste ${stringify(list.name)}`)} class="flex h-full max-h-full w-[300px] shrink-0 flex-col rounded-lg border border-border bg-card/50"><div class="flex items-center justify-between border-b border-border px-3 py-2"><h3 class="font-medium">${escape_html(list.name)}</h3> <div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">${escape_html(list.cards.length)}</span> <button type="button" class="text-muted-foreground hover:text-foreground"${attr("disabled", selectedProject().lists.length <= 1, true)}${attr("aria-label", `Liste ${list.name} löschen`)}>`);
        Trash_2($$renderer2, { class: "size-4" });
        $$renderer2.push(`<!----></button></div></div> <div class="flex flex-1 flex-col gap-2 overflow-auto p-3"><!--[-->`);
        const each_array_1 = ensure_array_like(list.cards);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let card = each_array_1[$$index];
          $$renderer2.push(`<div${attr("draggable", true)}${attr("aria-label", `Aufgabe ${stringify(card.title)}`)} class="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2"><button type="button" class="text-muted-foreground hover:text-foreground">`);
          if (card.done) {
            $$renderer2.push("<!--[-->");
            Circle_check_big($$renderer2, { class: "size-4" });
          } else {
            $$renderer2.push("<!--[!-->");
            Circle($$renderer2, { class: "size-4" });
          }
          $$renderer2.push(`<!--]--></button> <span${attr_class(`text-sm ${stringify(card.done ? "text-muted-foreground line-through" : "")}`)}>${escape_html(card.title)}</span></div>`);
        }
        $$renderer2.push(`<!--]--> <div class="mt-1 flex gap-2"><input type="text"${attr("value", newCardTitleByList[list.id] ?? "")} placeholder="Aufgabe hinzufügen" class="h-8 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"/> `);
        Button($$renderer2, {
          size: "sm",
          variant: "outline",
          onclick: () => addCard(list.id),
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->+`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div></div></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="flex h-fit w-[300px] shrink-0 flex-col rounded-lg border border-dashed border-border bg-card/30 py-3"><h3 class="mb-2 border-b border-border px-3 pb-2 text-sm font-medium">Neue Liste</h3> <div class="mt-2 flex gap-2 px-3"><input type="text"${attr("value", newListName)} placeholder="Listenname" class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"/> `);
      Button($$renderer2, {
        size: "sm",
        onclick: addList,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->+`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="min-h-0 flex-1 space-y-3 overflow-auto pb-2"><!--[-->`);
      const each_array_2 = ensure_array_like(selectedProject().lists);
      for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
        let list = each_array_2[$$index_3];
        $$renderer2.push(`<div class="rounded-lg border border-border bg-card/50 p-3"><div class="mb-2 flex items-center justify-between"><h3 class="font-medium">${escape_html(list.name)}</h3> <div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">${escape_html(list.cards.length)}</span> <button type="button" class="text-muted-foreground hover:text-foreground"${attr("disabled", selectedProject().lists.length <= 1, true)}${attr("aria-label", `Liste ${list.name} löschen`)}>`);
        Trash_2($$renderer2, { class: "size-4" });
        $$renderer2.push(`<!----></button></div></div> <ul class="space-y-2"><!--[-->`);
        const each_array_3 = ensure_array_like(list.cards);
        for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
          let card = each_array_3[$$index_2];
          $$renderer2.push(`<li class="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2"><button type="button" class="text-muted-foreground hover:text-foreground">`);
          if (card.done) {
            $$renderer2.push("<!--[-->");
            Circle_check_big($$renderer2, { class: "size-4" });
          } else {
            $$renderer2.push("<!--[!-->");
            Circle($$renderer2, { class: "size-4" });
          }
          $$renderer2.push(`<!--]--></button> <span${attr_class(`text-sm ${stringify(card.done ? "text-muted-foreground line-through" : "")}`)}>${escape_html(card.title)}</span></li>`);
        }
        $$renderer2.push(`<!--]--></ul> <div class="mt-3 flex gap-2"><input type="text"${attr("value", newCardTitleByList[list.id] ?? "")} placeholder="Aufgabe hinzufügen" class="h-8 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"/> `);
        Button($$renderer2, {
          size: "sm",
          variant: "outline",
          onclick: () => addCard(list.id),
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->+`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div></div>`);
      }
      $$renderer2.push(`<!--]--> <div class="sticky bottom-0 rounded-lg border border-dashed border-border bg-card/30"><div class="flex gap-2"><input type="text"${attr("value", newListName)} placeholder="Neue Liste" class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"/> `);
      Button($$renderer2, {
        size: "sm",
        onclick: addList,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Liste hinzufügen`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
