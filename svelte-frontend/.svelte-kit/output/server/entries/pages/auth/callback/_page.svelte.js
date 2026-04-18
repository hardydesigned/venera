import { t as head } from "../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/client2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("3cfahf", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Anmeldung | Venera</title>`);
      });
    });
    $$renderer2.push(`<div class="flex min-h-[40vh] items-center justify-center">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-col items-center gap-4"><div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div> <p class="text-slate-600">Anmeldung wird abgeschlossen…</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
