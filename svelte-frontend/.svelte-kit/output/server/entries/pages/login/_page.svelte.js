import { t as head } from "../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils2.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { B as Button } from "../../../chunks/button.js";
import { e as getApiBase } from "../../../chunks/client2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    function loginWithGoogle() {
      const base = getApiBase();
      window.location.href = `${base}/oauth2/authorization/google`;
    }
    head("1x05zx6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Login | Venera</title>`);
      });
    });
    $$renderer2.push(`<div class="flex min-h-[60vh] items-center justify-center"><img src="/background.png" alt="Venera" class="absolute top-0 left-0 w-full h-full object-cover"/> <div class="z-10 text-white mt-60 flex flex-col gap-4 items-center"><div><h1 class="text-4xl font-bold">Venera</h1></div> `);
    Button($$renderer2, {
      variant: "outline",
      class: "w-full",
      onclick: loginWithGoogle,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Mit Google anmelden`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
