import { p as props_id, a as attributes, b as bind_props, d as derived, c as spread_props, h as ensure_array_like, m as attr_class, k as stringify, e as escape_html, g as store_get, i as unsubscribe_stores, l as attr, r as attr_style, t as head } from "../../../../chunks/index.js";
import { w as writable } from "../../../../chunks/index2.js";
import { g as getActiveScopeKey, t as teamScopeStore } from "../../../../chunks/client2.js";
import { d as updateTaskMutation, g as allTasksQuery } from "../../../../chunks/queries.js";
import { g as getMonthName, i as isToday, f as formatISODate, a as filterTasksByDate, b as getMonthDates, c as getWeekdayName, d as getPriorityColorVar, e as extractTimePart, h as extractDatePart, j as getWeekDates, k as formatDisplayDate, l as filterTasksBySearch, m as filterTasksByPriorities, n as filterTasksByStatuses } from "../../../../chunks/calendar-utils.js";
import { c as cn, B as Button } from "../../../../chunks/button.js";
import { C as Check, e as Calendar, I as Input, D as Dropdown_menu, a as Dropdown_menu_trigger, b as Dropdown_menu_content, c as Dropdown_menu_label, d as Dropdown_menu_separator, t as timeToMinutes, f as timeToYPosition, g as calculateDuration, h as getTaskTime } from "../../../../chunks/task-time-store.js";
import { c as createId, n as noop, Q as MenuCheckboxGroupContext, w as watch, R as MenuCheckboxItemState, b as boxWith, m as mergeProps } from "../../../../chunks/popper-layer-force-mount.js";
import { I as Icon, c as createTaskDialogStore } from "../../../../chunks/create-task-dialog-store.js";
import "clsx";
import { C as Chevron_left } from "../../../../chunks/chevron-left.js";
import { C as Chevron_right } from "../../../../chunks/chevron-right.js";
import { P as Plus } from "../../../../chunks/plus.js";
import { C as Circle_check_big, a as Circle } from "../../../../chunks/circle-check-big.js";
function Menu_checkbox_item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      child,
      children,
      ref = null,
      checked = false,
      id = createId(uid),
      onCheckedChange = noop,
      disabled = false,
      onSelect = noop,
      closeOnSelect = true,
      indeterminate = false,
      onIndeterminateChange = noop,
      value = "",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const group = MenuCheckboxGroupContext.getOr(null);
    if (group && value) {
      if (group.opts.value.current.includes(value)) {
        checked = true;
      } else {
        checked = false;
      }
    }
    watch.pre(() => value, () => {
      if (group && value) {
        if (group.opts.value.current.includes(value)) {
          checked = true;
        } else {
          checked = false;
        }
      }
    });
    const checkboxItemState = MenuCheckboxItemState.create(
      {
        checked: boxWith(() => checked, (v) => {
          if (v !== checked) {
            checked = v;
            onCheckedChange(v);
          }
        }),
        id: boxWith(() => id),
        disabled: boxWith(() => disabled),
        onSelect: boxWith(() => handleSelect),
        ref: boxWith(() => ref, (v) => ref = v),
        closeOnSelect: boxWith(() => closeOnSelect),
        indeterminate: boxWith(() => indeterminate, (v) => {
          if (v !== indeterminate) {
            indeterminate = v;
            onIndeterminateChange(v);
          }
        }),
        value: boxWith(() => value)
      },
      group
    );
    function handleSelect(e) {
      onSelect(e);
      if (e.defaultPrevented) return;
      checkboxItemState.toggleChecked();
    }
    const mergedProps = derived(() => mergeProps(restProps, checkboxItemState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { checked, indeterminate, props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2, { checked, indeterminate });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref, checked, indeterminate });
  });
}
function Minus($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [["path", { "d": "M5 12h14" }]];
    Icon($$renderer2, spread_props([
      { name: "minus" },
      /**
       * @component @name Minus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/minus
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
function Dropdown_menu_checkbox_item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      checked = false,
      indeterminate = false,
      class: className,
      children: childrenProp,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        let children = function($$renderer4, { checked: checked2, indeterminate: indeterminate2 }) {
          $$renderer4.push(`<span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">`);
          if (indeterminate2) {
            $$renderer4.push("<!--[-->");
            Minus($$renderer4, { class: "size-4" });
          } else {
            $$renderer4.push("<!--[!-->");
            Check($$renderer4, { class: cn("size-4", !checked2 && "text-transparent") });
          }
          $$renderer4.push(`<!--]--></span> `);
          childrenProp?.($$renderer4);
          $$renderer4.push(`<!---->`);
        };
        if (Menu_checkbox_item) {
          $$renderer3.push("<!--[-->");
          Menu_checkbox_item($$renderer3, spread_props([
            {
              "data-slot": "dropdown-menu-checkbox-item",
              class: cn("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              get checked() {
                return checked;
              },
              set checked($$value) {
                checked = $$value;
                $$settled = false;
              },
              get indeterminate() {
                return indeterminate;
              },
              set indeterminate($$value) {
                indeterminate = $$value;
                $$settled = false;
              },
              children,
              $$slots: { default: true }
            }
          ]));
          $$renderer3.push("<!--]-->");
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push("<!--]-->");
        }
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref, checked, indeterminate });
  });
}
function Funnel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "funnel" },
      /**
       * @component @name Funnel
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgMjBhMSAxIDAgMCAwIC41NTMuODk1bDIgMUExIDEgMCAwIDAgMTQgMjF2LTdhMiAyIDAgMCAxIC41MTctMS4zNDFMMjEuNzQgNC42N0ExIDEgMCAwIDAgMjEgM0gzYTEgMSAwIDAgMC0uNzQyIDEuNjdsNy4yMjUgNy45ODlBMiAyIDAgMCAxIDEwIDE0eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/funnel
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
function Search($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "m21 21-4.34-4.34" }],
      ["circle", { "cx": "11", "cy": "11", "r": "8" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "search" },
      /**
       * @component @name Search
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMjEtNC4zNC00LjM0IiAvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/search
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
const BASE_STORAGE_KEY = "venera_calendar_view";
function storageKeyForScope(scopeKey) {
  return `${BASE_STORAGE_KEY}:${scopeKey}`;
}
function loadSavedView(scopeKey) {
  if (typeof window === "undefined") return "month";
  try {
    const saved = localStorage.getItem(storageKeyForScope(scopeKey));
    if (saved && ["month", "week", "day", "year"].includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.error("Failed to load saved view", e);
  }
  return "month";
}
const initialState = {
  view: loadSavedView(getActiveScopeKey()),
  currentDate: /* @__PURE__ */ new Date(),
  filters: {
    priorities: /* @__PURE__ */ new Set(["A", "B", "C"]),
    statuses: /* @__PURE__ */ new Set(["OPEN", "IN_PROGRESS"]),
    showCompleted: false
  },
  searchQuery: ""
};
function createCalendarStore() {
  const { subscribe, set, update } = writable(initialState);
  if (typeof window !== "undefined") {
    teamScopeStore.subscribe(() => {
      const nextView = loadSavedView(getActiveScopeKey());
      update((state) => ({ ...state, view: nextView }));
    });
  }
  return {
    subscribe,
    setView: (view) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKeyForScope(getActiveScopeKey()), view);
        } catch (e) {
          console.error("Failed to save view", e);
        }
      }
      update((state) => ({ ...state, view }));
    },
    setCurrentDate: (date) => update((state) => ({ ...state, currentDate: date })),
    goToToday: () => update((state) => ({ ...state, currentDate: /* @__PURE__ */ new Date() })),
    nextPeriod: () => update((state) => {
      const newDate = new Date(state.currentDate);
      switch (state.view) {
        case "day":
          newDate.setDate(newDate.getDate() + 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() + 7);
          break;
        case "month":
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case "year":
          newDate.setFullYear(newDate.getFullYear() + 1);
          break;
      }
      return { ...state, currentDate: newDate };
    }),
    previousPeriod: () => update((state) => {
      const newDate = new Date(state.currentDate);
      switch (state.view) {
        case "day":
          newDate.setDate(newDate.getDate() - 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() - 7);
          break;
        case "month":
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case "year":
          newDate.setFullYear(newDate.getFullYear() - 1);
          break;
      }
      return { ...state, currentDate: newDate };
    }),
    togglePriority: (priority) => update((state) => {
      const newPriorities = new Set(state.filters.priorities);
      if (newPriorities.has(priority)) {
        newPriorities.delete(priority);
      } else {
        newPriorities.add(priority);
      }
      return {
        ...state,
        filters: {
          ...state.filters,
          priorities: newPriorities
        }
      };
    }),
    toggleStatus: (status) => update((state) => {
      const newStatuses = new Set(state.filters.statuses);
      if (newStatuses.has(status)) {
        newStatuses.delete(status);
      } else {
        newStatuses.add(status);
      }
      return {
        ...state,
        filters: {
          ...state.filters,
          statuses: newStatuses
        }
      };
    }),
    toggleShowCompleted: () => update((state) => {
      const newShowCompleted = !state.filters.showCompleted;
      const newStatuses = new Set(state.filters.statuses);
      if (newShowCompleted) {
        newStatuses.add("DONE");
        newStatuses.add("CANCELLED");
      } else {
        newStatuses.delete("DONE");
        newStatuses.delete("CANCELLED");
      }
      return {
        ...state,
        filters: {
          ...state.filters,
          statuses: newStatuses,
          showCompleted: newShowCompleted
        }
      };
    }),
    setSearchQuery: (query) => update((state) => ({ ...state, searchQuery: query })),
    reset: () => set({
      ...initialState,
      view: loadSavedView(getActiveScopeKey()),
      currentDate: /* @__PURE__ */ new Date()
    })
  };
}
const calendarStore = createCalendarStore();
function Calendar_toolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let calendarState = derived(() => store_get($$store_subs ??= {}, "$calendarStore", calendarStore));
    const viewLabels = { month: "Monat", week: "Woche", day: "Tag", year: "Jahr" };
    let searchInput = "";
    let searchTimeout;
    function handleSearchInput() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(
        () => {
          calendarStore.setSearchQuery(searchInput);
        },
        300
      );
    }
    function handlePriorityToggle(priority) {
      calendarStore.togglePriority(priority);
    }
    function handleStatusToggle(status) {
      calendarStore.toggleStatus(status);
    }
    function openCreateDialog() {
      createTaskDialogStore.open();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="border-border flex flex-col gap-4 border-b bg-card p-4 z-10"><div class="flex flex-wrap items-center gap-2"><div class="flex gap-1 rounded-lg bg-muted p-1"><!--[-->`);
      const each_array = ensure_array_like(Object.entries(viewLabels));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let [view, label] = each_array[$$index];
        $$renderer3.push(`<button${attr_class(`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${stringify(calendarState().view === view ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}`)}>${escape_html(label)}</button>`);
      }
      $$renderer3.push(`<!--]--></div></div> <div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2">`);
      Button($$renderer3, {
        variant: "outline",
        size: "icon-sm",
        onclick: () => calendarStore.previousPeriod(),
        children: ($$renderer4) => {
          Chevron_left($$renderer4, { class: "h-4 w-4" });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        variant: "outline",
        onclick: () => calendarStore.goToToday(),
        children: ($$renderer4) => {
          Calendar($$renderer4, { class: "mr-2 h-4 w-4" });
          $$renderer4.push(`<!----> Heute`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        variant: "outline",
        size: "icon-sm",
        onclick: () => calendarStore.nextPeriod(),
        children: ($$renderer4) => {
          Chevron_right($$renderer4, { class: "h-4 w-4" });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="h-6 w-px bg-border"></div> <div class="relative flex-1 min-w-[200px] max-w-sm">`);
      Search($$renderer3, {
        class: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      });
      $$renderer3.push(`<!----> `);
      Input($$renderer3, {
        type: "text",
        placeholder: "Aufgaben durchsuchen...",
        class: "pl-9",
        oninput: handleSearchInput,
        get value() {
          return searchInput;
        },
        set value($$value) {
          searchInput = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> `);
      if (Dropdown_menu) {
        $$renderer3.push("<!--[-->");
        Dropdown_menu($$renderer3, {
          children: ($$renderer4) => {
            {
              let child = function($$renderer5, { props }) {
                Button($$renderer5, spread_props([
                  props,
                  {
                    variant: "outline",
                    children: ($$renderer6) => {
                      Funnel($$renderer6, { class: "mr-2 h-4 w-4" });
                      $$renderer6.push(`<!----> Filter`);
                    },
                    $$slots: { default: true }
                  }
                ]));
              };
              if (Dropdown_menu_trigger) {
                $$renderer4.push("<!--[-->");
                Dropdown_menu_trigger($$renderer4, { child, $$slots: { child: true } });
                $$renderer4.push("<!--]-->");
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push("<!--]-->");
              }
            }
            $$renderer4.push(` `);
            if (Dropdown_menu_content) {
              $$renderer4.push("<!--[-->");
              Dropdown_menu_content($$renderer4, {
                align: "end",
                class: "w-56",
                children: ($$renderer5) => {
                  if (Dropdown_menu_label) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_label($$renderer5, {
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Priorität`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_checkbox_item) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_checkbox_item($$renderer5, {
                      checked: calendarState().filters.priorities.has("A"),
                      onCheckedChange: () => handlePriorityToggle("A"),
                      children: ($$renderer6) => {
                        $$renderer6.push(`<span class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-priority-a"></span> A (Hoch)</span>`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_checkbox_item) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_checkbox_item($$renderer5, {
                      checked: calendarState().filters.priorities.has("B"),
                      onCheckedChange: () => handlePriorityToggle("B"),
                      children: ($$renderer6) => {
                        $$renderer6.push(`<span class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-priority-b"></span> B (Mittel)</span>`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_checkbox_item) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_checkbox_item($$renderer5, {
                      checked: calendarState().filters.priorities.has("C"),
                      onCheckedChange: () => handlePriorityToggle("C"),
                      children: ($$renderer6) => {
                        $$renderer6.push(`<span class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-priority-c"></span> C (Niedrig)</span>`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_separator) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_separator($$renderer5, {});
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_label) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_label($$renderer5, {
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Status`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_checkbox_item) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_checkbox_item($$renderer5, {
                      checked: calendarState().filters.statuses.has("OPEN"),
                      onCheckedChange: () => handleStatusToggle("OPEN"),
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Offen`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_checkbox_item) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_checkbox_item($$renderer5, {
                      checked: calendarState().filters.statuses.has("IN_PROGRESS"),
                      onCheckedChange: () => handleStatusToggle("IN_PROGRESS"),
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->In Arbeit`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_separator) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_separator($$renderer5, {});
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (Dropdown_menu_checkbox_item) {
                    $$renderer5.push("<!--[-->");
                    Dropdown_menu_checkbox_item($$renderer5, {
                      checked: calendarState().filters.showCompleted,
                      onCheckedChange: () => calendarStore.toggleShowCompleted(),
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Erledigte anzeigen`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                },
                $$slots: { default: true }
              });
              $$renderer4.push("<!--]-->");
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push("<!--]-->");
            }
          },
          $$slots: { default: true }
        });
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
      $$renderer3.push(` `);
      Button($$renderer3, {
        onclick: openCreateDialog,
        children: ($$renderer4) => {
          Plus($$renderer4, { class: "mr-2 h-4 w-4" });
          $$renderer4.push(`<!----> Neue Aufgabe`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Calendar_month_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tasks, currentDate } = $$props;
    updateTaskMutation();
    const year = derived(() => currentDate.getFullYear());
    const month = derived(() => currentDate.getMonth());
    const monthDates = derived(() => getMonthDates(year(), month()));
    const weekdayLabels = derived(() => Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, 1 + i);
      return getWeekdayName(date, true);
    }));
    function getTasksForDate(date) {
      return filterTasksByDate(tasks, date);
    }
    function isCurrentMonth(date) {
      return date.getMonth() === month();
    }
    $$renderer2.push(`<div class="flex h-full flex-col"><div class="border-b border-border bg-muted/30 px-4 py-3"><h2 class="text-lg font-semibold">${escape_html(getMonthName(month()))}
			${escape_html(year())}</h2></div> <div class="flex-1 overflow-auto"><div class="grid h-full min-h-[680px]" style="grid-template-columns: repeat(7, minmax(0, 1fr)); grid-template-rows: auto repeat(6, minmax(0, 1fr));"><!--[-->`);
    const each_array = ensure_array_like(weekdayLabels());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let label = each_array[$$index];
      $$renderer2.push(`<div class="border-r border-b border-border bg-muted/50 p-2 text-center text-sm font-medium">${escape_html(label)}</div>`);
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array_1 = ensure_array_like(monthDates());
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let date = each_array_1[$$index_2];
      const dayTasks = getTasksForDate(date);
      const isTodayCell = isToday(date);
      const isInMonth = isCurrentMonth(date);
      $$renderer2.push(`<div${attr_class(`group relative flex min-h-0 flex-col border-r border-b border-border p-2 transition-colors hover:bg-muted/50 ${stringify(!isInMonth ? "bg-muted/20" : "")}`)}${attr("data-date", formatISODate(date))} role="gridcell"${attr("tabindex", 0)}><div class="mb-2 flex items-center justify-between"><span${attr_class(`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors ${stringify(isTodayCell ? "bg-primary text-primary-foreground" : isInMonth ? "text-foreground" : "text-muted-foreground")}`)}>${escape_html(date.getDate())}</span></div> <div class="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1"><!--[-->`);
      const each_array_2 = ensure_array_like(dayTasks);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let task = each_array_2[$$index_1];
        $$renderer2.push(`<div role="button"${attr("tabindex", 0)}${attr_class(`relative flex w-full items-center gap-1 overflow-hidden rounded-md border bg-card/85 px-1.5 py-1 text-left text-xs transition-colors hover:bg-card ${stringify(task.status === "DONE" ? "opacity-55 grayscale-[0.2]" : "")}`)}${attr("draggable", true)}${attr("aria-label", `Aufgabe ${task.title}`)}><button type="button" class="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"${attr("aria-label", `Aufgabe ${task.title} abhaken`)}>`);
        if (task.status === "DONE") {
          $$renderer2.push("<!--[-->");
          Circle_check_big($$renderer2, { class: "size-3.5" });
        } else {
          $$renderer2.push("<!--[!-->");
          Circle($$renderer2, { class: "size-3.5" });
        }
        $$renderer2.push(`<!--]--></button> <span${attr_class(`truncate ${stringify(task.status === "DONE" ? "line-through" : "")}`)}>${escape_html(task.title)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
function Calendar_week_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tasks, currentDate } = $$props;
    updateTaskMutation();
    const weekDates = derived(() => getWeekDates(currentDate));
    const hours = derived(() => Array.from({ length: 24 }, (_, i) => i));
    const HOUR_HEIGHT = 80;
    const OVERLAP_INDENT = 14;
    const MAX_INDENT = 56;
    const MIN_HEIGHT = 44;
    const SIDE_BY_SIDE_THRESHOLD_MINUTES = 20;
    const CELL_INSET_X = 4;
    let optimisticSchedules = {};
    function minutesToTime(minutes) {
      const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
      const h = Math.floor(clamped / 60).toString().padStart(2, "0");
      const m = (clamped % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    }
    function getOptimisticSchedule(taskId) {
      const value = optimisticSchedules[taskId];
      if (!value) return null;
      if (value.expiresAt < Date.now()) return null;
      return value;
    }
    function resolveTaskTime(task) {
      const optimistic = getOptimisticSchedule(task.id);
      if (optimistic) {
        return {
          startTime: minutesToTime(optimistic.startMinutes),
          endTime: minutesToTime(optimistic.endMinutes)
        };
      }
      const savedTime = getTaskTime(task.id);
      const extractedStart = extractTimePart(task.startDate);
      const extractedEnd = extractTimePart(task.dueDate);
      const startTime = extractedStart === "00:00" && savedTime?.startTime ? savedTime.startTime : extractedStart;
      let endTime = extractedEnd === "00:00" && savedTime?.endTime ? savedTime.endTime : extractedEnd;
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        endTime = minutesToTime(Math.min(23 * 60 + 59, timeToMinutes(startTime) + 30));
      }
      return { startTime, endTime };
    }
    function resolveTaskDate(task) {
      const optimistic = getOptimisticSchedule(task.id);
      if (optimistic) return optimistic.dateStr;
      const startDate = extractDatePart(task.startDate);
      if (startDate) return startDate;
      return extractDatePart(task.dueDate);
    }
    function getTasksForDate(date) {
      const dateStr = formatISODate(date);
      return tasks.filter((task) => resolveTaskDate(task) === dateStr);
    }
    function buildPositionedTasks(dayTasks) {
      const timed = dayTasks.map((task) => {
        const { startTime, endTime } = resolveTaskTime(task);
        return {
          task,
          startTime,
          endTime,
          startMinutes: timeToMinutes(startTime),
          endMinutes: timeToMinutes(endTime)
        };
      }).sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
      if (timed.length === 0) return [];
      const overlaps = (a, b) => a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
      const adjacency = Array.from({ length: timed.length }, () => /* @__PURE__ */ new Set());
      for (let i = 0; i < timed.length; i++) {
        for (let j = i + 1; j < timed.length; j++) {
          if (overlaps(timed[i], timed[j])) {
            adjacency[i].add(j);
            adjacency[j].add(i);
          }
        }
      }
      const visited = /* @__PURE__ */ new Set();
      const components = [];
      for (let i = 0; i < timed.length; i++) {
        if (visited.has(i)) continue;
        const stack = [i];
        const component = [];
        visited.add(i);
        while (stack.length > 0) {
          const current = stack.pop();
          component.push(current);
          for (const next of adjacency[current]) {
            if (!visited.has(next)) {
              visited.add(next);
              stack.push(next);
            }
          }
        }
        component.sort((a, b) => timed[a].startMinutes - timed[b].startMinutes || timed[a].endMinutes - timed[b].endMinutes);
        components.push(component);
      }
      const positioned = [];
      for (const component of components) {
        const activeCols = [];
        const colByIndex = /* @__PURE__ */ new Map();
        let maxColumns = 1;
        for (const idx of component) {
          const entry = timed[idx];
          for (let i = activeCols.length - 1; i >= 0; i--) {
            if (activeCols[i].endMinutes <= entry.startMinutes) activeCols.splice(i, 1);
          }
          const usedCols = new Set(activeCols.map((item) => item.col));
          let col = 0;
          while (usedCols.has(col)) col++;
          colByIndex.set(idx, col);
          activeCols.push({ endMinutes: entry.endMinutes, col });
          maxColumns = Math.max(maxColumns, activeCols.length);
        }
        let sideBySide = false;
        for (let i = 0; i < component.length && !sideBySide; i++) {
          for (let j = i + 1; j < component.length; j++) {
            const a = timed[component[i]];
            const b = timed[component[j]];
            if (Math.abs(a.startMinutes - b.startMinutes) <= SIDE_BY_SIDE_THRESHOLD_MINUTES) {
              sideBySide = true;
              break;
            }
          }
        }
        for (const idx of component) {
          const entry = timed[idx];
          const col = colByIndex.get(idx) ?? 0;
          const top = timeToYPosition(entry.startTime, HOUR_HEIGHT);
          const duration = calculateDuration(entry.startTime, entry.endTime);
          const height = Math.max(duration / 60 * HOUR_HEIGHT, MIN_HEIGHT);
          let leftCss = `${CELL_INSET_X}px`;
          let rightCss = `${CELL_INSET_X}px`;
          if (sideBySide && maxColumns > 1) {
            const widthPct = 100 / maxColumns;
            const rightCols = maxColumns - col - 1;
            leftCss = `calc(${CELL_INSET_X}px + ${col * widthPct}%)`;
            rightCss = `calc(${CELL_INSET_X}px + ${rightCols * widthPct}%)`;
          } else {
            const left = Math.min(col * OVERLAP_INDENT, MAX_INDENT);
            leftCss = `${CELL_INSET_X + left}px`;
          }
          positioned.push({
            task: entry.task,
            top,
            height,
            leftCss,
            rightCss,
            zIndex: 20,
            timeLabel: `${entry.startTime} - ${entry.endTime}`,
            priorityColor: getPriorityColorVar(entry.task.category),
            sortKey: entry.startMinutes * 1e4 + entry.endMinutes
          });
        }
      }
      return positioned.sort((a, b) => a.sortKey - b.sortKey).map(({ sortKey, ...rest }) => rest);
    }
    function getPositionedTasksForDate(date) {
      return buildPositionedTasks(getTasksForDate(date));
    }
    $$renderer2.push(`<div class="flex h-full flex-col overflow-hidden"><div class="border-border grid border-b" style="grid-template-columns: 60px repeat(7, 1fr);"><div class="border-border border-r"></div> <!--[-->`);
    const each_array = ensure_array_like(weekDates());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let date = each_array[$$index];
      const isTodayCell = isToday(date);
      $$renderer2.push(`<div${attr_class(`border-border flex flex-col items-center border-r p-2 ${stringify(isTodayCell ? "bg-primary/10" : "")}`)}><span class="text-muted-foreground text-xs">${escape_html(getWeekdayName(date, true))}</span> <span${attr_class(`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${stringify(isTodayCell ? "bg-primary text-primary-foreground" : "text-foreground")}`)}>${escape_html(date.getDate())}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="relative flex-1 overflow-auto"><div class="grid" style="grid-template-columns: 60px repeat(7, 1fr);"><!--[-->`);
    const each_array_1 = ensure_array_like(hours());
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let hour = each_array_1[$$index_2];
      $$renderer2.push(`<div class="border-border text-muted-foreground sticky left-0 bg-background border-r border-t px-2 py-1 text-right text-xs"${attr_style(`height: ${stringify(HOUR_HEIGHT)}px;`)}>${escape_html(hour.toString().padStart(2, "0"))}:00</div> <!--[-->`);
      const each_array_2 = ensure_array_like(weekDates());
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let date = each_array_2[$$index_1];
        $$renderer2.push(`<div class="border-border border-r border-t"${attr_style(`height: ${stringify(HOUR_HEIGHT)}px;`)}${attr("data-date", formatISODate(date))}${attr("data-hour", hour)} role="gridcell"${attr("tabindex", 0)}></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="pointer-events-none absolute inset-0" style="padding-left: 60px;"><div class="grid h-full" style="grid-template-columns: repeat(7, 1fr);"><!--[-->`);
    const each_array_3 = ensure_array_like(weekDates());
    for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
      let date = each_array_3[$$index_4];
      const dayTasks = getPositionedTasksForDate(date);
      const dateStr = formatISODate(date);
      $$renderer2.push(`<div class="relative" data-day-column=""${attr("data-date", dateStr)}>`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array_4 = ensure_array_like(dayTasks);
      for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
        let positionedTask = each_array_4[$$index_3];
        $$renderer2.push(`<div class="pointer-events-auto absolute"${attr_style(`top: ${stringify(positionedTask.top)}px; left: ${stringify(positionedTask.leftCss)}; right: ${stringify(positionedTask.rightCss)}; height: ${stringify(positionedTask.height)}px; z-index: ${stringify(positionedTask.zIndex)};`)}><div role="button"${attr("tabindex", 0)}${attr_class(`bg-card/85 hover:bg-card/95 relative flex h-full w-full flex-col overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm backdrop-blur-[1px] transition-colors ${stringify(positionedTask.task.status === "DONE" ? "opacity-55 grayscale-[0.2]" : "")}`)}${attr_style(`border-left: 3px solid ${stringify(positionedTask.priorityColor)};`)}${attr("draggable", true)}${attr("aria-label", `Aufgabe: ${positionedTask.task.title}`)}><div class="absolute inset-x-0 top-0 h-2 cursor-ns-resize" data-resize-handle=""></div> <div class="mb-0.5 flex items-center gap-1.5"><button type="button" class="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"${attr("aria-label", `Aufgabe ${positionedTask.task.title} abhaken`)}>`);
        if (positionedTask.task.status === "DONE") {
          $$renderer2.push("<!--[-->");
          Circle_check_big($$renderer2, { class: "size-3.5" });
        } else {
          $$renderer2.push("<!--[!-->");
          Circle($$renderer2, { class: "size-3.5" });
        }
        $$renderer2.push(`<!--]--></button> <span${attr_class(`truncate text-[11px] font-semibold leading-tight ${stringify(positionedTask.task.status === "DONE" ? "line-through" : "")}`)}>${escape_html(positionedTask.task.title)}</span></div> <span class="truncate text-[10px] text-muted-foreground">${escape_html(positionedTask.timeLabel)}</span> <div class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize" data-resize-handle=""></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div>`);
  });
}
function Calendar_day_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tasks, currentDate } = $$props;
    updateTaskMutation();
    const hours = derived(() => Array.from({ length: 24 }, (_, i) => i));
    const isTodayView = derived(() => isToday(currentDate));
    const HOUR_HEIGHT = 80;
    const OVERLAP_INDENT = 18;
    const MAX_INDENT = 72;
    const MIN_HEIGHT = 56;
    const SIDE_BY_SIDE_THRESHOLD_MINUTES = 20;
    const CELL_INSET_X = 8;
    let optimisticSchedules = {};
    const currentDateStr = derived(() => formatISODate(currentDate));
    const dayTasks = derived(() => tasks.filter((task) => {
      const optimistic = optimisticSchedules[task.id];
      if (optimistic && optimistic.expiresAt >= Date.now()) return optimistic.dateStr === currentDateStr();
      const startDate = extractDatePart(task.startDate);
      if (startDate) return startDate === currentDateStr();
      return extractDatePart(task.dueDate) === currentDateStr();
    }));
    function minutesToTime(minutes) {
      const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
      const h = Math.floor(clamped / 60).toString().padStart(2, "0");
      const m = (clamped % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    }
    function getOptimisticSchedule(taskId) {
      const value = optimisticSchedules[taskId];
      if (!value) return null;
      if (value.expiresAt < Date.now()) return null;
      return value;
    }
    function resolveTaskTime(task) {
      const optimistic = getOptimisticSchedule(task.id);
      if (optimistic) {
        return {
          startTime: minutesToTime(optimistic.startMinutes),
          endTime: minutesToTime(optimistic.endMinutes)
        };
      }
      const savedTime = getTaskTime(task.id);
      const extractedStart = extractTimePart(task.startDate);
      const extractedEnd = extractTimePart(task.dueDate);
      const startTime = extractedStart === "00:00" && savedTime?.startTime ? savedTime.startTime : extractedStart;
      let endTime = extractedEnd === "00:00" && savedTime?.endTime ? savedTime.endTime : extractedEnd;
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        endTime = minutesToTime(Math.min(23 * 60 + 59, timeToMinutes(startTime) + 30));
      }
      return { startTime, endTime };
    }
    const positionedDayTasks = derived(() => {
      const timed = dayTasks().map((task) => {
        const { startTime, endTime } = resolveTaskTime(task);
        return {
          task,
          startTime,
          endTime,
          startMinutes: timeToMinutes(startTime),
          endMinutes: timeToMinutes(endTime)
        };
      }).sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
      if (timed.length === 0) return [];
      const overlaps = (a, b) => a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
      const adjacency = Array.from({ length: timed.length }, () => /* @__PURE__ */ new Set());
      for (let i = 0; i < timed.length; i++) {
        for (let j = i + 1; j < timed.length; j++) {
          if (overlaps(timed[i], timed[j])) {
            adjacency[i].add(j);
            adjacency[j].add(i);
          }
        }
      }
      const visited = /* @__PURE__ */ new Set();
      const components = [];
      for (let i = 0; i < timed.length; i++) {
        if (visited.has(i)) continue;
        const stack = [i];
        const component = [];
        visited.add(i);
        while (stack.length > 0) {
          const current = stack.pop();
          component.push(current);
          for (const next of adjacency[current]) {
            if (!visited.has(next)) {
              visited.add(next);
              stack.push(next);
            }
          }
        }
        component.sort((a, b) => timed[a].startMinutes - timed[b].startMinutes || timed[a].endMinutes - timed[b].endMinutes);
        components.push(component);
      }
      const positioned = [];
      for (const component of components) {
        const activeCols = [];
        const colByIndex = /* @__PURE__ */ new Map();
        let maxColumns = 1;
        for (const idx of component) {
          const entry = timed[idx];
          for (let i = activeCols.length - 1; i >= 0; i--) {
            if (activeCols[i].endMinutes <= entry.startMinutes) activeCols.splice(i, 1);
          }
          const usedCols = new Set(activeCols.map((item) => item.col));
          let col = 0;
          while (usedCols.has(col)) col++;
          colByIndex.set(idx, col);
          activeCols.push({ endMinutes: entry.endMinutes, col });
          maxColumns = Math.max(maxColumns, activeCols.length);
        }
        let sideBySide = false;
        for (let i = 0; i < component.length && !sideBySide; i++) {
          for (let j = i + 1; j < component.length; j++) {
            const a = timed[component[i]];
            const b = timed[component[j]];
            if (Math.abs(a.startMinutes - b.startMinutes) <= SIDE_BY_SIDE_THRESHOLD_MINUTES) {
              sideBySide = true;
              break;
            }
          }
        }
        for (const idx of component) {
          const entry = timed[idx];
          const col = colByIndex.get(idx) ?? 0;
          const top = timeToYPosition(entry.startTime, HOUR_HEIGHT);
          const duration = calculateDuration(entry.startTime, entry.endTime);
          const height = Math.max(duration / 60 * HOUR_HEIGHT, MIN_HEIGHT);
          let leftCss = `${CELL_INSET_X}px`;
          let rightCss = `${CELL_INSET_X}px`;
          if (sideBySide && maxColumns > 1) {
            const widthPct = 100 / maxColumns;
            const rightCols = maxColumns - col - 1;
            leftCss = `calc(${CELL_INSET_X}px + ${col * widthPct}%)`;
            rightCss = `calc(${CELL_INSET_X}px + ${rightCols * widthPct}%)`;
          } else {
            const left = Math.min(col * OVERLAP_INDENT, MAX_INDENT);
            leftCss = `${CELL_INSET_X + left}px`;
          }
          positioned.push({
            task: entry.task,
            top,
            height,
            leftCss,
            rightCss,
            zIndex: 20,
            timeLabel: `${entry.startTime} - ${entry.endTime}`,
            priorityColor: getPriorityColorVar(entry.task.category),
            sortKey: entry.startMinutes * 1e4 + entry.endMinutes
          });
        }
      }
      return positioned.sort((a, b) => a.sortKey - b.sortKey).map(({ sortKey, ...rest }) => rest);
    });
    $$renderer2.push(`<div class="flex h-full flex-col overflow-hidden"><div class="border-border bg-primary/5 border-b p-4"><h2 class="text-lg font-semibold">${escape_html(getWeekdayName(currentDate))}, ${escape_html(formatDisplayDate(currentDateStr()))}</h2> `);
    if (isTodayView()) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-primary text-sm font-medium">Heute</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="relative flex-1 overflow-auto"><div class="grid" style="grid-template-columns: 80px 1fr;"><!--[-->`);
    const each_array = ensure_array_like(hours());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let hour = each_array[$$index];
      $$renderer2.push(`<div class="border-border text-muted-foreground sticky left-0 bg-background border-r border-t px-3 py-2 text-right text-sm font-medium"${attr_style(`height: ${stringify(HOUR_HEIGHT)}px;`)}>${escape_html(hour.toString().padStart(2, "0"))}:00</div> <div class="border-border border-r border-t"${attr_style(`height: ${stringify(HOUR_HEIGHT)}px;`)}${attr("data-hour", hour)} role="gridcell"${attr("tabindex", 0)}></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="pointer-events-none absolute inset-0" style="padding-left: 80px;"><div class="relative h-full" data-day-column="">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array_1 = ensure_array_like(positionedDayTasks());
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let positionedTask = each_array_1[$$index_1];
      $$renderer2.push(`<div class="pointer-events-auto absolute"${attr_style(`top: ${stringify(positionedTask.top)}px; left: ${stringify(positionedTask.leftCss)}; right: ${stringify(positionedTask.rightCss)}; height: ${stringify(positionedTask.height)}px; z-index: ${stringify(positionedTask.zIndex)};`)}><div role="button"${attr("tabindex", 0)}${attr_class(`bg-card/85 hover:bg-card/95 relative flex h-full w-full flex-col overflow-hidden rounded-md border px-3 py-2 text-left shadow-sm backdrop-blur-[1px] transition-colors ${stringify(positionedTask.task.status === "DONE" ? "opacity-55 grayscale-[0.2]" : "")}`)}${attr_style(`border-left: 3px solid ${stringify(positionedTask.priorityColor)};`)}${attr("draggable", true)}${attr("aria-label", `Aufgabe: ${positionedTask.task.title}`)}><div class="absolute inset-x-0 top-0 h-2 cursor-ns-resize" data-resize-handle=""></div> <div class="mb-1 flex items-center gap-2"><button type="button" class="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"${attr("aria-label", `Aufgabe ${positionedTask.task.title} abhaken`)}>`);
      if (positionedTask.task.status === "DONE") {
        $$renderer2.push("<!--[-->");
        Circle_check_big($$renderer2, { class: "size-4" });
      } else {
        $$renderer2.push("<!--[!-->");
        Circle($$renderer2, { class: "size-4" });
      }
      $$renderer2.push(`<!--]--></button> <span${attr_class(`truncate text-sm font-semibold leading-tight ${stringify(positionedTask.task.status === "DONE" ? "line-through" : "")}`)}>${escape_html(positionedTask.task.title)}</span></div> <span class="mt-1 truncate text-xs text-muted-foreground">${escape_html(positionedTask.timeLabel)}</span> <div class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize" data-resize-handle=""></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div>`);
  });
}
function Calendar_year_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tasks, currentDate } = $$props;
    const year = derived(() => currentDate.getFullYear());
    const months = derived(() => Array.from({ length: 12 }, (_, i) => i));
    const weekdayLabels = derived(() => Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, 1 + i);
      return getWeekdayName(date, true).substring(0, 1);
    }));
    function getTasksForDate(date) {
      return filterTasksByDate(tasks, date);
    }
    function getTaskCountForMonth(month) {
      const monthStart = new Date(year(), month, 1);
      const monthEnd = new Date(year(), month + 1, 0);
      return tasks.filter((task) => {
        const taskDateStr = task.dueDate || task.startDate;
        const taskDate = extractDatePart(taskDateStr);
        return taskDate >= formatISODate(monthStart) && taskDate <= formatISODate(monthEnd);
      }).length;
    }
    $$renderer2.push(`<div class="h-full overflow-auto p-6"><div class="mb-6"><h1 class="text-2xl font-bold">${escape_html(year())}</h1></div> <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><!--[-->`);
    const each_array = ensure_array_like(months());
    for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
      let month = each_array[$$index_2];
      const monthDates = getMonthDates(year(), month);
      const taskCount = getTaskCountForMonth(month);
      $$renderer2.push(`<button class="border-border group rounded-lg border p-3 transition-all hover:border-primary hover:shadow-md"><div class="mb-2 flex items-center justify-between"><h3 class="text-sm font-semibold">${escape_html(getMonthName(month))}</h3> `);
      if (taskCount > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">${escape_html(taskCount)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="grid grid-cols-7 gap-1"><!--[-->`);
      const each_array_1 = ensure_array_like(weekdayLabels());
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let label = each_array_1[$$index];
        $$renderer2.push(`<div class="text-muted-foreground text-center text-xs">${escape_html(label)}</div>`);
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array_2 = ensure_array_like(monthDates.slice(0, 35));
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let date = each_array_2[$$index_1];
        const dayTasks = getTasksForDate(date);
        const isTodayCell = isToday(date);
        const isInMonth = date.getMonth() === month;
        $$renderer2.push(`<div${attr_class(`flex h-6 w-6 items-center justify-center rounded text-xs ${stringify(isTodayCell ? "bg-primary text-primary-foreground font-semibold" : isInMonth ? "text-foreground" : "text-muted-foreground/50")} ${stringify(dayTasks.length > 0 && isInMonth ? "font-semibold" : "")}`)}>`);
        if (dayTasks.length > 0 && isInMonth) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="relative">${escape_html(date.getDate())} <span class="bg-primary absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"></span></span>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(date.getDate())}`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div></button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const tasksQuery = allTasksQuery();
    let calendarState = derived(() => store_get($$store_subs ??= {}, "$calendarStore", calendarStore));
    const allTasks = derived(() => store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).data ?? []);
    const filteredTasks = derived(() => () => {
      let tasks = allTasks();
      tasks = filterTasksBySearch(tasks, calendarState().searchQuery);
      tasks = filterTasksByPriorities(tasks, calendarState().filters.priorities);
      tasks = filterTasksByStatuses(tasks, calendarState().filters.statuses);
      return tasks;
    });
    head("7iiul5", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Kalender | Venera</title>`);
      });
    });
    $$renderer2.push(`<div class="flex h-full flex-col overflow-hidden">`);
    Calendar_toolbar($$renderer2);
    $$renderer2.push(`<!----> <div class="flex-1 overflow-hidden">`);
    if (store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex h-full items-center justify-center"><div class="text-center"><div class="border-primary mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"></div> <p class="text-muted-foreground">Lädt Aufgaben...</p></div></div>`);
    } else if (store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).isError) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="flex h-full items-center justify-center"><div class="text-center"><p class="text-destructive mb-2 text-lg font-semibold">Fehler beim Laden</p> <p class="text-muted-foreground">${escape_html(store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).error?.message || "Unbekannter Fehler")}</p> `);
      Button($$renderer2, {
        class: "mt-4",
        onclick: () => store_get($$store_subs ??= {}, "$tasksQuery", tasksQuery).refetch(),
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Erneut versuchen`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (calendarState().view === "month") {
        $$renderer2.push("<!--[-->");
        Calendar_month_view($$renderer2, {
          tasks: filteredTasks()(),
          currentDate: calendarState().currentDate
        });
      } else if (calendarState().view === "week") {
        $$renderer2.push("<!--[1-->");
        Calendar_week_view($$renderer2, {
          tasks: filteredTasks()(),
          currentDate: calendarState().currentDate
        });
      } else if (calendarState().view === "day") {
        $$renderer2.push("<!--[2-->");
        Calendar_day_view($$renderer2, {
          tasks: filteredTasks()(),
          currentDate: calendarState().currentDate
        });
      } else if (calendarState().view === "year") {
        $$renderer2.push("<!--[3-->");
        Calendar_year_view($$renderer2, {
          tasks: filteredTasks()(),
          currentDate: calendarState().currentDate
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
