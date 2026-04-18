import { c as spread_props, e as escape_html, g as store_get, h as ensure_array_like, m as attr_class, k as stringify, l as attr, i as unsubscribe_stores, d as derived, t as head } from "../../../../../chunks/index.js";
import { B as Button } from "../../../../../chunks/button.js";
import { g as allTasksQuery, d as updateTaskMutation } from "../../../../../chunks/queries.js";
import { I as Icon } from "../../../../../chunks/create-task-dialog-store.js";
import { i as isToday, c as getWeekdayName, h as extractDatePart, j as getWeekDates, f as formatISODate } from "../../../../../chunks/calendar-utils.js";
import { C as Chevron_left } from "../../../../../chunks/chevron-left.js";
import { C as Chevron_right } from "../../../../../chunks/chevron-right.js";
import { C as Circle_check_big, a as Circle } from "../../../../../chunks/circle-check-big.js";
function Grip_vertical($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["circle", { "cx": "9", "cy": "12", "r": "1" }],
      ["circle", { "cx": "9", "cy": "5", "r": "1" }],
      ["circle", { "cx": "9", "cy": "19", "r": "1" }],
      ["circle", { "cx": "15", "cy": "12", "r": "1" }],
      ["circle", { "cx": "15", "cy": "5", "r": "1" }],
      ["circle", { "cx": "15", "cy": "19", "r": "1" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "grip-vertical" },
      /**
       * @component @name GripVertical
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjUiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjE5IiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iMTUiIGN5PSI1IiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTkiIHI9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/grip-vertical
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Calendar_priority_week_board($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const SLOT_LIMITS = { A: 2, B: 3, C: 3 };
    const CATEGORY_ORDER = ["A", "B", "C"];
    const tasksQuery = allTasksQuery();
    updateTaskMutation();
    let anchorDate = /* @__PURE__ */ new Date();
    let laneOrderState = {};
    let optimisticTasks = {};
    const tasks = derived(() => (store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).data ?? []).map((task) => ({ ...task, ...optimisticTasks[task.id] ?? {} })).filter((task) => task.status !== "CANCELLED"));
    const weekDates = derived(() => getWeekDates(anchorDate));
    const weekDateStrings = derived(() => weekDates().map((date) => formatISODate(date)));
    const weekRangeLabel = derived(() => {
      const start = weekDates()[0];
      const end = weekDates()[6];
      if (!start || !end) return "";
      const startLabel = start.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      const endLabel = end.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
      return `${startLabel} - ${endLabel}`;
    });
    function getTaskDate(task) {
      const startDate = extractDatePart(task.startDate);
      if (startDate) return startDate;
      return extractDatePart(task.dueDate);
    }
    function compareTasksFallback(a, b) {
      const aTime = `${a.startDate || ""}|${a.dueDate || ""}`;
      const bTime = `${b.startDate || ""}|${b.dueDate || ""}`;
      return aTime.localeCompare(bTime) || a.title.localeCompare(b.title, "de");
    }
    function getTasksForDate(dateStr) {
      return tasks().filter((task) => getTaskDate(task) === dateStr);
    }
    function getOrderedLaneTasks(dateStr, category) {
      const laneTasks = getTasksForDate(dateStr).filter((task) => task.category === category);
      const order = laneOrderState[dateStr]?.[category] ?? [];
      const orderIndex = new Map(order.map((id, index) => [id, index]));
      return [...laneTasks].sort((a, b) => {
        const aIdx = orderIndex.get(a.id);
        const bIdx = orderIndex.get(b.id);
        if (aIdx !== void 0 && bIdx !== void 0) return aIdx - bIdx;
        if (aIdx !== void 0) return -1;
        if (bIdx !== void 0) return 1;
        return compareTasksFallback(a, b);
      });
    }
    function getSlotTasks(dateStr, category) {
      return getOrderedLaneTasks(dateStr, category).slice(0, SLOT_LIMITS[category]);
    }
    function getOverflowTasks(dateStr) {
      const slotIds = new Set(CATEGORY_ORDER.flatMap((category) => getSlotTasks(dateStr, category).map((task) => task.id)));
      return getTasksForDate(dateStr).filter((task) => !slotIds.has(task.id)).sort((a, b) => {
        const categoryCmp = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
        if (categoryCmp !== 0) return categoryCmp;
        return compareTasksFallback(a, b);
      });
    }
    function formatTaskDay(task) {
      const rawDate = getTaskDate(task);
      if (!rawDate) return "ohne Datum";
      const date = new Date(rawDate);
      return date.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
    }
    function formatMinutes(minutes) {
      if (minutes === null || minutes === void 0) return "-";
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (rest === 0) return `${hours}h`;
      return `${hours}h ${rest}m`;
    }
    function previousWeek() {
      const next = new Date(anchorDate);
      next.setDate(anchorDate.getDate() - 7);
      anchorDate = next;
    }
    function nextWeek() {
      const next = new Date(anchorDate);
      next.setDate(anchorDate.getDate() + 7);
      anchorDate = next;
    }
    function today() {
      anchorDate = /* @__PURE__ */ new Date();
    }
    $$renderer2.push(`<section class="flex h-full flex-col gap-4 p-4"><header class="flex flex-wrap items-center justify-between gap-3"><div><h1 class="text-2xl font-semibold">Woche</h1> <p class="text-sm text-muted-foreground">${escape_html(weekRangeLabel())}</p></div> <div class="flex items-center gap-2">`);
    Button($$renderer2, {
      variant: "outline",
      size: "icon-sm",
      onclick: previousWeek,
      children: ($$renderer3) => {
        Chevron_left($$renderer3, { class: "size-4" });
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: "outline",
      onclick: today,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Heute`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: "outline",
      size: "icon-sm",
      onclick: nextWeek,
      children: ($$renderer3) => {
        Chevron_right($$renderer3, { class: "size-4" });
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></header> `);
    if (store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">Lade Wochenaufgaben...</div>`);
    } else if (store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).isError) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-sm text-destructive">Fehler beim Laden: ${escape_html(store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).error?.message)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="flex-1 overflow-auto pb-2"><div class="grid min-w-[1500px] grid-cols-7 gap-4"><!--[-->`);
      const each_array = ensure_array_like(weekDates());
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let date = each_array[index];
        const dateStr = weekDateStrings()[index];
        const dayTasks = getTasksForDate(dateStr);
        $$renderer2.push(`<article class="flex min-h-[640px] flex-col rounded-xl border border-border bg-card/40"><header${attr_class(`flex items-center justify-between border-b border-border px-3 py-2 ${stringify(isToday(date) ? "bg-primary/10" : "bg-muted/20")}`)}><div><p class="text-sm font-semibold capitalize">${escape_html(getWeekdayName(date))}</p> <p class="text-xs text-muted-foreground">${escape_html(date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }))}</p></div> <span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">${escape_html(dayTasks.length)}</span></header> <div class="flex-1 space-y-4 px-3 py-3"><!--[-->`);
        const each_array_1 = ensure_array_like(CATEGORY_ORDER);
        for (let $$index_2 = 0, $$length2 = each_array_1.length; $$index_2 < $$length2; $$index_2++) {
          let category = each_array_1[$$index_2];
          $$renderer2.push(`<section class="space-y-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2 text-sm font-medium"><span class="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1 text-xs">${escape_html(category)}</span> <span class="text-muted-foreground">${escape_html(SLOT_LIMITS[category])} Slots</span></div></div> <div class="space-y-2 rounded-lg border border-dashed border-border/80 bg-background/30 p-2" role="group"${attr("aria-label", `Slots ${category} am ${dateStr}`)}><!--[-->`);
          const each_array_2 = ensure_array_like(getSlotTasks(dateStr, category));
          for (let $$index = 0, $$length3 = each_array_2.length; $$index < $$length3; $$index++) {
            let task = each_array_2[$$index];
            $$renderer2.push(`<div role="group"${attr("aria-label", `Drop vor ${task.title}`)}><div${attr_class(`group rounded-lg border border-border bg-card px-2.5 py-2 shadow-xs transition hover:border-primary/30 hover:bg-card/80 ${stringify(task.status === "DONE" ? "opacity-60" : "")}`)}${attr("draggable", true)} role="button"${attr("tabindex", 0)}><div class="flex items-start gap-2"><button type="button" class="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"${attr("aria-label", `Aufgabe ${task.title} abhaken`)}>`);
            if (task.status === "DONE") {
              $$renderer2.push("<!--[-->");
              Circle_check_big($$renderer2, { class: "size-4" });
            } else {
              $$renderer2.push("<!--[!-->");
              Circle($$renderer2, { class: "size-4" });
            }
            $$renderer2.push(`<!--]--></button> <div class="min-w-0 flex-1"><p${attr_class(`truncate text-sm font-medium ${stringify(task.status === "DONE" ? "line-through" : "")}`)}>${escape_html(task.title)}</p> <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground"><span>${escape_html(formatTaskDay(task))}</span> <span>Soll: ${escape_html(formatMinutes(task.estimatedDurationMinutes))}</span> <span>Ist: ${escape_html(formatMinutes(task.actualDurationMinutes))}</span></div></div> `);
            Grip_vertical($$renderer2, { class: "mt-0.5 size-4 shrink-0 text-muted-foreground/60" });
            $$renderer2.push(`<!----></div></div></div>`);
          }
          $$renderer2.push(`<!--]--> <!--[-->`);
          const each_array_3 = ensure_array_like(Array.from({
            length: Math.max(0, SLOT_LIMITS[category] - getSlotTasks(dateStr, category).length)
          }));
          for (let slotIndex = 0, $$length3 = each_array_3.length; slotIndex < $$length3; slotIndex++) {
            each_array_3[slotIndex];
            $$renderer2.push(`<div class="flex min-h-16 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 text-xs text-muted-foreground">Freier Slot</div>`);
          }
          $$renderer2.push(`<!--]--></div></section>`);
        }
        $$renderer2.push(`<!--]--> <section class="space-y-2 border-t border-border pt-2" role="group"${attr("aria-label", `Weitere Aufgaben am ${dateStr}`)}><p class="text-xs font-medium text-muted-foreground">Weitere Aufgaben</p> `);
        if (getOverflowTasks(dateStr).length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="rounded-md border border-dashed border-border/80 px-2 py-2 text-xs text-muted-foreground">Keine weiteren Aufgaben</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="space-y-2"><!--[-->`);
          const each_array_4 = ensure_array_like(getOverflowTasks(dateStr));
          for (let $$index_4 = 0, $$length2 = each_array_4.length; $$index_4 < $$length2; $$index_4++) {
            let task = each_array_4[$$index_4];
            $$renderer2.push(`<div class="rounded-md border border-border bg-background/70 px-2 py-2 transition hover:border-primary/30"${attr("draggable", true)} role="article"><div class="flex items-start gap-2"><button type="button" class="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"${attr("aria-label", `Aufgabe ${task.title} abhaken`)}>`);
            if (task.status === "DONE") {
              $$renderer2.push("<!--[-->");
              Circle_check_big($$renderer2, { class: "size-4" });
            } else {
              $$renderer2.push("<!--[!-->");
              Circle($$renderer2, { class: "size-4" });
            }
            $$renderer2.push(`<!--]--></button> <div class="min-w-0 flex-1 cursor-pointer" role="button"${attr("tabindex", 0)}><p${attr_class(`truncate text-sm font-medium ${stringify(task.status === "DONE" ? "line-through" : "")}`)}>${escape_html(task.title)}</p> <p class="text-[11px] text-muted-foreground">${escape_html(task.category)} · Soll ${escape_html(formatMinutes(task.estimatedDurationMinutes))} · Ist ${escape_html(formatMinutes(task.actualDurationMinutes))}</p></div></div> <div class="mt-2 flex items-center gap-1"><!--[-->`);
            const each_array_5 = ensure_array_like(CATEGORY_ORDER);
            for (let $$index_3 = 0, $$length3 = each_array_5.length; $$index_3 < $$length3; $$index_3++) {
              let category = each_array_5[$$index_3];
              $$renderer2.push(`<button type="button" class="rounded-md border border-border px-2 py-0.5 text-[11px] hover:bg-muted">Als ${escape_html(category)}</button>`);
            }
            $$renderer2.push(`<!--]--></div></div>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></section></div></article>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  head("1t8sr24", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Woche | Venera</title>`);
    });
  });
  Calendar_priority_week_board($$renderer);
}
export {
  _page as default
};
