import { c as spread_props, t as head, g as store_get, e as escape_html, h as ensure_array_like, l as attr, m as attr_class, k as stringify, i as unsubscribe_stores, d as derived } from "../../../../chunks/index.js";
import { B as Button } from "../../../../chunks/button.js";
import { i as inboxTasksQuery, b as createTaskMutation, e as deleteTaskMutation, d as updateTaskMutation } from "../../../../chunks/queries.js";
import { I as Icon, c as createTaskDialogStore } from "../../../../chunks/create-task-dialog-store.js";
import { t as toastStore } from "../../../../chunks/toast-store.js";
import { g as get } from "../../../../chunks/index2.js";
import { C as Circle_check_big, a as Circle } from "../../../../chunks/circle-check-big.js";
import { P as Plus } from "../../../../chunks/plus.js";
function Trash($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
      ["path", { "d": "M3 6h18" }],
      ["path", { "d": "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "trash" },
      /**
       * @component @name Trash
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgNnYxNGEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMlY2IiAvPgogIDxwYXRoIGQ9Ik0zIDZoMTgiIC8+CiAgPHBhdGggZD0iTTggNlY0YTIgMiAwIDAgMSAyLTJoNGEyIDIgMCAwIDEgMiAydjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/trash
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
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const tasks = inboxTasksQuery();
    const createMutation = createTaskMutation();
    const deleteMutation = deleteTaskMutation();
    updateTaskMutation();
    const tasksList = derived(() => store_get($$store_subs ??= {}, "$tasks", tasks).data ?? []);
    const categoryLabels = { A: "A", B: "B", C: "C" };
    function handleDelete(task) {
      const taskToRestore = {
        title: task.title,
        description: task.description ?? "",
        startDate: task.startDate,
        dueDate: task.dueDate,
        category: task.category,
        status: task.status,
        estimatedDurationMinutes: task.estimatedDurationMinutes,
        actualDurationMinutes: task.actualDurationMinutes
      };
      get(deleteMutation).mutate(task.id, {
        onSuccess: () => {
          toastStore.success("Aufgabe gelöscht", {
            label: "Rückgängig machen",
            onClick: () => {
              get(createMutation).mutate(taskToRestore);
            }
          });
        }
      });
    }
    head("1c6mnqp", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Eingang - Venera</title>`);
      });
    });
    $$renderer2.push(`<section class="flex h-full w-full flex-col py-4"><div class="z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col"><header class="space-y-1 pb-1"><h2 class="text-2xl font-semibold">Eingang</h2></header> `);
    if (store_get($$store_subs ??= {}, "$tasks", tasks).isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-3 py-4"><p class="text-sm text-muted-foreground">Lade Aufgaben…</p></div>`);
    } else if (store_get($$store_subs ??= {}, "$tasks", tasks).isError) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="space-y-3 py-4"><p class="text-sm text-destructive">Fehler beim Laden. Bist du eingeloggt? (${escape_html(store_get($$store_subs ??= {}, "$tasks", tasks).error?.message)})</p></div>`);
    } else if (tasksList().length === 0) {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="flex flex-1 flex-col items-center justify-center py-8"><div class="mx-auto max-w-2xl rounded-lg border border-border p-4 text-center text-foreground shadow-sm"><p>Noch keine Aufgaben im Eingang.</p> <p class="mt-1 text-sm">Klicke in der Sidebar auf „Aufgabe hinzufügen“, um deine erste Aufgabe anzulegen.</p></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="max-h-[calc(100vh-3rem)] space-y-3 overflow-y-auto py-4"><ul class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(tasksList());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let task = each_array[$$index];
        $$renderer2.push(`<li class="flex flex-row items-center justify-between gap-3 rounded-lg border border-border bg-card/30 p-4 shadow-sm"><button type="button" class="text-muted-foreground hover:text-foreground cursor-pointer"${attr("aria-label", `Aufgabe ${task.title} abhaken`)}>`);
        if (task.status === "DONE") {
          $$renderer2.push("<!--[-->");
          Circle_check_big($$renderer2, { class: "size-4" });
        } else {
          $$renderer2.push("<!--[!-->");
          Circle($$renderer2, { class: "size-4" });
        }
        $$renderer2.push(`<!--]--></button> <button type="button"${attr_class(`-m-2 min-w-0 flex-1 cursor-pointer rounded-md p-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline ${stringify(task.status === "DONE" ? "opacity-60" : "")}`)}><p${attr_class(`truncate font-medium ${stringify(task.status === "DONE" ? "line-through" : "")}`)}>${escape_html(task.title)}</p> `);
        if (task.description) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="mt-0.5 truncate text-sm text-muted-foreground">${escape_html(task.description)}</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div class="mt-2 flex flex-wrap items-center gap-2"><span class="inline-flex items-center rounded-md border border-transparent bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">${escape_html(categoryLabels[task.category])}</span> `);
        if (task.dueDate) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-xs text-muted-foreground">bis ${escape_html(new Date(task.dueDate).toLocaleDateString("de-DE"))}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></button> `);
        Button($$renderer2, {
          variant: "ghost",
          size: "icon",
          onclick: () => handleDelete(task),
          disabled: store_get($$store_subs ??= {}, "$deleteMutation", deleteMutation).isPending,
          "aria-label": "Aufgabe löschen",
          children: ($$renderer3) => {
            Trash($$renderer3, {});
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></li>`);
      }
      $$renderer2.push(`<!--]--></ul> `);
      Button($$renderer2, {
        variant: "ghost",
        class: "justify-start",
        onclick: () => createTaskDialogStore.open(),
        children: ($$renderer3) => {
          Plus($$renderer3, { class: "size-4" });
          $$renderer3.push(`<!----> Aufgabe hinzufügen`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
