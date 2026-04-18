import "clsx";
import { D as DialogTitleState, a as DialogDescriptionState, b as DialogRootState, T as TooltipProviderState, t as themeStore, s as setTheme, c as setSidebar, S as SIDEBAR_COOKIE_NAME, d as SIDEBAR_COOKIE_MAX_AGE, e as SIDEBAR_WIDTH, f as SIDEBAR_WIDTH_ICON, u as useSidebar, g as Sheet_content, h as SIDEBAR_WIDTH_MOBILE, i as Dialog_overlay$1, j as Dialog_content$1, k as Dialog_close$1, X, l as Sidebar_menu_button } from "../../../chunks/sheet-content.js";
import { p as props_id, a as attributes, b as bind_props, d as derived, c as spread_props, g as store_get, h as ensure_array_like, e as escape_html, i as unsubscribe_stores, j as clsx, k as stringify, l as attr, m as attr_class, n as noop$1 } from "../../../chunks/index.js";
import { c as cn, B as Button } from "../../../chunks/button.js";
import { c as createId, b as boxWith, m as mergeProps, C as Context, D as DOMContext, a as attachRef, d as createBitsAttrs, P as PresenceManager, w as watch, S as SPACE, E as ENTER, e as boolToEmptyStrOrUndef, g as getDataOpenClosed, f as boolToStr, h as afterTick, n as noop, i as boolToStrTrueOrUndef, M as MenuSubmenuState, F as Floating_layer, j as MenuItemState, k as MenuGroupState, l as MenuGroupHeadingState, p as MenuContentState, q as Popper_layer_force_mount, r as Popper_layer, s as MenuOpenEvent, t as isHTMLElement, u as getFloatingContentCSSVars, v as SUB_CLOSE_KEYS, x as MenuSubTriggerState, y as Portal } from "../../../chunks/popper-layer-force-mount.js";
import { g as get } from "../../../chunks/index2.js";
import { F as Floating_layer_anchor, D as Dropdown_menu, a as Dropdown_menu_trigger, b as Dropdown_menu_content, c as Dropdown_menu_label, d as Dropdown_menu_separator, C as Check, I as Input, e as Calendar, s as saveTaskTime } from "../../../chunks/task-time-store.js";
import { C as Chevron_right } from "../../../chunks/chevron-right.js";
import { I as Icon, c as createTaskDialogStore } from "../../../chunks/create-task-dialog-store.js";
import { a as apiFetch, s as switchToPersonalScope, b as switchToTeamScope, c as clearAuth, t as teamScopeStore, d as authStore } from "../../../chunks/client2.js";
import { g as goto } from "../../../chunks/client3.js";
import { c as createQuery, u as useQueryClient, a as createMutation, b as createTaskMutation, d as updateTaskMutation, e as deleteTaskMutation, f as batchCreateTasksMutation } from "../../../chunks/queries.js";
import { P as Plus } from "../../../chunks/plus.js";
import { o as on } from "../../../chunks/events.js";
import { p as projectStore } from "../../../chunks/project-store.js";
import { T as Trash_2, C as Chevron_down } from "../../../chunks/trash-2.js";
import { f as formatISODate } from "../../../chunks/calendar-utils.js";
import { t as toastStore } from "../../../chunks/toast-store.js";
async function logout() {
  const res = await apiFetch("/auth/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Logout failed: ${res.status}`);
  }
}
function Dialog_title$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      ref = null,
      child,
      children,
      level = 2,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const titleState = DialogTitleState.create({
      id: boxWith(() => id),
      level: boxWith(() => level),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, titleState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Dialog_description$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      children,
      child,
      ref = null,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const descriptionState = DialogDescriptionState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, descriptionState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
const avatarAttrs = createBitsAttrs({ component: "avatar", parts: ["root", "image", "fallback"] });
const AvatarRootContext = new Context("Avatar.Root");
class AvatarRootState {
  static create(opts) {
    return AvatarRootContext.set(new AvatarRootState(opts));
  }
  opts;
  domContext;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(this.opts.ref);
    this.loadImage = this.loadImage.bind(this);
    this.attachment = attachRef(this.opts.ref);
  }
  loadImage(src, crossorigin, referrerPolicy) {
    if (this.opts.loadingStatus.current === "loaded") return;
    let imageTimerId;
    const image = new Image();
    image.src = src;
    if (crossorigin !== void 0) image.crossOrigin = crossorigin;
    if (referrerPolicy) image.referrerPolicy = referrerPolicy;
    this.opts.loadingStatus.current = "loading";
    image.onload = () => {
      imageTimerId = this.domContext.setTimeout(
        () => {
          this.opts.loadingStatus.current = "loaded";
        },
        this.opts.delayMs.current
      );
    };
    image.onerror = () => {
      this.opts.loadingStatus.current = "error";
    };
    return () => {
      if (!imageTimerId) return;
      this.domContext.clearTimeout(imageTimerId);
    };
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [avatarAttrs.root]: "",
    "data-status": this.opts.loadingStatus.current,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class AvatarFallbackState {
  static create(opts) {
    return new AvatarFallbackState(opts, AvatarRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #style = derived(() => this.root.opts.loadingStatus.current === "loaded" ? { display: "none" } : void 0);
  get style() {
    return this.#style();
  }
  set style($$value) {
    return this.#style($$value);
  }
  #props = derived(() => ({
    style: this.style,
    "data-status": this.root.opts.loadingStatus.current,
    [avatarAttrs.fallback]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Avatar$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      delayMs = 0,
      loadingStatus = "loading",
      onLoadingStatusChange,
      child,
      children,
      id = createId(uid),
      ref = null,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const rootState = AvatarRootState.create({
      delayMs: boxWith(() => delayMs),
      loadingStatus: boxWith(() => loadingStatus, (v) => {
        if (loadingStatus !== v) {
          loadingStatus = v;
          onLoadingStatusChange?.(v);
        }
      }),
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, rootState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { loadingStatus, ref });
  });
}
function Avatar_fallback$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      id = createId(uid),
      ref = null,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const fallbackState = AvatarFallbackState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, fallbackState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></span>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
const collapsibleAttrs = createBitsAttrs({
  component: "collapsible",
  parts: ["root", "content", "trigger"]
});
const CollapsibleRootContext = new Context("Collapsible.Root");
class CollapsibleRootState {
  static create(opts) {
    return CollapsibleRootContext.set(new CollapsibleRootState(opts));
  }
  opts;
  attachment;
  contentNode = null;
  contentPresence;
  contentId = void 0;
  constructor(opts) {
    this.opts = opts;
    this.toggleOpen = this.toggleOpen.bind(this);
    this.attachment = attachRef(this.opts.ref);
    this.contentPresence = new PresenceManager({
      ref: boxWith(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": getDataOpenClosed(this.opts.open.current),
    "data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
    [collapsibleAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CollapsibleContentState {
  static create(opts) {
    return new CollapsibleContentState(opts, CollapsibleRootContext.get());
  }
  opts;
  root;
  attachment;
  #present = derived(() => {
    if (this.opts.hiddenUntilFound.current) return this.root.opts.open.current;
    return this.opts.forceMount.current || this.root.opts.open.current;
  });
  get present() {
    return this.#present();
  }
  set present($$value) {
    return this.#present($$value);
  }
  #originalStyles;
  #isMountAnimationPrevented = false;
  #width = 0;
  #height = 0;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.#isMountAnimationPrevented = root.opts.open.current;
    this.root.contentId = this.opts.id.current;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
    watch.pre(() => this.opts.id.current, (id) => {
      this.root.contentId = id;
    });
    watch.pre(
      [
        () => this.opts.ref.current,
        () => this.opts.hiddenUntilFound.current
      ],
      ([node, hiddenUntilFound]) => {
        if (!node || !hiddenUntilFound) return;
        const handleBeforeMatch = () => {
          if (this.root.opts.open.current) return;
          requestAnimationFrame(() => {
            this.root.opts.open.current = true;
          });
        };
        return on(node, "beforematch", handleBeforeMatch);
      }
    );
    watch([() => this.opts.ref.current, () => this.present], ([node]) => {
      if (!node) return;
      afterTick(() => {
        if (!this.opts.ref.current) return;
        this.#originalStyles = this.#originalStyles || {
          transitionDuration: node.style.transitionDuration,
          animationName: node.style.animationName
        };
        node.style.transitionDuration = "0s";
        node.style.animationName = "none";
        const rect = node.getBoundingClientRect();
        this.#height = rect.height;
        this.#width = rect.width;
        if (!this.#isMountAnimationPrevented) {
          const { animationName, transitionDuration } = this.#originalStyles;
          node.style.transitionDuration = transitionDuration;
          node.style.animationName = animationName;
        }
      });
    });
  }
  get shouldRender() {
    return this.root.contentPresence.shouldRender;
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: {
      "--bits-collapsible-content-height": this.#height ? `${this.#height}px` : void 0,
      "--bits-collapsible-content-width": this.#width ? `${this.#width}px` : void 0
    },
    hidden: this.opts.hiddenUntilFound.current && !this.root.opts.open.current ? "until-found" : void 0,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
    [collapsibleAttrs.content]: "",
    ...this.opts.hiddenUntilFound.current && !this.shouldRender ? {} : {
      hidden: this.opts.hiddenUntilFound.current ? !this.shouldRender : this.opts.forceMount.current ? void 0 : !this.shouldRender
    },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CollapsibleTriggerState {
  static create(opts) {
    return new CollapsibleTriggerState(opts, CollapsibleRootContext.get());
  }
  opts;
  root;
  attachment;
  #isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.#isDisabled()) return;
    if (e.button !== 0) return e.preventDefault();
    this.root.toggleOpen();
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.toggleOpen();
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    type: "button",
    disabled: this.#isDisabled(),
    "aria-controls": this.root.contentId,
    "aria-expanded": boolToStr(this.root.opts.open.current),
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
    [collapsibleAttrs.trigger]: "",
    //
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Collapsible$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      id = createId(uid),
      ref = null,
      open = false,
      disabled = false,
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const rootState = CollapsibleRootState.create({
      open: boxWith(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      disabled: boxWith(() => disabled),
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v),
      onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
    });
    const mergedProps = derived(() => mergeProps(restProps, rootState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref, open });
  });
}
function Collapsible_content$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      child,
      ref = null,
      forceMount = false,
      hiddenUntilFound = false,
      children,
      id = createId(uid),
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const contentState = CollapsibleContentState.create({
      id: boxWith(() => id),
      forceMount: boxWith(() => forceMount),
      hiddenUntilFound: boxWith(() => hiddenUntilFound),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, contentState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { ...contentState.snippetProps, props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Collapsible_trigger$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      ref = null,
      id = createId(uid),
      disabled = false,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const triggerState = CollapsibleTriggerState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v),
      disabled: boxWith(() => disabled)
    });
    const mergedProps = derived(() => mergeProps(restProps, triggerState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
const separatorAttrs = createBitsAttrs({ component: "separator", parts: ["root"] });
class SeparatorRootState {
  static create(opts) {
    return new SeparatorRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(opts.ref);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    role: this.opts.decorative.current ? "none" : "separator",
    "aria-orientation": this.opts.orientation.current,
    "aria-hidden": boolToStrTrueOrUndef(this.opts.decorative.current),
    "data-orientation": this.opts.orientation.current,
    [separatorAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Separator$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      ref = null,
      child,
      children,
      decorative = false,
      orientation = "horizontal",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const rootState = SeparatorRootState.create({
      ref: boxWith(() => ref, (v) => ref = v),
      id: boxWith(() => id),
      decorative: boxWith(() => decorative),
      orientation: boxWith(() => orientation)
    });
    const mergedProps = derived(() => mergeProps(restProps, rootState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Menu_sub($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      children
    } = $$props;
    MenuSubmenuState.create({
      open: boxWith(() => open, (v) => {
        open = v;
        onOpenChange?.(v);
      }),
      onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
    });
    Floating_layer($$renderer2, {
      children: ($$renderer3) => {
        children?.($$renderer3);
        $$renderer3.push(`<!---->`);
      }
    });
    bind_props($$props, { open });
  });
}
function Menu_item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      child,
      children,
      ref = null,
      id = createId(uid),
      disabled = false,
      onSelect = noop,
      closeOnSelect = true,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const itemState = MenuItemState.create({
      id: boxWith(() => id),
      disabled: boxWith(() => disabled),
      onSelect: boxWith(() => onSelect),
      ref: boxWith(() => ref, (v) => ref = v),
      closeOnSelect: boxWith(() => closeOnSelect)
    });
    const mergedProps = derived(() => mergeProps(restProps, itemState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Menu_group($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      ref = null,
      id = createId(uid),
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const groupState = MenuGroupState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, groupState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Menu_group_heading($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      ref = null,
      id = createId(uid),
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const groupHeadingState = MenuGroupHeadingState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, groupHeadingState.props));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Menu_sub_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      ref = null,
      children,
      child,
      loop = true,
      onInteractOutside = noop,
      forceMount = false,
      onEscapeKeydown = noop,
      interactOutsideBehavior = "defer-otherwise-close",
      escapeKeydownBehavior = "defer-otherwise-close",
      onOpenAutoFocus: onOpenAutoFocusProp = noop,
      onCloseAutoFocus: onCloseAutoFocusProp = noop,
      onFocusOutside = noop,
      side = "right",
      trapFocus = false,
      style,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const subContentState = MenuContentState.create({
      id: boxWith(() => id),
      loop: boxWith(() => loop),
      ref: boxWith(() => ref, (v) => ref = v),
      isSub: true,
      onCloseAutoFocus: boxWith(() => handleCloseAutoFocus)
    });
    function onkeydown(e) {
      const isKeyDownInside = e.currentTarget.contains(e.target);
      const isCloseKey = SUB_CLOSE_KEYS[subContentState.parentMenu.root.opts.dir.current].includes(e.key);
      if (isKeyDownInside && isCloseKey) {
        subContentState.parentMenu.onClose();
        const triggerNode = subContentState.parentMenu.triggerNode;
        triggerNode?.focus();
        e.preventDefault();
      }
    }
    const dataAttr = derived(() => subContentState.parentMenu.root.getBitsAttr("sub-content"));
    const mergedProps = derived(() => mergeProps(restProps, subContentState.props, { side, onkeydown, [dataAttr()]: "" }));
    function handleOpenAutoFocus(e) {
      onOpenAutoFocusProp(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (subContentState.parentMenu.root.isUsingKeyboard && subContentState.parentMenu.contentNode) {
        MenuOpenEvent.dispatch(subContentState.parentMenu.contentNode);
      }
    }
    function handleCloseAutoFocus(e) {
      onCloseAutoFocusProp(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
    }
    function handleInteractOutside(e) {
      onInteractOutside(e);
      if (e.defaultPrevented) return;
      subContentState.parentMenu.onClose();
    }
    function handleEscapeKeydown(e) {
      onEscapeKeydown(e);
      if (e.defaultPrevented) return;
      subContentState.parentMenu.onClose();
    }
    function handleOnFocusOutside(e) {
      onFocusOutside(e);
      if (e.defaultPrevented) return;
      if (!isHTMLElement(e.target)) return;
      if (e.target.id !== subContentState.parentMenu.triggerNode?.id) {
        subContentState.parentMenu.onClose();
      }
    }
    if (forceMount) {
      $$renderer2.push("<!--[-->");
      {
        let popper = function($$renderer3, { props, wrapperProps }) {
          const finalProps = mergeProps(props, mergedProps(), { style: getFloatingContentCSSVars("menu") }, { style });
          if (child) {
            $$renderer3.push("<!--[-->");
            child($$renderer3, {
              props: finalProps,
              wrapperProps,
              ...subContentState.snippetProps
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
            children?.($$renderer3);
            $$renderer3.push(`<!----></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        };
        Popper_layer_force_mount($$renderer2, spread_props([
          mergedProps(),
          {
            ref: subContentState.opts.ref,
            interactOutsideBehavior,
            escapeKeydownBehavior,
            onOpenAutoFocus: handleOpenAutoFocus,
            enabled: subContentState.parentMenu.opts.open.current,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            onFocusOutside: handleOnFocusOutside,
            preventScroll: false,
            loop,
            trapFocus,
            shouldRender: subContentState.shouldRender,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else if (!forceMount) {
      $$renderer2.push("<!--[1-->");
      {
        let popper = function($$renderer3, { props, wrapperProps }) {
          const finalProps = mergeProps(props, mergedProps(), { style: getFloatingContentCSSVars("menu") }, { style });
          if (child) {
            $$renderer3.push("<!--[-->");
            child($$renderer3, {
              props: finalProps,
              wrapperProps,
              ...subContentState.snippetProps
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
            children?.($$renderer3);
            $$renderer3.push(`<!----></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        };
        Popper_layer($$renderer2, spread_props([
          mergedProps(),
          {
            ref: subContentState.opts.ref,
            interactOutsideBehavior,
            escapeKeydownBehavior,
            onCloseAutoFocus: handleCloseAutoFocus,
            onOpenAutoFocus: handleOpenAutoFocus,
            open: subContentState.parentMenu.opts.open.current,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            onFocusOutside: handleOnFocusOutside,
            preventScroll: false,
            loop,
            trapFocus,
            shouldRender: subContentState.shouldRender,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Menu_sub_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      disabled = false,
      ref = null,
      children,
      child,
      onSelect = noop,
      openDelay = 100,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const subTriggerState = MenuSubTriggerState.create({
      disabled: boxWith(() => disabled),
      onSelect: boxWith(() => onSelect),
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v),
      openDelay: boxWith(() => openDelay)
    });
    const mergedProps = derived(() => mergeProps(restProps, subTriggerState.props));
    Floating_layer_anchor($$renderer2, {
      id,
      ref: subTriggerState.opts.ref,
      children: ($$renderer3) => {
        if (child) {
          $$renderer3.push("<!--[-->");
          child($$renderer3, { props: mergedProps() });
          $$renderer3.push(`<!---->`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div${attributes({ ...mergedProps() })}>`);
          children?.($$renderer3);
          $$renderer3.push(`<!----></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    bind_props($$props, { ref });
  });
}
function Dialog$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      children
    } = $$props;
    DialogRootState.create({
      variant: boxWith(() => "dialog"),
      open: boxWith(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
    });
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
    bind_props($$props, { open });
  });
}
const labelAttrs = createBitsAttrs({ component: "label", parts: ["root"] });
class LabelRootState {
  static create(opts) {
    return new LabelRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
    this.onmousedown = this.onmousedown.bind(this);
  }
  onmousedown(e) {
    if (e.detail > 1) e.preventDefault();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    [labelAttrs.root]: "",
    onmousedown: this.onmousedown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Label$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      id = createId(uid),
      ref = null,
      for: forProp,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const rootState = LabelRootState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, rootState.props, { for: forProp }));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<label${attributes({ ...mergedProps(), for: forProp })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></label>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Tooltip_provider$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      children,
      delayDuration = 700,
      disableCloseOnTriggerClick = false,
      disableHoverableContent = false,
      disabled = false,
      ignoreNonKeyboardFocus = false,
      skipDelayDuration = 300
    } = $$props;
    TooltipProviderState.create({
      delayDuration: boxWith(() => delayDuration),
      disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
      disableHoverableContent: boxWith(() => disableHoverableContent),
      disabled: boxWith(() => disabled),
      ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
      skipDelayDuration: boxWith(() => skipDelayDuration)
    });
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
function Dropdown_menu_sub($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Menu_sub) {
        $$renderer3.push("<!--[-->");
        Menu_sub($$renderer3, spread_props([
          restProps,
          {
            get open() {
              return open;
            },
            set open($$value) {
              open = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
function Dropdown_menu_group($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Menu_group) {
        $$renderer3.push("<!--[-->");
        Menu_group($$renderer3, spread_props([
          { "data-slot": "dropdown-menu-group" },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dropdown_menu_item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      inset,
      variant = "default",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Menu_item) {
        $$renderer3.push("<!--[-->");
        Menu_item($$renderer3, spread_props([
          {
            "data-slot": "dropdown-menu-item",
            "data-inset": inset,
            "data-variant": variant,
            class: cn("data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dropdown_menu_sub_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Menu_sub_content) {
        $$renderer3.push("<!--[-->");
        Menu_sub_content($$renderer3, spread_props([
          {
            "data-slot": "dropdown-menu-sub-content",
            class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--bits-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dropdown_menu_sub_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      inset,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Menu_sub_trigger) {
        $$renderer3.push("<!--[-->");
        Menu_sub_trigger($$renderer3, spread_props([
          {
            "data-slot": "dropdown-menu-sub-trigger",
            "data-inset": inset,
            class: cn("data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)
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
            children: ($$renderer4) => {
              children?.($$renderer4);
              $$renderer4.push(`<!----> `);
              Chevron_right($$renderer4, { class: "ms-auto size-4" });
              $$renderer4.push(`<!---->`);
            },
            $$slots: { default: true }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dropdown_menu_group_heading($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      inset,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Menu_group_heading) {
        $$renderer3.push("<!--[-->");
        Menu_group_heading($$renderer3, spread_props([
          {
            "data-slot": "dropdown-menu-group-heading",
            "data-inset": inset,
            class: cn("px-2 py-1.5 text-sm font-semibold data-[inset]:ps-8", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Calendar_days($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M8 2v4" }],
      ["path", { "d": "M16 2v4" }],
      [
        "rect",
        { "width": "18", "height": "18", "x": "3", "y": "4", "rx": "2" }
      ],
      ["path", { "d": "M3 10h18" }],
      ["path", { "d": "M8 14h.01" }],
      ["path", { "d": "M12 14h.01" }],
      ["path", { "d": "M16 14h.01" }],
      ["path", { "d": "M8 18h.01" }],
      ["path", { "d": "M12 18h.01" }],
      ["path", { "d": "M16 18h.01" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "calendar-days" },
      /**
       * @component @name CalendarDays
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOCAydjQiIC8+CiAgPHBhdGggZD0iTTE2IDJ2NCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDEwaDE4IiAvPgogIDxwYXRoIGQ9Ik04IDE0aC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMTRoLjAxIiAvPgogIDxwYXRoIGQ9Ik0xNiAxNGguMDEiIC8+CiAgPHBhdGggZD0iTTggMThoLjAxIiAvPgogIDxwYXRoIGQ9Ik0xMiAxOGguMDEiIC8+CiAgPHBhdGggZD0iTTE2IDE4aC4wMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/calendar-days
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
function Chevrons_up_down($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "m7 15 5 5 5-5" }],
      ["path", { "d": "m7 9 5-5 5 5" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "chevrons-up-down" },
      /**
       * @component @name ChevronsUpDown
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNyAxNSA1IDUgNS01IiAvPgogIDxwYXRoIGQ9Im03IDkgNS01IDUgNSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/chevrons-up-down
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
function Computer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        { "width": "14", "height": "8", "x": "5", "y": "2", "rx": "2" }
      ],
      [
        "rect",
        { "width": "20", "height": "8", "x": "2", "y": "14", "rx": "2" }
      ],
      ["path", { "d": "M6 18h2" }],
      ["path", { "d": "M12 18h6" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "computer" },
      /**
       * @component @name Computer
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iOCIgeD0iNSIgeT0iMiIgcng9IjIiIC8+CiAgPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjgiIHg9IjIiIHk9IjE0IiByeD0iMiIgLz4KICA8cGF0aCBkPSJNNiAxOGgyIiAvPgogIDxwYXRoIGQ9Ik0xMiAxOGg2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/computer
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
function Ellipsis($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "1" }],
      ["circle", { "cx": "19", "cy": "12", "r": "1" }],
      ["circle", { "cx": "5", "cy": "12", "r": "1" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "ellipsis" },
      /**
       * @component @name Ellipsis
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE5IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iNSIgY3k9IjEyIiByPSIxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/ellipsis
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
function Folder_plus($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M12 10v6" }],
      ["path", { "d": "M9 13h6" }],
      [
        "path",
        {
          "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "folder-plus" },
      /**
       * @component @name FolderPlus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMTB2NiIgLz4KICA8cGF0aCBkPSJNOSAxM2g2IiAvPgogIDxwYXRoIGQ9Ik0yMCAyMGEyIDIgMCAwIDAgMi0yVjhhMiAyIDAgMCAwLTItMmgtNy45YTIgMiAwIDAgMS0xLjY5LS45TDkuNiAzLjlBMiAyIDAgMCAwIDcuOTMgM0g0YTIgMiAwIDAgMC0yIDJ2MTNhMiAyIDAgMCAwIDIgMloiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/folder-plus
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
function Folder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "folder" },
      /**
       * @component @name Folder
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMjBhMiAyIDAgMCAwIDItMlY4YTIgMiAwIDAgMC0yLTJoLTcuOWEyIDIgMCAwIDEtMS42OS0uOUw5LjYgMy45QTIgMiAwIDAgMCA3LjkzIDNINGEyIDIgMCAwIDAtMiAydjEzYTIgMiAwIDAgMCAyIDJaIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/folder
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
function Hash($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["line", { "x1": "4", "x2": "20", "y1": "9", "y2": "9" }],
      ["line", { "x1": "4", "x2": "20", "y1": "15", "y2": "15" }],
      ["line", { "x1": "10", "x2": "8", "y1": "3", "y2": "21" }],
      ["line", { "x1": "16", "x2": "14", "y1": "3", "y2": "21" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "hash" },
      /**
       * @component @name Hash
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iOSIgeTI9IjkiIC8+CiAgPGxpbmUgeDE9IjQiIHgyPSIyMCIgeTE9IjE1IiB5Mj0iMTUiIC8+CiAgPGxpbmUgeDE9IjEwIiB4Mj0iOCIgeTE9IjMiIHkyPSIyMSIgLz4KICA8bGluZSB4MT0iMTYiIHgyPSIxNCIgeTE9IjMiIHkyPSIyMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/hash
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
function Inbox($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "polyline",
        { "points": "22 12 16 12 14 15 10 15 8 12 2 12" }
      ],
      [
        "path",
        {
          "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "inbox" },
      /**
       * @component @name Inbox
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIyMiAxMiAxNiAxMiAxNCAxNSAxMCAxNSA4IDEyIDIgMTIiIC8+CiAgPHBhdGggZD0iTTUuNDUgNS4xMSAyIDEydjZhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0ydi02bC0zLjQ1LTYuODlBMiAyIDAgMCAwIDE2Ljc2IDRINy4yNGEyIDIgMCAwIDAtMS43OSAxLjExeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/inbox
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
function Log_out($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "m16 17 5-5-5-5" }],
      ["path", { "d": "M21 12H9" }],
      ["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "log-out" },
      /**
       * @component @name LogOut
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgMTcgNS01LTUtNSIgLz4KICA8cGF0aCBkPSJNMjEgMTJIOSIgLz4KICA8cGF0aCBkPSJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/log-out
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
function Moon($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "moon" },
      /**
       * @component @name Moon
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAuOTg1IDEyLjQ4NmE5IDkgMCAxIDEtOS40NzMtOS40NzJjLjQwNS0uMDIyLjYxNy40Ni40MDIuODAzYTYgNiAwIDAgMCA4LjI2OCA4LjI2OGMuMzQ0LS4yMTUuODI1LS4wMDQuODAzLjQwMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/moon
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
function Orbit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M20.341 6.484A10 10 0 0 1 10.266 21.85" }],
      ["path", { "d": "M3.659 17.516A10 10 0 0 1 13.74 2.152" }],
      ["circle", { "cx": "12", "cy": "12", "r": "3" }],
      ["circle", { "cx": "19", "cy": "5", "r": "2" }],
      ["circle", { "cx": "5", "cy": "19", "r": "2" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "orbit" },
      /**
       * @component @name Orbit
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAuMzQxIDYuNDg0QTEwIDEwIDAgMCAxIDEwLjI2NiAyMS44NSIgLz4KICA8cGF0aCBkPSJNMy42NTkgMTcuNTE2QTEwIDEwIDAgMCAxIDEzLjc0IDIuMTUyIiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIC8+CiAgPGNpcmNsZSBjeD0iMTkiIGN5PSI1IiByPSIyIiAvPgogIDxjaXJjbGUgY3g9IjUiIGN5PSIxOSIgcj0iMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/orbit
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
function Send($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
        }
      ],
      ["path", { "d": "m21.854 2.147-10.94 10.939" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "send" },
      /**
       * @component @name Send
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTQuNTM2IDIxLjY4NmEuNS41IDAgMCAwIC45MzctLjAyNGw2LjUtMTlhLjQ5Ni40OTYgMCAwIDAtLjYzNS0uNjM1bC0xOSA2LjVhLjUuNSAwIDAgMC0uMDI0LjkzN2w3LjkzIDMuMThhMiAyIDAgMCAxIDEuMTEyIDEuMTF6IiAvPgogIDxwYXRoIGQ9Im0yMS44NTQgMi4xNDctMTAuOTQgMTAuOTM5IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/send
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
function Sun($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "4" }],
      ["path", { "d": "M12 2v2" }],
      ["path", { "d": "M12 20v2" }],
      ["path", { "d": "m4.93 4.93 1.41 1.41" }],
      ["path", { "d": "m17.66 17.66 1.41 1.41" }],
      ["path", { "d": "M2 12h2" }],
      ["path", { "d": "M20 12h2" }],
      ["path", { "d": "m6.34 17.66-1.41 1.41" }],
      ["path", { "d": "m19.07 4.93-1.41 1.41" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "sun" },
      /**
       * @component @name Sun
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiAvPgogIDxwYXRoIGQ9Ik0xMiAydjIiIC8+CiAgPHBhdGggZD0iTTEyIDIwdjIiIC8+CiAgPHBhdGggZD0ibTQuOTMgNC45MyAxLjQxIDEuNDEiIC8+CiAgPHBhdGggZD0ibTE3LjY2IDE3LjY2IDEuNDEgMS40MSIgLz4KICA8cGF0aCBkPSJNMiAxMmgyIiAvPgogIDxwYXRoIGQ9Ik0yMCAxMmgyIiAvPgogIDxwYXRoIGQ9Im02LjM0IDE3LjY2LTEuNDEgMS40MSIgLz4KICA8cGF0aCBkPSJtMTkuMDcgNC45My0xLjQxIDEuNDEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/sun
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
function User($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
      ["circle", { "cx": "12", "cy": "7", "r": "4" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "user" },
      /**
       * @component @name User
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/user
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
function Users($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
      ["path", { "d": "M16 3.128a4 4 0 0 1 0 7.744" }],
      ["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
      ["circle", { "cx": "9", "cy": "7", "r": "4" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "users" },
      /**
       * @component @name Users
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg2YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8cGF0aCBkPSJNMTYgMy4xMjhhNCA0IDAgMCAxIDAgNy43NDQiIC8+CiAgPHBhdGggZD0iTTIyIDIxdi0yYTQgNCAwIDAgMC0zLTMuODciIC8+CiAgPGNpcmNsZSBjeD0iOSIgY3k9IjciIHI9IjQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/users
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
function Wallet($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
        }
      ],
      ["path", { "d": "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "wallet" },
      /**
       * @component @name Wallet
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgN1Y0YTEgMSAwIDAgMC0xLTFINWEyIDIgMCAwIDAgMCA0aDE1YTEgMSAwIDAgMSAxIDF2NGgtM2EyIDIgMCAwIDAgMCA0aDNhMSAxIDAgMCAwIDEtMXYtMmExIDEgMCAwIDAtMS0xIiAvPgogIDxwYXRoIGQ9Ik0zIDV2MTRhMiAyIDAgMCAwIDIgMmgxNWExIDEgMCAwIDAgMS0xdi00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/wallet
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
function Theme_toggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const options = [
      { value: "light", label: "Hell" },
      { value: "dark", label: "Dunkel" },
      { value: "system", label: "System" }
    ];
    Dropdown_menu($$renderer2, {
      children: ($$renderer3) => {
        Dropdown_menu_trigger($$renderer3, {
          class: "relative inline-flex cursor-pointer items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground",
          "aria-label": "Theme umschalten",
          children: ($$renderer4) => {
            if (store_get($$store_subs ??= {}, "$themeStore", themeStore) === "light") {
              $$renderer4.push("<!--[-->");
              Sun($$renderer4, { class: "size-4" });
            } else if (store_get($$store_subs ??= {}, "$themeStore", themeStore) === "dark") {
              $$renderer4.push("<!--[1-->");
              Moon($$renderer4, { class: "size-4" });
            } else {
              $$renderer4.push("<!--[!-->");
              Computer($$renderer4, { class: "size-4" });
            }
            $$renderer4.push(`<!--]--> Theme`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Dropdown_menu_content($$renderer3, {
          align: "end",
          children: ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(options);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let opt = each_array[$$index];
              Dropdown_menu_item($$renderer4, {
                onclick: () => setTheme(opt.value),
                class: store_get($$store_subs ??= {}, "$themeStore", themeStore) === opt.value ? "font-semibold" : "",
                children: ($$renderer5) => {
                  $$renderer5.push(`<!---->${escape_html(opt.label)}`);
                },
                $$slots: { default: true }
              });
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Avatar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      loadingStatus = "loading",
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Avatar$1) {
        $$renderer3.push("<!--[-->");
        Avatar$1($$renderer3, spread_props([
          {
            "data-slot": "avatar",
            class: cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)
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
            get loadingStatus() {
              return loadingStatus;
            },
            set loadingStatus($$value) {
              loadingStatus = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref, loadingStatus });
  });
}
function Avatar_fallback($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Avatar_fallback$1) {
        $$renderer3.push("<!--[-->");
        Avatar_fallback$1($$renderer3, spread_props([
          {
            "data-slot": "avatar-fallback",
            class: cn("bg-muted flex size-full items-center justify-center rounded-full", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Sidebar_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      class: clsx(cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Sidebar_footer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      class: clsx(cn("flex flex-col gap-2 p-2", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Sidebar_group_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      class: clsx(cn("w-full text-sm", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Sidebar_group_label($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      children,
      child,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const mergedProps = derived(() => ({
      class: cn("text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className),
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label",
      ...restProps
    }));
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps() });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Sidebar_header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      class: clsx(cn("flex flex-col gap-2 p-2", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Tooltip_provider($$renderer, $$props) {
  let { $$slots, $$events, ...restProps } = $$props;
  if (Tooltip_provider$1) {
    $$renderer.push("<!--[-->");
    Tooltip_provider$1($$renderer, spread_props([restProps]));
    $$renderer.push("<!--]-->");
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push("<!--]-->");
  }
}
function Sidebar_menu_item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<li${attributes({
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      class: clsx(cn("group/menu-item relative", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></li>`);
    bind_props($$props, { ref });
  });
}
function Sidebar_menu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<ul${attributes({
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      class: clsx(cn("flex w-full min-w-0 flex-col gap-1", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></ul>`);
    bind_props($$props, { ref });
  });
}
function Sidebar_provider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      open = true,
      onOpenChange = () => {
      },
      class: className,
      style,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    setSidebar({
      open: () => open,
      setOpen: (value) => {
        open = value;
        onOpenChange(value);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    });
    if (Tooltip_provider) {
      $$renderer2.push("<!--[-->");
      Tooltip_provider($$renderer2, {
        delayDuration: 0,
        children: ($$renderer3) => {
          $$renderer3.push(`<div${attributes({
            "data-slot": "sidebar-wrapper",
            style: `--sidebar-width: ${stringify(SIDEBAR_WIDTH)}; --sidebar-width-icon: ${stringify(SIDEBAR_WIDTH_ICON)}; ${stringify(style)}`,
            class: clsx(cn("group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full", className)),
            ...restProps
          })}>`);
          children?.($$renderer3);
          $$renderer3.push(`<!----></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push("<!--]-->");
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push("<!--]-->");
    }
    bind_props($$props, { ref, open });
  });
}
function Separator($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      "data-slot": dataSlot = "separator",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Separator$1) {
        $$renderer3.push("<!--[-->");
        Separator$1($$renderer3, spread_props([
          {
            "data-slot": dataSlot,
            class: cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-px", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Sidebar_separator($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Separator($$renderer3, spread_props([
        {
          "data-slot": "sidebar-separator",
          "data-sidebar": "separator",
          class: cn("bg-sidebar-border", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Sheet($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog$1) {
        $$renderer3.push("<!--[-->");
        Dialog$1($$renderer3, spread_props([
          restProps,
          {
            get open() {
              return open;
            },
            set open($$value) {
              open = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
function Sheet_header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "sheet-header",
      class: clsx(cn("flex flex-col gap-1.5 p-4", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Sheet_title($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog_title$1) {
        $$renderer3.push("<!--[-->");
        Dialog_title$1($$renderer3, spread_props([
          {
            "data-slot": "sheet-title",
            class: cn("text-foreground font-semibold", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Sheet_description($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog_description$1) {
        $$renderer3.push("<!--[-->");
        Dialog_description$1($$renderer3, spread_props([
          {
            "data-slot": "sheet-description",
            class: cn("text-muted-foreground text-sm", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const sidebar = useSidebar();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (collapsible === "none") {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div${attributes({
          class: clsx(cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)),
          ...restProps
        })}>`);
        children?.($$renderer3);
        $$renderer3.push(`<!----></div>`);
      } else if (sidebar.isMobile) {
        $$renderer3.push("<!--[1-->");
        var bind_get = () => sidebar.openMobile;
        var bind_set = (v) => sidebar.setOpenMobile(v);
        if (Sheet) {
          $$renderer3.push("<!--[-->");
          Sheet($$renderer3, spread_props([
            {
              get open() {
                return bind_get();
              },
              set open($$value) {
                bind_set($$value);
              }
            },
            restProps,
            {
              children: ($$renderer4) => {
                if (Sheet_content) {
                  $$renderer4.push("<!--[-->");
                  Sheet_content($$renderer4, {
                    "data-sidebar": "sidebar",
                    "data-slot": "sidebar",
                    "data-mobile": "true",
                    class: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
                    style: `--sidebar-width: ${stringify(SIDEBAR_WIDTH_MOBILE)};`,
                    side,
                    children: ($$renderer5) => {
                      if (Sheet_header) {
                        $$renderer5.push("<!--[-->");
                        Sheet_header($$renderer5, {
                          class: "sr-only",
                          children: ($$renderer6) => {
                            if (Sheet_title) {
                              $$renderer6.push("<!--[-->");
                              Sheet_title($$renderer6, {
                                children: ($$renderer7) => {
                                  $$renderer7.push(`<!---->Sidebar`);
                                },
                                $$slots: { default: true }
                              });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                            $$renderer6.push(` `);
                            if (Sheet_description) {
                              $$renderer6.push("<!--[-->");
                              Sheet_description($$renderer6, {
                                children: ($$renderer7) => {
                                  $$renderer7.push(`<!---->Displays the mobile sidebar.`);
                                },
                                $$slots: { default: true }
                              });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                          },
                          $$slots: { default: true }
                        });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                      $$renderer5.push(` <div class="flex h-full w-full flex-col">`);
                      children?.($$renderer5);
                      $$renderer5.push(`<!----></div>`);
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
            }
          ]));
          $$renderer3.push("<!--]-->");
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push("<!--]-->");
        }
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="group peer hidden text-sidebar-foreground md:block"${attr("data-state", sidebar.state)}${attr("data-collapsible", sidebar.state === "collapsed" ? collapsible : "")}${attr("data-variant", variant)}${attr("data-side", side)} data-slot="sidebar"><div data-slot="sidebar-gap"${attr_class(clsx(cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")))}></div> <div${attributes({
          "data-slot": "sidebar-container",
          class: clsx(cn(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left" ? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]" : "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",
            variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s",
            className
          )),
          ...restProps
        })}><div data-sidebar="sidebar" data-slot="sidebar-inner" class="flex h-full w-full flex-col bg-sidebar/10 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm">`);
        children?.($$renderer3);
        $$renderer3.push(`<!----></div></div></div>`);
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog$1) {
        $$renderer3.push("<!--[-->");
        Dialog$1($$renderer3, spread_props([
          restProps,
          {
            get open() {
              return open;
            },
            set open($$value) {
              open = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
function Dialog_portal($$renderer, $$props) {
  let { $$slots, $$events, ...restProps } = $$props;
  if (Portal) {
    $$renderer.push("<!--[-->");
    Portal($$renderer, spread_props([restProps]));
    $$renderer.push("<!--]-->");
  } else {
    $$renderer.push("<!--[!-->");
    $$renderer.push("<!--]-->");
  }
}
function Dialog_title($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog_title$1) {
        $$renderer3.push("<!--[-->");
        Dialog_title$1($$renderer3, spread_props([
          {
            "data-slot": "dialog-title",
            class: cn("text-lg leading-none font-semibold", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dialog_footer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "dialog-footer",
      class: clsx(cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Dialog_header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<div${attributes({
      "data-slot": "dialog-header",
      class: clsx(cn("flex flex-col gap-2 text-center sm:text-start", className)),
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
    bind_props($$props, { ref });
  });
}
function Dialog_overlay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog_overlay$1) {
        $$renderer3.push("<!--[-->");
        Dialog_overlay$1($$renderer3, spread_props([
          {
            "data-slot": "dialog-overlay",
            class: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dialog_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      portalProps,
      children,
      showCloseButton = true,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dialog_portal($$renderer3, spread_props([
        portalProps,
        {
          children: ($$renderer4) => {
            if (Dialog_overlay) {
              $$renderer4.push("<!--[-->");
              Dialog_overlay($$renderer4, {});
              $$renderer4.push("<!--]-->");
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push("<!--]-->");
            }
            $$renderer4.push(` `);
            if (Dialog_content$1) {
              $$renderer4.push("<!--[-->");
              Dialog_content$1($$renderer4, spread_props([
                {
                  "data-slot": "dialog-content",
                  class: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className)
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
                  children: ($$renderer5) => {
                    children?.($$renderer5);
                    $$renderer5.push(`<!----> `);
                    if (showCloseButton) {
                      $$renderer5.push("<!--[-->");
                      if (Dialog_close$1) {
                        $$renderer5.push("<!--[-->");
                        Dialog_close$1($$renderer5, {
                          class: "ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                          children: ($$renderer6) => {
                            X($$renderer6, {});
                            $$renderer6.push(`<!----> <span class="sr-only">Close</span>`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    } else {
                      $$renderer5.push("<!--[!-->");
                    }
                    $$renderer5.push(`<!--]-->`);
                  },
                  $$slots: { default: true }
                }
              ]));
              $$renderer4.push("<!--]-->");
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push("<!--]-->");
            }
          },
          $$slots: { default: true }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dialog_description($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog_description$1) {
        $$renderer3.push("<!--[-->");
        Dialog_description$1($$renderer3, spread_props([
          {
            "data-slot": "dialog-description",
            class: cn("text-muted-foreground text-sm", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Dialog_close($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog_close$1) {
        $$renderer3.push("<!--[-->");
        Dialog_close$1($$renderer3, spread_props([
          { "data-slot": "dialog-close" },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Label($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Label$1) {
        $$renderer3.push("<!--[-->");
        Label$1($$renderer3, spread_props([
          {
            "data-slot": "label",
            class: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
async function fetchTeams() {
  const res = await apiFetch("/teams");
  if (!res.ok) {
    throw new Error(`Teams fetch failed: ${res.status}`);
  }
  return await res.json();
}
async function createTeam(input) {
  const res = await apiFetch("/teams", {
    method: "POST",
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Team create failed: ${res.status}`);
  }
  return await res.json();
}
async function inviteTeamMember(input) {
  const res = await apiFetch(`/teams/${input.teamId}/invites`, {
    method: "POST",
    body: JSON.stringify({ email: input.email })
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Team invite failed: ${res.status}`);
  }
  return await res.json();
}
async function fetchMyInvitations() {
  const res = await apiFetch("/teams/invites");
  if (!res.ok) {
    throw new Error(`Team invites fetch failed: ${res.status}`);
  }
  return await res.json();
}
async function acceptInvitation(invitationId) {
  const res = await apiFetch(`/teams/invites/${invitationId}/accept`, {
    method: "POST"
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Invite accept failed: ${res.status}`);
  }
  return await res.json();
}
const teamsQuery = () => createQuery({
  queryKey: ["teams"],
  queryFn: fetchTeams
});
const teamInvitationsQuery = () => createQuery({
  queryKey: ["teams", "invites"],
  queryFn: fetchMyInvitations
});
const createTeamMutation = () => {
  const queryClient = useQueryClient();
  return createMutation(
    {
      mutationFn: (input) => createTeam(input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
      }
    },
    queryClient
  );
};
const inviteMemberMutation = () => {
  const queryClient = useQueryClient();
  return createMutation(
    {
      mutationFn: (input) => inviteTeamMember(input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams", "invites"] });
      }
    },
    queryClient
  );
};
const acceptInvitationMutation = () => {
  const queryClient = useQueryClient();
  return createMutation(
    {
      mutationFn: (invitationId) => acceptInvitation(invitationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["teams", "invites"] });
      }
    },
    queryClient
  );
};
function Nav_user($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { user } = $$props;
    const sidebar = useSidebar();
    const teamsState = teamsQuery();
    const teamInvitationsState = teamInvitationsQuery();
    const createTeamState = createTeamMutation();
    const inviteMemberState = inviteMemberMutation();
    const acceptInvitationState = acceptInvitationMutation();
    const teams = derived(() => store_get($$store_subs ??= {}, "$teamsState", teamsState).data ?? []);
    const teamInvitations = derived(() => store_get($$store_subs ??= {}, "$teamInvitationsState", teamInvitationsState).data ?? []);
    const scope = derived(() => store_get($$store_subs ??= {}, "$teamScopeStore", teamScopeStore));
    const activeTeam = derived(() => scope().type === "team" ? teams().find((team) => team.id === scope().teamId) ?? null : null);
    let teamDialogOpen = false;
    let teamName = "";
    let teamDescription = "";
    let inviteDialogOpen = false;
    let inviteEmail = "";
    async function handleLogout() {
      try {
        await logout();
      } catch {
      }
      clearAuth();
      goto("/login", {});
    }
    function openCreateTeamDialog() {
      teamName = "";
      teamDescription = "";
      teamDialogOpen = true;
    }
    function openInviteDialog(teamId) {
      inviteEmail = "";
      inviteDialogOpen = true;
    }
    function acceptInvitation2(invitationId) {
      get(acceptInvitationState).mutate(invitationId, {
        onSuccess: (invitation) => {
          switchToTeamScope(invitation.teamId, invitation.teamName);
        }
      });
    }
    function switchScopeToTeam(team) {
      switchToTeamScope(team.id, team.name);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (user) {
        $$renderer3.push("<!--[-->");
        if (Sidebar_menu) {
          $$renderer3.push("<!--[-->");
          Sidebar_menu($$renderer3, {
            children: ($$renderer4) => {
              if (Sidebar_menu_item) {
                $$renderer4.push("<!--[-->");
                Sidebar_menu_item($$renderer4, {
                  children: ($$renderer5) => {
                    if (Dropdown_menu) {
                      $$renderer5.push("<!--[-->");
                      Dropdown_menu($$renderer5, {
                        children: ($$renderer6) => {
                          {
                            let child = function($$renderer7, { props }) {
                              if (Sidebar_menu_button) {
                                $$renderer7.push("<!--[-->");
                                Sidebar_menu_button($$renderer7, spread_props([
                                  props,
                                  {
                                    size: "lg",
                                    class: "cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                                    children: ($$renderer8) => {
                                      if (Avatar) {
                                        $$renderer8.push("<!--[-->");
                                        Avatar($$renderer8, {
                                          class: "size-8 rounded-lg",
                                          children: ($$renderer9) => {
                                            if (Avatar_fallback) {
                                              $$renderer9.push("<!--[-->");
                                              Avatar_fallback($$renderer9, {
                                                class: "rounded-lg",
                                                children: ($$renderer10) => {
                                                  $$renderer10.push(`<!---->${escape_html(user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase())}`);
                                                },
                                                $$slots: { default: true }
                                              });
                                              $$renderer9.push("<!--]-->");
                                            } else {
                                              $$renderer9.push("<!--[!-->");
                                              $$renderer9.push("<!--]-->");
                                            }
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                      $$renderer8.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${escape_html(user.firstName)} ${escape_html(user.lastName)}</span> <span class="truncate text-xs">${escape_html(user.email)}</span></div> `);
                                      Chevrons_up_down($$renderer8, { class: "ms-auto size-4" });
                                      $$renderer8.push(`<!---->`);
                                    },
                                    $$slots: { default: true }
                                  }
                                ]));
                                $$renderer7.push("<!--]-->");
                              } else {
                                $$renderer7.push("<!--[!-->");
                                $$renderer7.push("<!--]-->");
                              }
                            };
                            if (Dropdown_menu_trigger) {
                              $$renderer6.push("<!--[-->");
                              Dropdown_menu_trigger($$renderer6, { child, $$slots: { child: true } });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                          }
                          $$renderer6.push(` `);
                          if (Dropdown_menu_content) {
                            $$renderer6.push("<!--[-->");
                            Dropdown_menu_content($$renderer6, {
                              class: "w-(--bits-dropdown-menu-anchor-width) min-w-64 rounded-lg",
                              side: sidebar.isMobile ? "bottom" : "right",
                              align: "start",
                              sideOffset: 4,
                              children: ($$renderer7) => {
                                if (Dropdown_menu_label) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_label($$renderer7, {
                                    class: "p-0 font-normal",
                                    children: ($$renderer8) => {
                                      $$renderer8.push(`<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">`);
                                      if (Avatar) {
                                        $$renderer8.push("<!--[-->");
                                        Avatar($$renderer8, {
                                          class: "size-8 rounded-lg",
                                          children: ($$renderer9) => {
                                            if (Avatar_fallback) {
                                              $$renderer9.push("<!--[-->");
                                              Avatar_fallback($$renderer9, {
                                                class: "rounded-lg",
                                                children: ($$renderer10) => {
                                                  $$renderer10.push(`<!---->${escape_html(user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase())}`);
                                                },
                                                $$slots: { default: true }
                                              });
                                              $$renderer9.push("<!--]-->");
                                            } else {
                                              $$renderer9.push("<!--[!-->");
                                              $$renderer9.push("<!--]-->");
                                            }
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                      $$renderer8.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${escape_html(user.firstName)} ${escape_html(user.lastName)}</span> <span class="truncate text-xs">${escape_html(user.email)}</span></div></div>`);
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                                $$renderer7.push(` `);
                                if (Dropdown_menu_separator) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_separator($$renderer7, {});
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                                $$renderer7.push(` `);
                                if (Dropdown_menu_group) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_group($$renderer7, {
                                    children: ($$renderer8) => {
                                      if (Dropdown_menu_group_heading) {
                                        $$renderer8.push("<!--[-->");
                                        Dropdown_menu_group_heading($$renderer8, {
                                          class: "px-2 py-1 text-xs tracking-wide text-muted-foreground uppercase",
                                          children: ($$renderer9) => {
                                            $$renderer9.push(`<!---->Account`);
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                      $$renderer8.push(` `);
                                      if (Dropdown_menu_item) {
                                        $$renderer8.push("<!--[-->");
                                        Dropdown_menu_item($$renderer8, {
                                          class: "cursor-pointer",
                                          onclick: switchToPersonalScope,
                                          children: ($$renderer9) => {
                                            User($$renderer9, { class: "size-4" });
                                            $$renderer9.push(`<!----> Persönlich `);
                                            if (scope().type === "personal") {
                                              $$renderer9.push("<!--[-->");
                                              Check($$renderer9, { class: "ml-auto size-4" });
                                            } else {
                                              $$renderer9.push("<!--[!-->");
                                            }
                                            $$renderer9.push(`<!--]-->`);
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                      $$renderer8.push(` `);
                                      if (Dropdown_menu_sub) {
                                        $$renderer8.push("<!--[-->");
                                        Dropdown_menu_sub($$renderer8, {
                                          children: ($$renderer9) => {
                                            if (Dropdown_menu_sub_trigger) {
                                              $$renderer9.push("<!--[-->");
                                              Dropdown_menu_sub_trigger($$renderer9, {
                                                children: ($$renderer10) => {
                                                  Users($$renderer10, { class: "size-4" });
                                                  $$renderer10.push(`<!----> Team wählen`);
                                                },
                                                $$slots: { default: true }
                                              });
                                              $$renderer9.push("<!--]-->");
                                            } else {
                                              $$renderer9.push("<!--[!-->");
                                              $$renderer9.push("<!--]-->");
                                            }
                                            $$renderer9.push(` `);
                                            if (Dropdown_menu_sub_content) {
                                              $$renderer9.push("<!--[-->");
                                              Dropdown_menu_sub_content($$renderer9, {
                                                class: "min-w-56",
                                                children: ($$renderer10) => {
                                                  if (store_get($$store_subs ??= {}, "$teamsState", teamsState).isLoading) {
                                                    $$renderer10.push("<!--[-->");
                                                    $$renderer10.push(`<div class="px-2 py-1 text-xs text-muted-foreground">Teams werden geladen…</div>`);
                                                  } else if (teams().length === 0) {
                                                    $$renderer10.push("<!--[1-->");
                                                    $$renderer10.push(`<div class="px-2 py-1 text-xs text-muted-foreground">Noch kein Team</div>`);
                                                  } else {
                                                    $$renderer10.push("<!--[!-->");
                                                    $$renderer10.push(`<!--[-->`);
                                                    const each_array = ensure_array_like(teams());
                                                    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                                                      let team = each_array[$$index];
                                                      if (Dropdown_menu_item) {
                                                        $$renderer10.push("<!--[-->");
                                                        Dropdown_menu_item($$renderer10, {
                                                          class: "cursor-pointer",
                                                          onclick: () => switchScopeToTeam(team),
                                                          children: ($$renderer11) => {
                                                            Users($$renderer11, { class: "size-4" });
                                                            $$renderer11.push(`<!----> <span class="truncate">${escape_html(team.name)}</span> `);
                                                            if (scope().type === "team" && scope().teamId === team.id) {
                                                              $$renderer11.push("<!--[-->");
                                                              Check($$renderer11, { class: "ml-auto size-4" });
                                                            } else {
                                                              $$renderer11.push("<!--[!-->");
                                                            }
                                                            $$renderer11.push(`<!--]-->`);
                                                          },
                                                          $$slots: { default: true }
                                                        });
                                                        $$renderer10.push("<!--]-->");
                                                      } else {
                                                        $$renderer10.push("<!--[!-->");
                                                        $$renderer10.push("<!--]-->");
                                                      }
                                                    }
                                                    $$renderer10.push(`<!--]-->`);
                                                  }
                                                  $$renderer10.push(`<!--]-->`);
                                                },
                                                $$slots: { default: true }
                                              });
                                              $$renderer9.push("<!--]-->");
                                            } else {
                                              $$renderer9.push("<!--[!-->");
                                              $$renderer9.push("<!--]-->");
                                            }
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                      $$renderer8.push(` `);
                                      if (Dropdown_menu_item) {
                                        $$renderer8.push("<!--[-->");
                                        Dropdown_menu_item($$renderer8, {
                                          class: "cursor-pointer",
                                          onclick: openCreateTeamDialog,
                                          children: ($$renderer9) => {
                                            Plus($$renderer9, { class: "size-4" });
                                            $$renderer9.push(`<!----> Neues Team erstellen`);
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                      $$renderer8.push(` `);
                                      if (activeTeam()?.role === "OWNER") {
                                        $$renderer8.push("<!--[-->");
                                        if (Dropdown_menu_item) {
                                          $$renderer8.push("<!--[-->");
                                          Dropdown_menu_item($$renderer8, {
                                            class: "cursor-pointer",
                                            onclick: () => openInviteDialog(activeTeam().id),
                                            children: ($$renderer9) => {
                                              Send($$renderer9, { class: "size-4" });
                                              $$renderer9.push(`<!----> Mitglied einladen`);
                                            },
                                            $$slots: { default: true }
                                          });
                                          $$renderer8.push("<!--]-->");
                                        } else {
                                          $$renderer8.push("<!--[!-->");
                                          $$renderer8.push("<!--]-->");
                                        }
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                      }
                                      $$renderer8.push(`<!--]-->`);
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                                $$renderer7.push(` `);
                                if (teamInvitations().length > 0) {
                                  $$renderer7.push("<!--[-->");
                                  if (Dropdown_menu_separator) {
                                    $$renderer7.push("<!--[-->");
                                    Dropdown_menu_separator($$renderer7, {});
                                    $$renderer7.push("<!--]-->");
                                  } else {
                                    $$renderer7.push("<!--[!-->");
                                    $$renderer7.push("<!--]-->");
                                  }
                                  $$renderer7.push(` `);
                                  if (Dropdown_menu_group) {
                                    $$renderer7.push("<!--[-->");
                                    Dropdown_menu_group($$renderer7, {
                                      children: ($$renderer8) => {
                                        if (Dropdown_menu_group_heading) {
                                          $$renderer8.push("<!--[-->");
                                          Dropdown_menu_group_heading($$renderer8, {
                                            class: "px-2 py-1 text-xs tracking-wide text-muted-foreground uppercase",
                                            children: ($$renderer9) => {
                                              $$renderer9.push(`<!---->Einladungen`);
                                            },
                                            $$slots: { default: true }
                                          });
                                          $$renderer8.push("<!--]-->");
                                        } else {
                                          $$renderer8.push("<!--[!-->");
                                          $$renderer8.push("<!--]-->");
                                        }
                                        $$renderer8.push(` <!--[-->`);
                                        const each_array_1 = ensure_array_like(teamInvitations());
                                        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                                          let invitation = each_array_1[$$index_1];
                                          if (Dropdown_menu_item) {
                                            $$renderer8.push("<!--[-->");
                                            Dropdown_menu_item($$renderer8, {
                                              class: "cursor-pointer",
                                              onclick: () => acceptInvitation2(invitation.id),
                                              children: ($$renderer9) => {
                                                Check($$renderer9, { class: "size-4" });
                                                $$renderer9.push(`<!----> <span class="truncate">${escape_html(invitation.teamName)} beitreten</span>`);
                                              },
                                              $$slots: { default: true }
                                            });
                                            $$renderer8.push("<!--]-->");
                                          } else {
                                            $$renderer8.push("<!--[!-->");
                                            $$renderer8.push("<!--]-->");
                                          }
                                        }
                                        $$renderer8.push(`<!--]-->`);
                                      },
                                      $$slots: { default: true }
                                    });
                                    $$renderer7.push("<!--]-->");
                                  } else {
                                    $$renderer7.push("<!--[!-->");
                                    $$renderer7.push("<!--]-->");
                                  }
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                }
                                $$renderer7.push(`<!--]--> `);
                                if (Dropdown_menu_separator) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_separator($$renderer7, {});
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                                $$renderer7.push(` `);
                                if (Dropdown_menu_group) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_group($$renderer7, {
                                    children: ($$renderer8) => {
                                      if (Dropdown_menu_item) {
                                        $$renderer8.push("<!--[-->");
                                        Dropdown_menu_item($$renderer8, {
                                          onclick: (e) => e.preventDefault(),
                                          children: ($$renderer9) => {
                                            Theme_toggle($$renderer9);
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                                $$renderer7.push(` `);
                                if (Dropdown_menu_separator) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_separator($$renderer7, {});
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                                $$renderer7.push(` `);
                                if (Dropdown_menu_item) {
                                  $$renderer7.push("<!--[-->");
                                  Dropdown_menu_item($$renderer7, {
                                    onclick: handleLogout,
                                    class: "cursor-pointer",
                                    children: ($$renderer8) => {
                                      Log_out($$renderer8, {});
                                      $$renderer8.push(`<!----> Abmelden`);
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                              },
                              $$slots: { default: true }
                            });
                            $$renderer6.push("<!--]-->");
                          } else {
                            $$renderer6.push("<!--[!-->");
                            $$renderer6.push("<!--]-->");
                          }
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
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (!user) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="text-sm text-muted-foreground">Nicht eingeloggt</div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (Dialog) {
        $$renderer3.push("<!--[-->");
        Dialog($$renderer3, {
          open: teamDialogOpen,
          onOpenChange: (open) => {
            teamDialogOpen = open;
          },
          children: ($$renderer4) => {
            if (Dialog_content) {
              $$renderer4.push("<!--[-->");
              Dialog_content($$renderer4, {
                class: "text-foreground sm:max-w-[430px]",
                children: ($$renderer5) => {
                  if (Dialog_header) {
                    $$renderer5.push("<!--[-->");
                    Dialog_header($$renderer5, {
                      children: ($$renderer6) => {
                        if (Dialog_title) {
                          $$renderer6.push("<!--[-->");
                          Dialog_title($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Team erstellen`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                        $$renderer6.push(` `);
                        if (Dialog_description) {
                          $$renderer6.push("<!--[-->");
                          Dialog_description($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Lege einen Team-Workspace an und teile Aufgaben.`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` <form class="grid gap-4 pt-2"><div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "team-name",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->Name`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> `);
                  Input($$renderer5, {
                    id: "team-name",
                    placeholder: "z. B. Produktteam",
                    get value() {
                      return teamName;
                    },
                    set value($$value) {
                      teamName = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----></div> <div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "team-description",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->Beschreibung`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> <textarea id="team-description"${attr("rows", 3)} class="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" placeholder="Optional">`);
                  const $$body = escape_html(teamDescription);
                  if ($$body) {
                    $$renderer5.push(`${$$body}`);
                  }
                  $$renderer5.push(`</textarea></div> `);
                  if (Dialog_footer) {
                    $$renderer5.push("<!--[-->");
                    Dialog_footer($$renderer5, {
                      class: "pt-2",
                      children: ($$renderer6) => {
                        Button($$renderer6, {
                          type: "submit",
                          disabled: store_get($$store_subs ??= {}, "$createTeamState", createTeamState).isPending,
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Erstellen`);
                          },
                          $$slots: { default: true }
                        });
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(`</form>`);
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
      if (Dialog) {
        $$renderer3.push("<!--[-->");
        Dialog($$renderer3, {
          open: inviteDialogOpen,
          onOpenChange: (open) => {
            inviteDialogOpen = open;
          },
          children: ($$renderer4) => {
            if (Dialog_content) {
              $$renderer4.push("<!--[-->");
              Dialog_content($$renderer4, {
                class: "text-foreground sm:max-w-[430px]",
                children: ($$renderer5) => {
                  if (Dialog_header) {
                    $$renderer5.push("<!--[-->");
                    Dialog_header($$renderer5, {
                      children: ($$renderer6) => {
                        if (Dialog_title) {
                          $$renderer6.push("<!--[-->");
                          Dialog_title($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Mitglied einladen`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                        $$renderer6.push(` `);
                        if (Dialog_description) {
                          $$renderer6.push("<!--[-->");
                          Dialog_description($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Per E-Mail zum Team einladen.`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` <form class="grid gap-4 pt-2"><div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "invite-email",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->E-Mail`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> `);
                  Input($$renderer5, {
                    id: "invite-email",
                    type: "email",
                    placeholder: "name@beispiel.de",
                    get value() {
                      return inviteEmail;
                    },
                    set value($$value) {
                      inviteEmail = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----></div> `);
                  if (Dialog_footer) {
                    $$renderer5.push("<!--[-->");
                    Dialog_footer($$renderer5, {
                      class: "pt-2",
                      children: ($$renderer6) => {
                        Button($$renderer6, {
                          type: "submit",
                          disabled: store_get($$store_subs ??= {}, "$inviteMemberState", inviteMemberState).isPending,
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Einladen`);
                          },
                          $$slots: { default: true }
                        });
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(`</form>`);
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
function Collapsible($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, open = false, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Collapsible$1) {
        $$renderer3.push("<!--[-->");
        Collapsible$1($$renderer3, spread_props([
          { "data-slot": "collapsible" },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            },
            get open() {
              return open;
            },
            set open($$value) {
              open = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref, open });
  });
}
function Collapsible_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Collapsible_trigger$1) {
        $$renderer3.push("<!--[-->");
        Collapsible_trigger$1($$renderer3, spread_props([
          { "data-slot": "collapsible-trigger" },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Collapsible_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Collapsible_content$1) {
        $$renderer3.push("<!--[-->");
        Collapsible_content$1($$renderer3, spread_props([
          { "data-slot": "collapsible-content" },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function App_sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    const projectState = derived(() => store_get($$store_subs ??= {}, "$projectStore", projectStore));
    const projects = derived(() => projectState().projects);
    const folders = derived(() => [...projectState().folders].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "de")));
    const validFolderIds = derived(() => new Set(folders().map((folder) => folder.id)));
    const ungroupedProjects = derived(() => projects().filter((project) => !project.folderId || !validFolderIds().has(project.folderId)));
    let projectDialogOpen = false;
    let projectName = "";
    let projectDescription = "";
    let projectColor = "#2563eb";
    let createFolderOpen = false;
    let folderName = "";
    let activeDropZone = null;
    function getProjectsForFolder(folderId) {
      return projects().filter((project) => project.folderId === folderId);
    }
    function handleProjectDragStart(projectId, e) {
      e.dataTransfer?.setData("application/x-project-id", projectId);
      e.dataTransfer.effectAllowed = "move";
    }
    function handleProjectDragEnd() {
      activeDropZone = null;
    }
    function dropZoneKey(folderId) {
      return folderId ?? "__none__";
    }
    function dropZoneClass(folderId) {
      return activeDropZone === dropZoneKey(folderId) ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-md" : "";
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Sidebar) {
        $$renderer3.push("<!--[-->");
        Sidebar($$renderer3, spread_props([
          restProps,
          {
            variant: "inset",
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            },
            children: ($$renderer4) => {
              if (Sidebar_header) {
                $$renderer4.push("<!--[-->");
                Sidebar_header($$renderer4, {
                  class: "h-16 border-b border-sidebar-border",
                  children: ($$renderer5) => {
                    $$renderer5.push(`<div class="flex h-full items-center gap-2">`);
                    Orbit($$renderer5, { class: "size-4" });
                    $$renderer5.push(`<!----> <span class="font-bold">Venera</span></div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer4.push("<!--]-->");
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push("<!--]-->");
              }
              $$renderer4.push(` `);
              if (Sidebar_content) {
                $$renderer4.push("<!--[-->");
                Sidebar_content($$renderer4, {
                  children: ($$renderer5) => {
                    $$renderer5.push(`<div class="flex flex-col items-center gap-1 py-2">`);
                    Button($$renderer5, {
                      variant: "ghost",
                      class: "w-full justify-start",
                      onclick: () => createTaskDialogStore.open(),
                      children: ($$renderer6) => {
                        Plus($$renderer6, { class: "size-4" });
                        $$renderer6.push(`<!----> Aufgabe hinzufügen`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Button($$renderer5, {
                      variant: "ghost",
                      class: "w-full justify-start",
                      href: "/inbox",
                      children: ($$renderer6) => {
                        Inbox($$renderer6, { class: "size-4" });
                        $$renderer6.push(`<!----> Eingang`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Button($$renderer5, {
                      variant: "ghost",
                      class: "w-full justify-start",
                      href: "/calendar",
                      children: ($$renderer6) => {
                        Calendar($$renderer6, { class: "size-4" });
                        $$renderer6.push(`<!----> Kalender`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Button($$renderer5, {
                      variant: "ghost",
                      class: "w-full justify-start pl-9 text-sm",
                      href: "/calendar/woche",
                      children: ($$renderer6) => {
                        Calendar_days($$renderer6, { class: "size-4" });
                        $$renderer6.push(`<!----> Woche`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Button($$renderer5, {
                      variant: "ghost",
                      class: "w-full justify-start",
                      href: "/finance",
                      children: ($$renderer6) => {
                        Wallet($$renderer6, { class: "size-4" });
                        $$renderer6.push(`<!----> Finanzmanager`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    if (Sidebar_separator) {
                      $$renderer5.push("<!--[-->");
                      Sidebar_separator($$renderer5, {});
                      $$renderer5.push("<!--]-->");
                    } else {
                      $$renderer5.push("<!--[!-->");
                      $$renderer5.push("<!--]-->");
                    }
                    $$renderer5.push(` `);
                    if (Collapsible) {
                      $$renderer5.push("<!--[-->");
                      Collapsible($$renderer5, {
                        open: true,
                        class: "w-full",
                        children: ($$renderer6) => {
                          {
                            let child = function($$renderer7, { props }) {
                              if (Collapsible_trigger) {
                                $$renderer7.push("<!--[-->");
                                Collapsible_trigger($$renderer7, spread_props([
                                  props,
                                  {
                                    children: ($$renderer8) => {
                                      $$renderer8.push(`<!---->Projekte <button type="button" class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent" aria-label="Ordner erstellen">`);
                                      Folder_plus($$renderer8, { class: "size-3.5" });
                                      $$renderer8.push(`<!----></button> <button type="button" class="inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent" aria-label="Projekt erstellen">`);
                                      Plus($$renderer8, { class: "size-3.5" });
                                      $$renderer8.push(`<!----></button> `);
                                      Chevron_down($$renderer8, {
                                        class: "ml-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
                                      });
                                      $$renderer8.push(`<!---->`);
                                    },
                                    $$slots: { default: true }
                                  }
                                ]));
                                $$renderer7.push("<!--]-->");
                              } else {
                                $$renderer7.push("<!--[!-->");
                                $$renderer7.push("<!--]-->");
                              }
                            };
                            if (Sidebar_group_label) {
                              $$renderer6.push("<!--[-->");
                              Sidebar_group_label($$renderer6, {
                                class: "group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                child,
                                $$slots: { child: true }
                              });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                          }
                          $$renderer6.push(` `);
                          if (Collapsible_content) {
                            $$renderer6.push("<!--[-->");
                            Collapsible_content($$renderer6, {
                              children: ($$renderer7) => {
                                if (Sidebar_group_content) {
                                  $$renderer7.push("<!--[-->");
                                  Sidebar_group_content($$renderer7, {
                                    children: ($$renderer8) => {
                                      if (Sidebar_menu) {
                                        $$renderer8.push("<!--[-->");
                                        Sidebar_menu($$renderer8, {
                                          children: ($$renderer9) => {
                                            if (projects().length === 0) {
                                              $$renderer9.push("<!--[-->");
                                              $$renderer9.push(`<div class="px-2 py-1 text-xs text-muted-foreground">Noch keine Projekte</div>`);
                                            } else {
                                              $$renderer9.push("<!--[!-->");
                                              if (folders().length > 0) {
                                                $$renderer9.push("<!--[-->");
                                                $$renderer9.push(`<div role="region" aria-label="Drop-Zone Ohne Ordner"${attr_class(`flex items-center gap-1 px-2 pt-1 text-[11px] font-medium text-sidebar-foreground/75 ${stringify(dropZoneClass(null))}`)}><span class="truncate">Ohne Ordner</span> <button type="button" class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent" aria-label="Projekt ohne Ordner erstellen">`);
                                                Plus($$renderer9, { class: "size-3.5" });
                                                $$renderer9.push(`<!----></button></div>`);
                                              } else {
                                                $$renderer9.push("<!--[!-->");
                                              }
                                              $$renderer9.push(`<!--]--> <!--[-->`);
                                              const each_array = ensure_array_like(folders().length > 0 ? ungroupedProjects() : projects());
                                              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                                                let project = each_array[$$index];
                                                if (Sidebar_menu_item) {
                                                  $$renderer9.push("<!--[-->");
                                                  Sidebar_menu_item($$renderer9, {
                                                    class: "flex items-center gap-1",
                                                    draggable: true,
                                                    ondragstart: (e) => handleProjectDragStart(project.id, e),
                                                    ondragend: handleProjectDragEnd,
                                                    children: ($$renderer10) => {
                                                      {
                                                        let child = function($$renderer11, { props }) {
                                                          $$renderer11.push(`<a${attributes({ ...props, href: `/projects?project=${project.id}` })}><div class="flex min-w-0 items-center gap-2">`);
                                                          Hash($$renderer11, { class: "size-4 shrink-0", style: `color: ${project.color};` });
                                                          $$renderer11.push(`<!----> <span class="truncate">${escape_html(project.name)}</span></div></a>`);
                                                        };
                                                        if (Sidebar_menu_button) {
                                                          $$renderer10.push("<!--[-->");
                                                          Sidebar_menu_button($$renderer10, { class: "min-w-0 flex-1", child, $$slots: { child: true } });
                                                          $$renderer10.push("<!--]-->");
                                                        } else {
                                                          $$renderer10.push("<!--[!-->");
                                                          $$renderer10.push("<!--]-->");
                                                        }
                                                      }
                                                      $$renderer10.push(` <button type="button" class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"${attr("aria-label", `Projekt ${project.name} bearbeiten`)}>`);
                                                      Ellipsis($$renderer10, { class: "size-4" });
                                                      $$renderer10.push(`<!----></button>`);
                                                    },
                                                    $$slots: { default: true }
                                                  });
                                                  $$renderer9.push("<!--]-->");
                                                } else {
                                                  $$renderer9.push("<!--[!-->");
                                                  $$renderer9.push("<!--]-->");
                                                }
                                              }
                                              $$renderer9.push(`<!--]--> <!--[-->`);
                                              const each_array_1 = ensure_array_like(folders());
                                              for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
                                                let folder = each_array_1[$$index_2];
                                                const folderProjects = getProjectsForFolder(folder.id);
                                                $$renderer9.push(`<div role="region"${attr("aria-label", `Drop-Zone Ordner ${folder.name}`)}${attr_class(`flex items-center gap-1 px-2 pt-2 text-[11px] font-medium text-sidebar-foreground/75 ${stringify(dropZoneClass(folder.id))}`)}><div class="inline-flex min-w-0 items-center gap-1">`);
                                                Folder($$renderer9, { class: "size-3.5" });
                                                $$renderer9.push(`<!----> <span class="truncate">${escape_html(folder.name)}</span></div> <button type="button" class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"${attr("aria-label", `Ordner ${folder.name} löschen`)}>`);
                                                Trash_2($$renderer9, { class: "size-3.5" });
                                                $$renderer9.push(`<!----></button> <button type="button" class="inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"${attr("aria-label", `Projekt im Ordner ${folder.name} erstellen`)}>`);
                                                Plus($$renderer9, { class: "size-3.5" });
                                                $$renderer9.push(`<!----></button></div> `);
                                                if (folderProjects.length === 0) {
                                                  $$renderer9.push("<!--[-->");
                                                  $$renderer9.push(`<div class="px-2 py-1 text-xs text-muted-foreground">Keine Projekte</div>`);
                                                } else {
                                                  $$renderer9.push("<!--[!-->");
                                                  $$renderer9.push(`<!--[-->`);
                                                  const each_array_2 = ensure_array_like(folderProjects);
                                                  for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                                                    let project = each_array_2[$$index_1];
                                                    if (Sidebar_menu_item) {
                                                      $$renderer9.push("<!--[-->");
                                                      Sidebar_menu_item($$renderer9, {
                                                        class: "flex items-center gap-1",
                                                        draggable: true,
                                                        ondragstart: (e) => handleProjectDragStart(project.id, e),
                                                        ondragend: handleProjectDragEnd,
                                                        children: ($$renderer10) => {
                                                          {
                                                            let child = function($$renderer11, { props }) {
                                                              $$renderer11.push(`<a${attributes({ ...props, href: `/projects?project=${project.id}` })}><div class="flex min-w-0 items-center gap-2">`);
                                                              Hash($$renderer11, { class: "size-4 shrink-0", style: `color: ${project.color};` });
                                                              $$renderer11.push(`<!----> <span class="truncate">${escape_html(project.name)}</span></div></a>`);
                                                            };
                                                            if (Sidebar_menu_button) {
                                                              $$renderer10.push("<!--[-->");
                                                              Sidebar_menu_button($$renderer10, { class: "min-w-0 flex-1", child, $$slots: { child: true } });
                                                              $$renderer10.push("<!--]-->");
                                                            } else {
                                                              $$renderer10.push("<!--[!-->");
                                                              $$renderer10.push("<!--]-->");
                                                            }
                                                          }
                                                          $$renderer10.push(` <button type="button" class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"${attr("aria-label", `Projekt ${project.name} bearbeiten`)}>`);
                                                          Ellipsis($$renderer10, { class: "size-4" });
                                                          $$renderer10.push(`<!----></button>`);
                                                        },
                                                        $$slots: { default: true }
                                                      });
                                                      $$renderer9.push("<!--]-->");
                                                    } else {
                                                      $$renderer9.push("<!--[!-->");
                                                      $$renderer9.push("<!--]-->");
                                                    }
                                                  }
                                                  $$renderer9.push(`<!--]-->`);
                                                }
                                                $$renderer9.push(`<!--]-->`);
                                              }
                                              $$renderer9.push(`<!--]-->`);
                                            }
                                            $$renderer9.push(`<!--]-->`);
                                          },
                                          $$slots: { default: true }
                                        });
                                        $$renderer8.push("<!--]-->");
                                      } else {
                                        $$renderer8.push("<!--[!-->");
                                        $$renderer8.push("<!--]-->");
                                      }
                                    },
                                    $$slots: { default: true }
                                  });
                                  $$renderer7.push("<!--]-->");
                                } else {
                                  $$renderer7.push("<!--[!-->");
                                  $$renderer7.push("<!--]-->");
                                }
                              },
                              $$slots: { default: true }
                            });
                            $$renderer6.push("<!--]-->");
                          } else {
                            $$renderer6.push("<!--[!-->");
                            $$renderer6.push("<!--]-->");
                          }
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push("<!--]-->");
                    } else {
                      $$renderer5.push("<!--[!-->");
                      $$renderer5.push("<!--]-->");
                    }
                    $$renderer5.push(`</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer4.push("<!--]-->");
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push("<!--]-->");
              }
              $$renderer4.push(` `);
              if (Sidebar_footer) {
                $$renderer4.push("<!--[-->");
                Sidebar_footer($$renderer4, {
                  children: ($$renderer5) => {
                    Nav_user($$renderer5, {
                      user: store_get($$store_subs ??= {}, "$authStore", authStore).user
                    });
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
          }
        ]));
        $$renderer3.push("<!--]-->");
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push("<!--]-->");
      }
      $$renderer3.push(` `);
      if (Dialog) {
        $$renderer3.push("<!--[-->");
        Dialog($$renderer3, {
          open: projectDialogOpen,
          onOpenChange: (open) => {
            projectDialogOpen = open;
          },
          children: ($$renderer4) => {
            if (Dialog_content) {
              $$renderer4.push("<!--[-->");
              Dialog_content($$renderer4, {
                class: "text-foreground sm:max-w-[430px]",
                children: ($$renderer5) => {
                  if (Dialog_header) {
                    $$renderer5.push("<!--[-->");
                    Dialog_header($$renderer5, {
                      children: ($$renderer6) => {
                        if (Dialog_title) {
                          $$renderer6.push("<!--[-->");
                          Dialog_title($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->${escape_html("Projekt erstellen")}`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                        $$renderer6.push(` `);
                        if (Dialog_description) {
                          $$renderer6.push("<!--[-->");
                          Dialog_description($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Name, Farbe und Beschreibung festlegen.`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` <form class="grid gap-4 pt-2"><div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "project-name",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->Name`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> `);
                  Input($$renderer5, {
                    id: "project-name",
                    placeholder: "z. B. Website Relaunch",
                    get value() {
                      return projectName;
                    },
                    set value($$value) {
                      projectName = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----></div> <div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "project-color",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->Farbe`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> <input id="project-color" type="color"${attr("value", projectColor)} class="h-10 w-full cursor-pointer rounded-md border border-input bg-background p-1"/></div> <div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "project-desc",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->Beschreibung`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> <textarea id="project-desc"${attr("rows", 3)} class="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" placeholder="Kurzbeschreibung">`);
                  const $$body = escape_html(projectDescription);
                  if ($$body) {
                    $$renderer5.push(`${$$body}`);
                  }
                  $$renderer5.push(`</textarea></div> `);
                  if (Dialog_footer) {
                    $$renderer5.push("<!--[-->");
                    Dialog_footer($$renderer5, {
                      class: "pt-2",
                      children: ($$renderer6) => {
                        Button($$renderer6, {
                          type: "submit",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->${escape_html("Erstellen")}`);
                          },
                          $$slots: { default: true }
                        });
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(`</form>`);
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
      if (Dialog) {
        $$renderer3.push("<!--[-->");
        Dialog($$renderer3, {
          open: createFolderOpen,
          onOpenChange: (open) => {
            createFolderOpen = open;
          },
          children: ($$renderer4) => {
            if (Dialog_content) {
              $$renderer4.push("<!--[-->");
              Dialog_content($$renderer4, {
                class: "text-foreground sm:max-w-[430px]",
                children: ($$renderer5) => {
                  if (Dialog_header) {
                    $$renderer5.push("<!--[-->");
                    Dialog_header($$renderer5, {
                      children: ($$renderer6) => {
                        if (Dialog_title) {
                          $$renderer6.push("<!--[-->");
                          Dialog_title($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Ordner erstellen`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                        $$renderer6.push(` `);
                        if (Dialog_description) {
                          $$renderer6.push("<!--[-->");
                          Dialog_description($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->Lege einen Ordner an, um Projekte zu gruppieren.`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` <form class="grid gap-4 pt-2"><div class="grid gap-2">`);
                  Label($$renderer5, {
                    for: "folder-name",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->Name`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> `);
                  Input($$renderer5, {
                    id: "folder-name",
                    placeholder: "z. B. Kundenprojekte",
                    get value() {
                      return folderName;
                    },
                    set value($$value) {
                      folderName = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----></div> `);
                  if (Dialog_footer) {
                    $$renderer5.push("<!--[-->");
                    Dialog_footer($$renderer5, {
                      class: "pt-2",
                      children: ($$renderer6) => {
                        Button($$renderer6, {
                          type: "submit",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Erstellen`);
                          },
                          $$slots: { default: true }
                        });
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(`</form>`);
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
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { ref });
  });
}
const __storeToDerived = /* @__PURE__ */ new WeakMap();
const __derivedToStore = /* @__PURE__ */ new WeakMap();
const __depsThatHaveWrittenThisTick = {
  current: []
};
let __isFlushing = false;
let __batchDepth = 0;
const __pendingUpdates = /* @__PURE__ */ new Set();
const __initialBatchValues = /* @__PURE__ */ new Map();
function __flush_internals(relatedVals) {
  const sorted = Array.from(relatedVals).sort((a, b) => {
    if (a instanceof Derived && a.options.deps.includes(b)) return 1;
    if (b instanceof Derived && b.options.deps.includes(a)) return -1;
    return 0;
  });
  for (const derived2 of sorted) {
    if (__depsThatHaveWrittenThisTick.current.includes(derived2)) {
      continue;
    }
    __depsThatHaveWrittenThisTick.current.push(derived2);
    derived2.recompute();
    const stores = __derivedToStore.get(derived2);
    if (stores) {
      for (const store of stores) {
        const relatedLinkedDerivedVals = __storeToDerived.get(store);
        if (!relatedLinkedDerivedVals) continue;
        __flush_internals(relatedLinkedDerivedVals);
      }
    }
  }
}
function __notifyListeners(store) {
  const value = {
    prevVal: store.prevState,
    currentVal: store.state
  };
  for (const listener of store.listeners) {
    listener(value);
  }
}
function __notifyDerivedListeners(derived2) {
  const value = {
    prevVal: derived2.prevState,
    currentVal: derived2.state
  };
  for (const listener of derived2.listeners) {
    listener(value);
  }
}
function __flush(store) {
  if (__batchDepth > 0 && !__initialBatchValues.has(store)) {
    __initialBatchValues.set(store, store.prevState);
  }
  __pendingUpdates.add(store);
  if (__batchDepth > 0) return;
  if (__isFlushing) return;
  try {
    __isFlushing = true;
    while (__pendingUpdates.size > 0) {
      const stores = Array.from(__pendingUpdates);
      __pendingUpdates.clear();
      for (const store2 of stores) {
        const prevState = __initialBatchValues.get(store2) ?? store2.prevState;
        store2.prevState = prevState;
        __notifyListeners(store2);
      }
      for (const store2 of stores) {
        const derivedVals = __storeToDerived.get(store2);
        if (!derivedVals) continue;
        __depsThatHaveWrittenThisTick.current.push(store2);
        __flush_internals(derivedVals);
      }
      for (const store2 of stores) {
        const derivedVals = __storeToDerived.get(store2);
        if (!derivedVals) continue;
        for (const derived2 of derivedVals) {
          __notifyDerivedListeners(derived2);
        }
      }
    }
  } finally {
    __isFlushing = false;
    __depsThatHaveWrittenThisTick.current = [];
    __initialBatchValues.clear();
  }
}
function batch(fn) {
  __batchDepth++;
  try {
    fn();
  } finally {
    __batchDepth--;
    if (__batchDepth === 0) {
      const pendingUpdateToFlush = __pendingUpdates.values().next().value;
      if (pendingUpdateToFlush) {
        __flush(pendingUpdateToFlush);
      }
    }
  }
}
function isUpdaterFunction(updater) {
  return typeof updater === "function";
}
class Store {
  constructor(initialState, options) {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = (listener) => {
      var _a, _b;
      this.listeners.add(listener);
      const unsub = (_b = (_a = this.options) == null ? void 0 : _a.onSubscribe) == null ? void 0 : _b.call(_a, listener, this);
      return () => {
        this.listeners.delete(listener);
        unsub == null ? void 0 : unsub();
      };
    };
    this.prevState = initialState;
    this.state = initialState;
    this.options = options;
  }
  setState(updater) {
    var _a, _b, _c;
    this.prevState = this.state;
    if ((_a = this.options) == null ? void 0 : _a.updateFn) {
      this.state = this.options.updateFn(this.prevState)(updater);
    } else {
      if (isUpdaterFunction(updater)) {
        this.state = updater(this.prevState);
      } else {
        this.state = updater;
      }
    }
    (_c = (_b = this.options) == null ? void 0 : _b.onUpdate) == null ? void 0 : _c.call(_b);
    __flush(this);
  }
}
class Derived {
  constructor(options) {
    this.listeners = /* @__PURE__ */ new Set();
    this._subscriptions = [];
    this.lastSeenDepValues = [];
    this.getDepVals = () => {
      const l = this.options.deps.length;
      const prevDepVals = new Array(l);
      const currDepVals = new Array(l);
      for (let i = 0; i < l; i++) {
        const dep = this.options.deps[i];
        prevDepVals[i] = dep.prevState;
        currDepVals[i] = dep.state;
      }
      this.lastSeenDepValues = currDepVals;
      return {
        prevDepVals,
        currDepVals,
        prevVal: this.prevState ?? void 0
      };
    };
    this.recompute = () => {
      var _a, _b;
      this.prevState = this.state;
      const depVals = this.getDepVals();
      this.state = this.options.fn(depVals);
      (_b = (_a = this.options).onUpdate) == null ? void 0 : _b.call(_a);
    };
    this.checkIfRecalculationNeededDeeply = () => {
      for (const dep of this.options.deps) {
        if (dep instanceof Derived) {
          dep.checkIfRecalculationNeededDeeply();
        }
      }
      let shouldRecompute = false;
      const lastSeenDepValues = this.lastSeenDepValues;
      const { currDepVals } = this.getDepVals();
      for (let i = 0; i < currDepVals.length; i++) {
        if (currDepVals[i] !== lastSeenDepValues[i]) {
          shouldRecompute = true;
          break;
        }
      }
      if (shouldRecompute) {
        this.recompute();
      }
    };
    this.mount = () => {
      this.registerOnGraph();
      this.checkIfRecalculationNeededDeeply();
      return () => {
        this.unregisterFromGraph();
        for (const cleanup of this._subscriptions) {
          cleanup();
        }
      };
    };
    this.subscribe = (listener) => {
      var _a, _b;
      this.listeners.add(listener);
      const unsub = (_b = (_a = this.options).onSubscribe) == null ? void 0 : _b.call(_a, listener, this);
      return () => {
        this.listeners.delete(listener);
        unsub == null ? void 0 : unsub();
      };
    };
    this.options = options;
    this.state = options.fn({
      prevDepVals: void 0,
      prevVal: void 0,
      currDepVals: this.getDepVals().currDepVals
    });
  }
  registerOnGraph(deps = this.options.deps) {
    for (const dep of deps) {
      if (dep instanceof Derived) {
        dep.registerOnGraph();
        this.registerOnGraph(dep.options.deps);
      } else if (dep instanceof Store) {
        let relatedLinkedDerivedVals = __storeToDerived.get(dep);
        if (!relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals = /* @__PURE__ */ new Set();
          __storeToDerived.set(dep, relatedLinkedDerivedVals);
        }
        relatedLinkedDerivedVals.add(this);
        let relatedStores = __derivedToStore.get(this);
        if (!relatedStores) {
          relatedStores = /* @__PURE__ */ new Set();
          __derivedToStore.set(this, relatedStores);
        }
        relatedStores.add(dep);
      }
    }
  }
  unregisterFromGraph(deps = this.options.deps) {
    for (const dep of deps) {
      if (dep instanceof Derived) {
        this.unregisterFromGraph(dep.options.deps);
      } else if (dep instanceof Store) {
        const relatedLinkedDerivedVals = __storeToDerived.get(dep);
        if (relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals.delete(this);
        }
        const relatedStores = __derivedToStore.get(this);
        if (relatedStores) {
          relatedStores.delete(dep);
        }
      }
    }
  }
}
var LiteThrottler = class {
  constructor(fn, options) {
    this.fn = fn;
    this.options = options;
    this.lastExecutionTime = 0;
    this.isPending = false;
    this.maybeExecute = (...args) => {
      const timeSinceLastExecution = Date.now() - this.lastExecutionTime;
      if (this.options.leading && timeSinceLastExecution >= this.options.wait) this.execute(...args);
      else {
        this.lastArgs = args;
        if (!this.timeoutId && this.options.trailing) {
          const timeoutDuration = this.options.wait - timeSinceLastExecution;
          this.isPending = true;
          this.timeoutId = setTimeout(() => {
            if (this.lastArgs !== void 0) this.execute(...this.lastArgs);
          }, timeoutDuration);
        }
      }
    };
    this.execute = (...args) => {
      this.fn(...args);
      this.options.onExecute?.(args, this);
      this.lastExecutionTime = Date.now();
      this.clearTimeout();
      this.lastArgs = void 0;
      this.isPending = false;
    };
    this.flush = () => {
      if (this.isPending && this.lastArgs) this.execute(...this.lastArgs);
    };
    this.cancel = () => {
      this.clearTimeout();
      this.lastArgs = void 0;
      this.isPending = false;
    };
    this.clearTimeout = () => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = void 0;
      }
    };
    if (this.options.leading === void 0 && this.options.trailing === void 0) {
      this.options.leading = true;
      this.options.trailing = true;
    }
  }
};
function liteThrottle(fn, options) {
  return new LiteThrottler(fn, options).maybeExecute;
}
class EventClient {
  #enabled = true;
  #pluginId;
  #eventTarget;
  #debug;
  #queuedEvents;
  #connected;
  #connectIntervalId;
  #connectEveryMs;
  #retryCount = 0;
  #maxRetries = 5;
  #connecting = false;
  #failedToConnect = false;
  #internalEventTarget = null;
  #onConnected = () => {
    this.debugLog("Connected to event bus");
    this.#connected = true;
    this.#connecting = false;
    this.debugLog("Emitting queued events", this.#queuedEvents);
    this.#queuedEvents.forEach((event) => this.emitEventToBus(event));
    this.#queuedEvents = [];
    this.stopConnectLoop();
    this.#eventTarget().removeEventListener(
      "tanstack-connect-success",
      this.#onConnected
    );
  };
  // fired off right away and then at intervals
  #retryConnection = () => {
    if (this.#retryCount < this.#maxRetries) {
      this.#retryCount++;
      this.dispatchCustomEvent("tanstack-connect", {});
      return;
    }
    this.#eventTarget().removeEventListener(
      "tanstack-connect",
      this.#retryConnection
    );
    this.#failedToConnect = true;
    this.debugLog("Max retries reached, giving up on connection");
    this.stopConnectLoop();
  };
  // This is run to register connection handlers on first emit attempt
  #connectFunction = () => {
    if (this.#connecting) return;
    this.#connecting = true;
    this.#eventTarget().addEventListener(
      "tanstack-connect-success",
      this.#onConnected
    );
    this.#retryConnection();
  };
  constructor({
    pluginId,
    debug = false,
    enabled = true,
    reconnectEveryMs = 300
  }) {
    this.#pluginId = pluginId;
    this.#enabled = enabled;
    this.#eventTarget = this.getGlobalTarget;
    this.#debug = debug;
    this.debugLog(" Initializing event subscription for plugin", this.#pluginId);
    this.#queuedEvents = [];
    this.#connected = false;
    this.#failedToConnect = false;
    this.#connectIntervalId = null;
    this.#connectEveryMs = reconnectEveryMs;
  }
  startConnectLoop() {
    if (this.#connectIntervalId !== null || this.#connected) return;
    this.debugLog(`Starting connect loop (every ${this.#connectEveryMs}ms)`);
    this.#connectIntervalId = setInterval(
      this.#retryConnection,
      this.#connectEveryMs
    );
  }
  stopConnectLoop() {
    this.#connecting = false;
    if (this.#connectIntervalId === null) {
      return;
    }
    clearInterval(this.#connectIntervalId);
    this.#connectIntervalId = null;
    this.#queuedEvents = [];
    this.debugLog("Stopped connect loop");
  }
  debugLog(...args) {
    if (this.#debug) {
      console.log(`🌴 [tanstack-devtools:${this.#pluginId}-plugin]`, ...args);
    }
  }
  getGlobalTarget() {
    if (typeof globalThis !== "undefined" && globalThis.__TANSTACK_EVENT_TARGET__) {
      this.debugLog("Using global event target");
      return globalThis.__TANSTACK_EVENT_TARGET__;
    }
    if (typeof window !== "undefined" && typeof window.addEventListener !== "undefined") {
      this.debugLog("Using window as event target");
      return window;
    }
    const eventTarget = typeof EventTarget !== "undefined" ? new EventTarget() : void 0;
    if (typeof eventTarget === "undefined" || typeof eventTarget.addEventListener === "undefined") {
      this.debugLog(
        "No event mechanism available, running in non-web environment"
      );
      return {
        addEventListener: () => {
        },
        removeEventListener: () => {
        },
        dispatchEvent: () => false
      };
    }
    this.debugLog("Using new EventTarget as fallback");
    return eventTarget;
  }
  getPluginId() {
    return this.#pluginId;
  }
  dispatchCustomEventShim(eventName, detail) {
    try {
      const event = new Event(eventName, {
        detail
      });
      this.#eventTarget().dispatchEvent(event);
    } catch (e) {
      this.debugLog("Failed to dispatch shim event");
    }
  }
  dispatchCustomEvent(eventName, detail) {
    try {
      this.#eventTarget().dispatchEvent(new CustomEvent(eventName, { detail }));
    } catch (e) {
      this.dispatchCustomEventShim(eventName, detail);
    }
  }
  emitEventToBus(event) {
    this.debugLog("Emitting event to client bus", event);
    this.dispatchCustomEvent("tanstack-dispatch-event", event);
  }
  createEventPayload(eventSuffix, payload) {
    return {
      type: `${this.#pluginId}:${eventSuffix}`,
      payload,
      pluginId: this.#pluginId
    };
  }
  emit(eventSuffix, payload) {
    if (!this.#enabled) {
      this.debugLog(
        "Event bus client is disabled, not emitting event",
        eventSuffix,
        payload
      );
      return;
    }
    if (this.#internalEventTarget) {
      this.debugLog(
        "Emitting event to internal event target",
        eventSuffix,
        payload
      );
      this.#internalEventTarget.dispatchEvent(
        new CustomEvent(`${this.#pluginId}:${eventSuffix}`, {
          detail: this.createEventPayload(eventSuffix, payload)
        })
      );
    }
    if (this.#failedToConnect) {
      this.debugLog("Previously failed to connect, not emitting to bus");
      return;
    }
    if (!this.#connected) {
      this.debugLog("Bus not available, will be pushed as soon as connected");
      this.#queuedEvents.push(this.createEventPayload(eventSuffix, payload));
      if (typeof CustomEvent !== "undefined" && !this.#connecting) {
        this.#connectFunction();
        this.startConnectLoop();
      }
      return;
    }
    return this.emitEventToBus(this.createEventPayload(eventSuffix, payload));
  }
  on(eventSuffix, cb, options) {
    const withEventTarget = options?.withEventTarget ?? false;
    const eventName = `${this.#pluginId}:${eventSuffix}`;
    if (withEventTarget) {
      if (!this.#internalEventTarget) {
        this.#internalEventTarget = new EventTarget();
      }
      this.#internalEventTarget.addEventListener(eventName, (e) => {
        cb(e.detail);
      });
    }
    if (!this.#enabled) {
      this.debugLog(
        "Event bus client is disabled, not registering event",
        eventName
      );
      return () => {
      };
    }
    const handler = (e) => {
      this.debugLog("Received event from bus", e.detail);
      cb(e.detail);
    };
    this.#eventTarget().addEventListener(eventName, handler);
    this.debugLog("Registered event to bus", eventName);
    return () => {
      if (withEventTarget) {
        this.#internalEventTarget?.removeEventListener(eventName, handler);
      }
      this.#eventTarget().removeEventListener(eventName, handler);
    };
  }
  onAll(cb) {
    if (!this.#enabled) {
      this.debugLog("Event bus client is disabled, not registering event");
      return () => {
      };
    }
    const handler = (e) => {
      const event = e.detail;
      cb(event);
    };
    this.#eventTarget().addEventListener("tanstack-devtools-global", handler);
    return () => this.#eventTarget().removeEventListener(
      "tanstack-devtools-global",
      handler
    );
  }
  onAllPluginEvents(cb) {
    if (!this.#enabled) {
      this.debugLog("Event bus client is disabled, not registering event");
      return () => {
      };
    }
    const handler = (e) => {
      const event = e.detail;
      if (this.#pluginId && event.pluginId !== this.#pluginId) {
        return;
      }
      cb(event);
    };
    this.#eventTarget().addEventListener("tanstack-devtools-global", handler);
    return () => this.#eventTarget().removeEventListener(
      "tanstack-devtools-global",
      handler
    );
  }
}
class FormEventClient extends EventClient {
  constructor() {
    super({
      pluginId: "form-devtools",
      reconnectEveryMs: 1e3
    });
  }
}
const formEventClient = new FormEventClient();
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function getBy(obj, path) {
  const pathObj = makePathArray(path);
  return pathObj.reduce((current, pathPart) => {
    if (current === null) return null;
    if (typeof current !== "undefined") {
      return current[pathPart];
    }
    return void 0;
  }, obj);
}
function setBy(obj, _path, updater) {
  const path = makePathArray(_path);
  function doSet(parent) {
    if (!path.length) {
      return functionalUpdate(updater, parent);
    }
    const key = path.shift();
    if (typeof key === "string" || typeof key === "number" && !Array.isArray(parent)) {
      if (typeof parent === "object") {
        if (parent === null) {
          parent = {};
        }
        return {
          ...parent,
          [key]: doSet(parent[key])
        };
      }
      return {
        [key]: doSet()
      };
    }
    if (Array.isArray(parent) && typeof key === "number") {
      const prefix = parent.slice(0, key);
      return [
        ...prefix.length ? prefix : new Array(key),
        doSet(parent[key]),
        ...parent.slice(key + 1)
      ];
    }
    return [...new Array(key), doSet()];
  }
  return doSet(obj);
}
function deleteBy(obj, _path) {
  const path = makePathArray(_path);
  function doDelete(parent) {
    if (!parent) return;
    if (path.length === 1) {
      const finalPath = path[0];
      if (Array.isArray(parent) && typeof finalPath === "number") {
        return parent.filter((_, i) => i !== finalPath);
      }
      const { [finalPath]: remove, ...rest } = parent;
      return rest;
    }
    const key = path.shift();
    if (typeof key === "string" || typeof key === "number" && !Array.isArray(parent)) {
      if (typeof parent === "object") {
        return {
          ...parent,
          [key]: doDelete(parent[key])
        };
      }
    }
    if (typeof key === "number") {
      if (Array.isArray(parent)) {
        if (key >= parent.length) {
          return parent;
        }
        const prefix = parent.slice(0, key);
        return [
          ...prefix.length ? prefix : new Array(key),
          doDelete(parent[key]),
          ...parent.slice(key + 1)
        ];
      }
    }
    throw new Error("It seems we have created an infinite loop in deleteBy. ");
  }
  return doDelete(obj);
}
const reLineOfOnlyDigits = /^(\d+)$/gm;
const reDigitsBetweenDots = /\.(\d+)(?=\.)/gm;
const reStartWithDigitThenDot = /^(\d+)\./gm;
const reDotWithDigitsToEnd = /\.(\d+$)/gm;
const reMultipleDots = /\.{2,}/gm;
const intPrefix = "__int__";
const intReplace = `${intPrefix}$1`;
function makePathArray(str) {
  if (Array.isArray(str)) {
    return [...str];
  }
  if (typeof str !== "string") {
    throw new Error("Path must be a string.");
  }
  return str.replace(/(^\[)|]/gm, "").replace(/\[/g, ".").replace(reLineOfOnlyDigits, intReplace).replace(reDigitsBetweenDots, `.${intReplace}.`).replace(reStartWithDigitThenDot, `${intReplace}.`).replace(reDotWithDigitsToEnd, `.${intReplace}`).replace(reMultipleDots, ".").split(".").map((d) => {
    if (d.startsWith(intPrefix)) {
      const numStr = d.substring(intPrefix.length);
      const num = parseInt(numStr, 10);
      if (String(num) === numStr) {
        return num;
      }
      return numStr;
    }
    return d;
  });
}
function isNonEmptyArray(obj) {
  return !(Array.isArray(obj) && obj.length === 0);
}
function getSyncValidatorArray(cause, options) {
  const runValidation = (props) => {
    return props.validators.filter(Boolean).map((validator) => {
      return {
        cause: validator.cause,
        validate: validator.fn
      };
    });
  };
  return options.validationLogic({
    form: options.form,
    validators: options.validators,
    event: { type: cause, async: false },
    runValidation
  });
}
function getAsyncValidatorArray(cause, options) {
  const { asyncDebounceMs } = options;
  const {
    onBlurAsyncDebounceMs,
    onChangeAsyncDebounceMs,
    onDynamicAsyncDebounceMs
  } = options.validators || {};
  const defaultDebounceMs = asyncDebounceMs ?? 0;
  const runValidation = (props) => {
    return props.validators.filter(Boolean).map((validator) => {
      const validatorCause = validator?.cause || cause;
      let debounceMs = defaultDebounceMs;
      switch (validatorCause) {
        case "change":
          debounceMs = onChangeAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "blur":
          debounceMs = onBlurAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "dynamic":
          debounceMs = onDynamicAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "submit":
          debounceMs = 0;
          break;
      }
      if (cause === "submit") {
        debounceMs = 0;
      }
      return {
        cause: validatorCause,
        validate: validator.fn,
        debounceMs
      };
    });
  };
  return options.validationLogic({
    form: options.form,
    validators: options.validators,
    event: { type: cause, async: true },
    runValidation
  });
}
const isGlobalFormValidationError = (error) => {
  return !!error && typeof error === "object" && "fields" in error;
};
function evaluate(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Date && objB instanceof Date) {
    return objA.getTime() === objB.getTime();
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const v of objA) {
      if (!objB.has(v)) return false;
    }
    return true;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!keysB.includes(key) || !evaluate(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}
const determineFormLevelErrorSourceAndValue = ({
  newFormValidatorError,
  isPreviousErrorFromFormValidator,
  previousErrorValue
}) => {
  if (newFormValidatorError) {
    return { newErrorValue: newFormValidatorError, newSource: "form" };
  }
  if (isPreviousErrorFromFormValidator) {
    return { newErrorValue: void 0, newSource: void 0 };
  }
  if (previousErrorValue) {
    return { newErrorValue: previousErrorValue, newSource: "field" };
  }
  return { newErrorValue: void 0, newSource: void 0 };
};
const determineFieldLevelErrorSourceAndValue = ({
  formLevelError,
  fieldLevelError
}) => {
  if (fieldLevelError) {
    return { newErrorValue: fieldLevelError, newSource: "field" };
  }
  if (formLevelError) {
    return { newErrorValue: formLevelError, newSource: "form" };
  }
  return { newErrorValue: void 0, newSource: void 0 };
};
function mergeOpts(originalOpts, overrides) {
  if (originalOpts === void 0 || originalOpts === null) {
    return overrides;
  }
  return { ...originalOpts, ...overrides };
}
let IDX = 256;
const HEX = [];
let BUFFER;
while (IDX--) {
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
}
function uuid() {
  let i = 0;
  let num;
  let out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = new Array(256);
    i = 256;
    while (i--) {
      BUFFER[i] = 256 * Math.random() | 0;
    }
    i = 0;
    IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i === 6) out += HEX[num & 15 | 64];
    else if (i === 8) out += HEX[num & 63 | 128];
    else out += HEX[num];
    if (i & 1 && i > 1 && i < 11) out += "-";
  }
  IDX++;
  return out;
}
const throttleFormState = liteThrottle(
  (form) => formEventClient.emit("form-state", {
    id: form.formId,
    state: form.store.state
  }),
  {
    wait: 300
  }
);
const defaultValidationLogic = (props) => {
  if (!props.validators) {
    return props.runValidation({
      validators: [],
      form: props.form
    });
  }
  const isAsync = props.event.async;
  const onMountValidator = isAsync ? void 0 : { fn: props.validators.onMount, cause: "mount" };
  const onChangeValidator = {
    fn: isAsync ? props.validators.onChangeAsync : props.validators.onChange,
    cause: "change"
  };
  const onBlurValidator = {
    fn: isAsync ? props.validators.onBlurAsync : props.validators.onBlur,
    cause: "blur"
  };
  const onSubmitValidator = {
    fn: isAsync ? props.validators.onSubmitAsync : props.validators.onSubmit,
    cause: "submit"
  };
  const onServerValidator = isAsync ? void 0 : { fn: () => void 0, cause: "server" };
  switch (props.event.type) {
    case "mount": {
      return props.runValidation({
        validators: [onMountValidator],
        form: props.form
      });
    }
    case "submit": {
      return props.runValidation({
        validators: [
          onChangeValidator,
          onBlurValidator,
          onSubmitValidator,
          onServerValidator
        ],
        form: props.form
      });
    }
    case "server": {
      return props.runValidation({
        validators: [],
        form: props.form
      });
    }
    case "blur": {
      return props.runValidation({
        validators: [onBlurValidator, onServerValidator],
        form: props.form
      });
    }
    case "change": {
      return props.runValidation({
        validators: [onChangeValidator, onServerValidator],
        form: props.form
      });
    }
    default: {
      throw new Error(`Unknown validation event type: ${props.event.type}`);
    }
  }
};
function prefixSchemaToErrors(issues, formValue) {
  const schema = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    const issuePath = issue.path ?? [];
    let currentFormValue = formValue;
    let path = "";
    for (let i = 0; i < issuePath.length; i++) {
      const pathSegment = issuePath[i];
      if (pathSegment === void 0) continue;
      const segment = typeof pathSegment === "object" ? pathSegment.key : pathSegment;
      const segmentAsNumber = Number(segment);
      if (Array.isArray(currentFormValue) && !Number.isNaN(segmentAsNumber)) {
        path += `[${segmentAsNumber}]`;
      } else {
        path += (i > 0 ? "." : "") + String(segment);
      }
      if (typeof currentFormValue === "object" && currentFormValue !== null) {
        currentFormValue = currentFormValue[segment];
      } else {
        currentFormValue = void 0;
      }
    }
    schema.set(path, (schema.get(path) ?? []).concat(issue));
  }
  return Object.fromEntries(schema);
}
const transformFormIssues = (issues, formValue) => {
  const schemaErrors = prefixSchemaToErrors(issues, formValue);
  return {
    form: schemaErrors,
    fields: schemaErrors
  };
};
const standardSchemaValidators = {
  validate({
    value,
    validationSource
  }, schema) {
    const result = schema["~standard"].validate(value);
    if (result instanceof Promise) {
      throw new Error("async function passed to sync validator");
    }
    if (!result.issues) return;
    if (validationSource === "field")
      return result.issues;
    return transformFormIssues(result.issues, value);
  },
  async validateAsync({
    value,
    validationSource
  }, schema) {
    const result = await schema["~standard"].validate(value);
    if (!result.issues) return;
    if (validationSource === "field")
      return result.issues;
    return transformFormIssues(result.issues, value);
  }
};
const isStandardSchemaValidator = (validator) => !!validator && "~standard" in validator;
const defaultFieldMeta = {
  isValidating: false,
  isTouched: false,
  isBlurred: false,
  isDirty: false,
  isPristine: true,
  isValid: true,
  isDefaultValue: true,
  errors: [],
  errorMap: {},
  errorSourceMap: {}
};
function metaHelper(formApi) {
  function handleArrayMove(field, fromIndex, toIndex) {
    const affectedFields = getAffectedFields(field, fromIndex, "move", toIndex);
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    for (let i = startIndex; i <= endIndex; i++) {
      affectedFields.push(getFieldPath(field, i));
    }
    const fromFields = Object.keys(formApi.fieldInfo).reduce(
      (fieldMap, fieldKey) => {
        if (fieldKey.startsWith(getFieldPath(field, fromIndex))) {
          fieldMap.set(
            fieldKey,
            formApi.getFieldMeta(fieldKey)
          );
        }
        return fieldMap;
      },
      /* @__PURE__ */ new Map()
    );
    shiftMeta(affectedFields, fromIndex < toIndex ? "up" : "down");
    Object.keys(formApi.fieldInfo).filter((fieldKey) => fieldKey.startsWith(getFieldPath(field, toIndex))).forEach((fieldKey) => {
      const fromKey = fieldKey.replace(
        getFieldPath(field, toIndex),
        getFieldPath(field, fromIndex)
      );
      const fromMeta = fromFields.get(fromKey);
      if (fromMeta) {
        formApi.setFieldMeta(fieldKey, fromMeta);
      }
    });
  }
  function handleArrayRemove(field, index) {
    const affectedFields = getAffectedFields(field, index, "remove");
    shiftMeta(affectedFields, "up");
  }
  function handleArraySwap(field, index, secondIndex) {
    const affectedFields = getAffectedFields(field, index, "swap", secondIndex);
    affectedFields.forEach((fieldKey) => {
      if (!fieldKey.toString().startsWith(getFieldPath(field, index))) {
        return;
      }
      const swappedKey = fieldKey.toString().replace(
        getFieldPath(field, index),
        getFieldPath(field, secondIndex)
      );
      const [meta1, meta2] = [
        formApi.getFieldMeta(fieldKey),
        formApi.getFieldMeta(swappedKey)
      ];
      if (meta1) formApi.setFieldMeta(swappedKey, meta1);
      if (meta2) formApi.setFieldMeta(fieldKey, meta2);
    });
  }
  function handleArrayInsert(field, insertIndex) {
    const affectedFields = getAffectedFields(field, insertIndex, "insert");
    shiftMeta(affectedFields, "down");
    affectedFields.forEach((fieldKey) => {
      if (fieldKey.toString().startsWith(getFieldPath(field, insertIndex))) {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  }
  function getFieldPath(field, index) {
    return `${field}[${index}]`;
  }
  function getAffectedFields(field, index, mode, secondIndex) {
    const affectedFieldKeys = [getFieldPath(field, index)];
    switch (mode) {
      case "swap":
        affectedFieldKeys.push(getFieldPath(field, secondIndex));
        break;
      case "move": {
        const [startIndex, endIndex] = [
          Math.min(index, secondIndex),
          Math.max(index, secondIndex)
        ];
        for (let i = startIndex; i <= endIndex; i++) {
          affectedFieldKeys.push(getFieldPath(field, i));
        }
        break;
      }
      default: {
        const currentValue = formApi.getFieldValue(field);
        const fieldItems = Array.isArray(currentValue) ? currentValue.length : 0;
        for (let i = index + 1; i < fieldItems; i++) {
          affectedFieldKeys.push(getFieldPath(field, i));
        }
        break;
      }
    }
    return Object.keys(formApi.fieldInfo).filter(
      (fieldKey) => affectedFieldKeys.some((key) => fieldKey.startsWith(key))
    );
  }
  function updateIndex(fieldKey, direction) {
    return fieldKey.replace(/\[(\d+)\]/, (_, num) => {
      const currIndex = parseInt(num, 10);
      const newIndex = direction === "up" ? currIndex + 1 : Math.max(0, currIndex - 1);
      return `[${newIndex}]`;
    });
  }
  function shiftMeta(fields, direction) {
    const sortedFields = direction === "up" ? fields : [...fields].reverse();
    sortedFields.forEach((fieldKey) => {
      const nextFieldKey = updateIndex(fieldKey.toString(), direction);
      const nextFieldMeta = formApi.getFieldMeta(nextFieldKey);
      if (nextFieldMeta) {
        formApi.setFieldMeta(fieldKey, nextFieldMeta);
      } else {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  }
  const getEmptyFieldMeta = () => defaultFieldMeta;
  return {
    handleArrayMove,
    handleArrayRemove,
    handleArraySwap,
    handleArrayInsert
  };
}
function getDefaultFormState(defaultState) {
  return {
    values: defaultState.values ?? {},
    errorMap: defaultState.errorMap ?? {},
    fieldMetaBase: defaultState.fieldMetaBase ?? {},
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false,
    validationMetaMap: defaultState.validationMetaMap ?? {
      onChange: void 0,
      onBlur: void 0,
      onSubmit: void 0,
      onMount: void 0,
      onServer: void 0,
      onDynamic: void 0
    }
  };
}
class FormApi {
  /**
   * Constructs a new `FormApi` instance with the given form options.
   */
  constructor(opts) {
    this.options = {};
    this.fieldInfo = {};
    this.mount = () => {
      const cleanupFieldMetaDerived = this.fieldMetaDerived.mount();
      const cleanupStoreDerived = this.store.mount();
      const cleanupDevtoolBroadcast = this.store.subscribe(() => {
        throttleFormState(this);
      });
      const cleanupFormStateListener = formEventClient.on(
        "request-form-state",
        (e) => {
          if (e.payload.id === this._formId) {
            formEventClient.emit("form-api", {
              id: this._formId,
              state: this.store.state,
              options: this.options
            });
          }
        }
      );
      const cleanupFormResetListener = formEventClient.on(
        "request-form-reset",
        (e) => {
          if (e.payload.id === this._formId) {
            this.reset();
          }
        }
      );
      const cleanupFormForceSubmitListener = formEventClient.on(
        "request-form-force-submit",
        (e) => {
          if (e.payload.id === this._formId) {
            this._devtoolsSubmissionOverride = true;
            this.handleSubmit();
            this._devtoolsSubmissionOverride = false;
          }
        }
      );
      const cleanup = () => {
        cleanupFormForceSubmitListener();
        cleanupFormResetListener();
        cleanupFormStateListener();
        cleanupDevtoolBroadcast();
        cleanupFieldMetaDerived();
        cleanupStoreDerived();
        formEventClient.emit("form-unmounted", {
          id: this._formId
        });
      };
      this.options.listeners?.onMount?.({ formApi: this });
      const { onMount } = this.options.validators || {};
      formEventClient.emit("form-api", {
        id: this._formId,
        state: this.store.state,
        options: this.options
      });
      if (!onMount) return cleanup;
      this.validateSync("mount");
      return cleanup;
    };
    this.update = (options) => {
      if (!options) return;
      const oldOptions = this.options;
      this.options = options;
      const shouldUpdateValues = options.defaultValues && !evaluate(options.defaultValues, oldOptions.defaultValues) && !this.state.isTouched;
      const shouldUpdateState = !evaluate(options.defaultState, oldOptions.defaultState) && !this.state.isTouched;
      if (!shouldUpdateValues && !shouldUpdateState) return;
      batch(() => {
        this.baseStore.setState(
          () => getDefaultFormState(
            Object.assign(
              {},
              this.state,
              shouldUpdateState ? options.defaultState : {},
              shouldUpdateValues ? {
                values: options.defaultValues
              } : {}
            )
          )
        );
      });
      formEventClient.emit("form-api", {
        id: this._formId,
        state: this.store.state,
        options: this.options
      });
    };
    this.reset = (values, opts2) => {
      const { fieldMeta: currentFieldMeta } = this.state;
      const fieldMetaBase = this.resetFieldMeta(currentFieldMeta);
      if (values && !opts2?.keepDefaultValues) {
        this.options = {
          ...this.options,
          defaultValues: values
        };
      }
      this.baseStore.setState(
        () => getDefaultFormState({
          ...this.options.defaultState,
          values: values ?? this.options.defaultValues ?? this.options.defaultState?.values,
          fieldMetaBase
        })
      );
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            if (!field.instance) return;
            const fieldInstance = field.instance;
            fieldValidationPromises.push(
              // Remember, `validate` is either a sync operation or a promise
              Promise.resolve().then(
                () => fieldInstance.validate(cause, { skipFormValidation: true })
              )
            );
            if (!field.instance.state.meta.isTouched) {
              field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
            }
          }
        );
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = async (field, index, cause) => {
      const currentValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(currentValue) ? Math.max(currentValue.length - 1, 0) : null;
      const fieldKeysToValidate = [`${field}[${index}]`];
      for (let i = index + 1; i <= (lastIndex ?? 0); i++) {
        fieldKeysToValidate.push(`${field}[${i}]`);
      }
      const fieldsToValidate = Object.keys(this.fieldInfo).filter(
        (fieldKey) => fieldKeysToValidate.some((key) => fieldKey.startsWith(key))
      );
      const fieldValidationPromises = [];
      batch(() => {
        fieldsToValidate.forEach((nestedField) => {
          fieldValidationPromises.push(
            Promise.resolve().then(() => this.validateField(nestedField, cause))
          );
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateField = (field, cause) => {
      const fieldInstance = this.fieldInfo[field]?.instance;
      if (!fieldInstance) {
        const { hasErrored } = this.validateSync(cause);
        if (hasErrored && !this.options.asyncAlways) {
          return this.getFieldMeta(field)?.errors ?? [];
        }
        return this.validateAsync(cause).then(() => {
          return this.getFieldMeta(field)?.errors ?? [];
        });
      }
      if (!fieldInstance.state.meta.isTouched) {
        fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      return fieldInstance.validate(cause);
    };
    this.validateSync = (cause) => {
      const validates = getSyncValidatorArray(cause, {
        ...this.options,
        form: this,
        validationLogic: this.options.validationLogic || defaultValidationLogic
      });
      let hasErrored = false;
      const currentValidationErrorMap = {};
      batch(() => {
        for (const validateObj of validates) {
          if (!validateObj.validate) continue;
          const rawError = this.runValidator({
            validate: validateObj.validate,
            value: {
              value: this.state.values,
              formApi: this,
              validationSource: "form"
            },
            type: "validate"
          });
          const { formError, fieldErrors } = normalizeError$1(rawError);
          const errorMapKey = getErrorMapKey$1(validateObj.cause);
          const allFieldsToProcess = /* @__PURE__ */ new Set([
            ...Object.keys(this.state.fieldMeta),
            ...Object.keys(fieldErrors || {})
          ]);
          for (const field of allFieldsToProcess) {
            if (this.baseStore.state.fieldMetaBase[field] === void 0 && !fieldErrors?.[field]) {
              continue;
            }
            const fieldMeta = this.getFieldMeta(field) ?? defaultFieldMeta;
            const {
              errorMap: currentErrorMap,
              errorSourceMap: currentErrorMapSource
            } = fieldMeta;
            const newFormValidatorError = fieldErrors?.[field];
            const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
              newFormValidatorError,
              isPreviousErrorFromFormValidator: (
                // These conditional checks are required, otherwise we get runtime errors.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                currentErrorMapSource?.[errorMapKey] === "form"
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              previousErrorValue: currentErrorMap?.[errorMapKey]
            });
            if (newSource === "form") {
              currentValidationErrorMap[field] = {
                ...currentValidationErrorMap[field],
                [errorMapKey]: newFormValidatorError
              };
            }
            if (currentErrorMap?.[errorMapKey] !== newErrorValue) {
              this.setFieldMeta(field, (prev = defaultFieldMeta) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              }));
            }
          }
          if (this.state.errorMap?.[errorMapKey] !== formError) {
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
          }
          if (formError || fieldErrors) {
            hasErrored = true;
          }
        }
        const submitErrKey = getErrorMapKey$1("submit");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          this.state.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
        ) {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [submitErrKey]: void 0
            }
          }));
        }
        const serverErrKey = getErrorMapKey$1("server");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          this.state.errorMap?.[serverErrKey] && cause !== "server" && !hasErrored
        ) {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [serverErrKey]: void 0
            }
          }));
        }
      });
      return { hasErrored, fieldsErrorMap: currentValidationErrorMap };
    };
    this.validateAsync = async (cause) => {
      const validates = getAsyncValidatorArray(cause, {
        ...this.options,
        form: this,
        validationLogic: this.options.validationLogic || defaultValidationLogic
      });
      if (!this.state.isFormValidating) {
        this.baseStore.setState((prev) => ({ ...prev, isFormValidating: true }));
      }
      const promises = [];
      let fieldErrorsFromFormValidators;
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        const key = getErrorMapKey$1(validateObj.cause);
        const fieldValidatorMeta = this.state.validationMetaMap[key];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        this.state.validationMetaMap[key] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: this.state.values,
                          formApi: this,
                          validationSource: "form",
                          signal: controller.signal
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            const { formError, fieldErrors: fieldErrorsFromNormalizeError } = normalizeError$1(rawError);
            if (fieldErrorsFromNormalizeError) {
              fieldErrorsFromFormValidators = fieldErrorsFromFormValidators ? {
                ...fieldErrorsFromFormValidators,
                ...fieldErrorsFromNormalizeError
              } : fieldErrorsFromNormalizeError;
            }
            const errorMapKey = getErrorMapKey$1(validateObj.cause);
            for (const field of Object.keys(
              this.state.fieldMeta
            )) {
              if (this.baseStore.state.fieldMetaBase[field] === void 0) {
                continue;
              }
              const fieldMeta = this.getFieldMeta(field);
              if (!fieldMeta) continue;
              const {
                errorMap: currentErrorMap,
                errorSourceMap: currentErrorMapSource
              } = fieldMeta;
              const newFormValidatorError = fieldErrorsFromFormValidators?.[field];
              const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
                newFormValidatorError,
                isPreviousErrorFromFormValidator: (
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  currentErrorMapSource?.[errorMapKey] === "form"
                ),
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                previousErrorValue: currentErrorMap?.[errorMapKey]
              });
              if (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                currentErrorMap?.[errorMapKey] !== newErrorValue
              ) {
                this.setFieldMeta(field, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    [errorMapKey]: newErrorValue
                  },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    [errorMapKey]: newSource
                  }
                }));
              }
            }
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
            resolve(
              fieldErrorsFromFormValidators ? { fieldErrors: fieldErrorsFromFormValidators, errorMapKey } : void 0
            );
          })
        );
      }
      let results = [];
      const fieldsErrorMap = {};
      if (promises.length) {
        results = await Promise.all(promises);
        for (const fieldValidationResult of results) {
          if (fieldValidationResult?.fieldErrors) {
            const { errorMapKey } = fieldValidationResult;
            for (const [field, fieldError] of Object.entries(
              fieldValidationResult.fieldErrors
            )) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = {
                ...oldErrorMap,
                [errorMapKey]: fieldError
              };
              fieldsErrorMap[field] = newErrorMap;
            }
          }
        }
      }
      this.baseStore.setState((prev) => ({
        ...prev,
        isFormValidating: false
      }));
      return fieldsErrorMap;
    };
    this.validate = (cause) => {
      const { hasErrored, fieldsErrorMap } = this.validateSync(cause);
      if (hasErrored && !this.options.asyncAlways) {
        return fieldsErrorMap;
      }
      return this.validateAsync(cause);
    };
    this._handleSubmit = async (submitMeta) => {
      this.baseStore.setState((old) => ({
        ...old,
        // Submission attempts mark the form as not submitted
        isSubmitted: false,
        // Count submission attempts
        submissionAttempts: old.submissionAttempts + 1,
        isSubmitSuccessful: false
        // Reset isSubmitSuccessful at the start of submission
      }));
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            if (!field.instance) return;
            if (!field.instance.state.meta.isTouched) {
              field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
            }
          }
        );
      });
      const submitMetaArg = submitMeta ?? this.options.onSubmitMeta;
      if (!this.state.canSubmit && !this._devtoolsSubmissionOverride) {
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        return;
      }
      this.baseStore.setState((d) => ({ ...d, isSubmitting: true }));
      const done = () => {
        this.baseStore.setState((prev) => ({ ...prev, isSubmitting: false }));
      };
      await this.validateAllFields("submit");
      if (!this.state.isFieldsValid) {
        done();
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        formEventClient.emit("form-submission", {
          id: this._formId,
          submissionAttempt: this.state.submissionAttempts,
          successful: false,
          stage: "validateAllFields",
          errors: Object.values(this.state.fieldMeta).map((meta) => meta.errors).flat()
        });
        return;
      }
      await this.validate("submit");
      if (!this.state.isValid) {
        done();
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        formEventClient.emit("form-submission", {
          id: this._formId,
          submissionAttempt: this.state.submissionAttempts,
          successful: false,
          stage: "validate",
          errors: this.state.errors
        });
        return;
      }
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            field.instance?.options.listeners?.onSubmit?.({
              value: field.instance.state.value,
              fieldApi: field.instance
            });
          }
        );
      });
      this.options.listeners?.onSubmit?.({ formApi: this, meta: submitMetaArg });
      try {
        await this.options.onSubmit?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        batch(() => {
          this.baseStore.setState((prev) => ({
            ...prev,
            isSubmitted: true,
            isSubmitSuccessful: true
            // Set isSubmitSuccessful to true on successful submission
          }));
          formEventClient.emit("form-submission", {
            id: this._formId,
            submissionAttempt: this.state.submissionAttempts,
            successful: true
          });
          done();
        });
      } catch (err) {
        this.baseStore.setState((prev) => ({
          ...prev,
          isSubmitSuccessful: false
          // Ensure isSubmitSuccessful is false if an error occurs
        }));
        formEventClient.emit("form-submission", {
          id: this._formId,
          submissionAttempt: this.state.submissionAttempts,
          successful: false,
          stage: "inflight",
          onError: err
        });
        done();
        throw err;
      }
    };
    this.getFieldValue = (field) => getBy(this.state.values, field);
    this.getFieldMeta = (field) => {
      return this.state.fieldMeta[field];
    };
    this.getFieldInfo = (field) => {
      return this.fieldInfo[field] ||= {
        instance: null,
        validationMetaMap: {
          onChange: void 0,
          onBlur: void 0,
          onSubmit: void 0,
          onMount: void 0,
          onServer: void 0,
          onDynamic: void 0
        }
      };
    };
    this.setFieldMeta = (field, updater) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: functionalUpdate(
              updater,
              prev.fieldMetaBase[field]
            )
          }
        };
      });
    };
    this.resetFieldMeta = (fieldMeta) => {
      return Object.keys(fieldMeta).reduce(
        (acc, key) => {
          const fieldKey = key;
          acc[fieldKey] = defaultFieldMeta;
          return acc;
        },
        {}
      );
    };
    this.setFieldValue = (field, updater, opts2) => {
      const dontUpdateMeta = opts2?.dontUpdateMeta ?? false;
      const dontRunListeners = opts2?.dontRunListeners ?? false;
      const dontValidate = opts2?.dontValidate ?? false;
      batch(() => {
        if (!dontUpdateMeta) {
          this.setFieldMeta(field, (prev) => ({
            ...prev,
            isTouched: true,
            isDirty: true,
            errorMap: {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              ...prev?.errorMap,
              onMount: void 0
            }
          }));
        }
        this.baseStore.setState((prev) => {
          return {
            ...prev,
            values: setBy(prev.values, field, updater)
          };
        });
      });
      if (!dontRunListeners) {
        this.getFieldInfo(field).instance?.triggerOnChangeListener();
      }
      if (!dontValidate) {
        this.validateField(field, "change");
      }
    };
    this.deleteField = (field) => {
      const subFieldsToDelete = Object.keys(this.fieldInfo).filter((f) => {
        const fieldStr = field.toString();
        return f !== fieldStr && f.startsWith(fieldStr);
      });
      const fieldsToDelete = [...subFieldsToDelete, field];
      this.baseStore.setState((prev) => {
        const newState = { ...prev };
        fieldsToDelete.forEach((f) => {
          newState.values = deleteBy(newState.values, f);
          delete this.fieldInfo[f];
          delete newState.fieldMetaBase[f];
        });
        return newState;
      });
    };
    this.pushFieldValue = (field, value, options) => {
      this.setFieldValue(
        field,
        (prev) => [...Array.isArray(prev) ? prev : [], value],
        options
      );
    };
    this.insertFieldValue = async (field, index, value, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          return [
            ...prev.slice(0, index),
            value,
            ...prev.slice(index)
          ];
        },
        mergeOpts(options, { dontValidate: true })
      );
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        await this.validateField(field, "change");
      }
      metaHelper(this).handleArrayInsert(field, index);
      if (!dontValidate) {
        await this.validateArrayFieldsStartingFrom(field, index, "change");
      }
    };
    this.replaceFieldValue = async (field, index, value, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          return prev.map(
            (d, i) => i === index ? value : d
          );
        },
        mergeOpts(options, { dontValidate: true })
      );
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        await this.validateField(field, "change");
        await this.validateArrayFieldsStartingFrom(field, index, "change");
      }
    };
    this.removeFieldValue = async (field, index, options) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        (prev) => {
          return prev.filter(
            (_d, i) => i !== index
          );
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).handleArrayRemove(field, index);
      if (lastIndex !== null) {
        const start = `${field}[${lastIndex}]`;
        this.deleteField(start);
      }
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        await this.validateField(field, "change");
        await this.validateArrayFieldsStartingFrom(field, index, "change");
      }
    };
    this.swapFieldValues = (field, index1, index2, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          const prev1 = prev[index1];
          const prev2 = prev[index2];
          return setBy(setBy(prev, `${index1}`, prev2), `${index2}`, prev1);
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).handleArraySwap(field, index1, index2);
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        this.validateField(field, "change");
        this.validateField(`${field}[${index1}]`, "change");
        this.validateField(`${field}[${index2}]`, "change");
      }
    };
    this.moveFieldValues = (field, index1, index2, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          const next = [...prev];
          next.splice(index2, 0, next.splice(index1, 1)[0]);
          return next;
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).handleArrayMove(field, index1, index2);
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        this.validateField(field, "change");
        this.validateField(`${field}[${index1}]`, "change");
        this.validateField(`${field}[${index2}]`, "change");
      }
    };
    this.clearFieldValues = (field, options) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        [],
        mergeOpts(options, { dontValidate: true })
      );
      if (lastIndex !== null) {
        for (let i = 0; i <= lastIndex; i++) {
          const fieldKey = `${field}[${i}]`;
          this.deleteField(fieldKey);
        }
      }
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        this.validateField(field, "change");
      }
    };
    this.resetField = (field) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: defaultFieldMeta
          },
          values: this.options.defaultValues ? setBy(prev.values, field, getBy(this.options.defaultValues, field)) : prev.values
        };
      });
    };
    this.setErrorMap = (errorMap) => {
      batch(() => {
        Object.entries(errorMap).forEach(([key, value]) => {
          const errorMapKey = key;
          if (isGlobalFormValidationError(value)) {
            const { formError, fieldErrors } = normalizeError$1(value);
            for (const fieldName of Object.keys(
              this.fieldInfo
            )) {
              const fieldMeta = this.getFieldMeta(fieldName);
              if (!fieldMeta) continue;
              this.setFieldMeta(fieldName, (prev) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: fieldErrors?.[fieldName]
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: "form"
                }
              }));
            }
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
          } else {
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: value
              }
            }));
          }
        });
      });
    };
    this.getAllErrors = () => {
      return {
        form: {
          errors: this.state.errors,
          errorMap: this.state.errorMap
        },
        fields: Object.entries(this.state.fieldMeta).reduce(
          (acc, [fieldName, fieldMeta]) => {
            if (Object.keys(fieldMeta).length && fieldMeta.errors.length) {
              acc[fieldName] = {
                errors: fieldMeta.errors,
                errorMap: fieldMeta.errorMap
              };
            }
            return acc;
          },
          {}
        )
      };
    };
    this.parseValuesWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.parseValuesWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this._formId = opts?.formId ?? uuid();
    this._devtoolsSubmissionOverride = false;
    let baseStoreVal = getDefaultFormState({
      ...opts?.defaultState,
      values: opts?.defaultValues ?? opts?.defaultState?.values
    });
    if (opts?.transform) {
      baseStoreVal = opts.transform({ state: baseStoreVal }).state;
      for (const errKey of Object.keys(baseStoreVal.errorMap)) {
        const errKeyMap = baseStoreVal.errorMap[errKey];
        if (errKeyMap === void 0 || !isGlobalFormValidationError(errKeyMap)) {
          continue;
        }
        for (const fieldName of Object.keys(errKeyMap.fields)) {
          const fieldErr = errKeyMap.fields[fieldName];
          if (fieldErr === void 0) {
            continue;
          }
          const existingFieldMeta = baseStoreVal.fieldMetaBase[fieldName];
          baseStoreVal.fieldMetaBase[fieldName] = {
            isTouched: false,
            isValidating: false,
            isBlurred: false,
            isDirty: false,
            ...existingFieldMeta ?? {},
            errorSourceMap: {
              ...existingFieldMeta?.["errorSourceMap"] ?? {},
              onChange: "form"
            },
            errorMap: {
              ...existingFieldMeta?.["errorMap"] ?? {},
              [errKey]: fieldErr
            }
          };
        }
      }
    }
    this.baseStore = new Store(baseStoreVal);
    this.fieldMetaDerived = new Derived({
      deps: [this.baseStore],
      fn: ({ prevDepVals, currDepVals, prevVal: _prevVal }) => {
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals?.[0];
        const currBaseStore = currDepVals[0];
        let originalMetaCount = 0;
        const fieldMeta = {};
        for (const fieldName of Object.keys(
          currBaseStore.fieldMetaBase
        )) {
          const currBaseMeta = currBaseStore.fieldMetaBase[fieldName];
          const prevBaseMeta = prevBaseStore?.fieldMetaBase[fieldName];
          const prevFieldInfo = prevVal?.[fieldName];
          const curFieldVal = getBy(currBaseStore.values, fieldName);
          let fieldErrors = prevFieldInfo?.errors;
          if (!prevBaseMeta || currBaseMeta.errorMap !== prevBaseMeta.errorMap) {
            fieldErrors = Object.values(currBaseMeta.errorMap ?? {}).filter(
              (val) => val !== void 0
            );
            const fieldInstance = this.getFieldInfo(fieldName)?.instance;
            if (!fieldInstance || !fieldInstance.options.disableErrorFlat) {
              fieldErrors = fieldErrors.flat(1);
            }
          }
          const isFieldValid = !isNonEmptyArray(fieldErrors);
          const isFieldPristine = !currBaseMeta.isDirty;
          const isDefaultValue = evaluate(
            curFieldVal,
            getBy(this.options.defaultValues, fieldName)
          ) || evaluate(
            curFieldVal,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.getFieldInfo(fieldName)?.instance?.options.defaultValue
          );
          if (prevFieldInfo && prevFieldInfo.isPristine === isFieldPristine && prevFieldInfo.isValid === isFieldValid && prevFieldInfo.isDefaultValue === isDefaultValue && prevFieldInfo.errors === fieldErrors && currBaseMeta === prevBaseMeta) {
            fieldMeta[fieldName] = prevFieldInfo;
            originalMetaCount++;
            continue;
          }
          fieldMeta[fieldName] = {
            ...currBaseMeta,
            errors: fieldErrors ?? [],
            isPristine: isFieldPristine,
            isValid: isFieldValid,
            isDefaultValue
          };
        }
        if (!Object.keys(currBaseStore.fieldMetaBase).length) return fieldMeta;
        if (prevVal && originalMetaCount === Object.keys(currBaseStore.fieldMetaBase).length) {
          return prevVal;
        }
        return fieldMeta;
      }
    });
    this.store = new Derived({
      deps: [this.baseStore, this.fieldMetaDerived],
      fn: ({ prevDepVals, currDepVals, prevVal: _prevVal }) => {
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals?.[0];
        const currBaseStore = currDepVals[0];
        const currFieldMeta = currDepVals[1];
        const fieldMetaValues = Object.values(currFieldMeta).filter(
          Boolean
        );
        const isFieldsValidating = fieldMetaValues.some(
          (field) => field.isValidating
        );
        const isFieldsValid = fieldMetaValues.every((field) => field.isValid);
        const isTouched = fieldMetaValues.some((field) => field.isTouched);
        const isBlurred = fieldMetaValues.some((field) => field.isBlurred);
        const isDefaultValue = fieldMetaValues.every(
          (field) => field.isDefaultValue
        );
        const shouldInvalidateOnMount = (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          isTouched && currBaseStore.errorMap?.onMount
        );
        const isDirty = fieldMetaValues.some((field) => field.isDirty);
        const isPristine = !isDirty;
        const hasOnMountError = Boolean(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          currBaseStore.errorMap?.onMount || // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          fieldMetaValues.some((f) => f?.errorMap?.onMount)
        );
        const isValidating = !!isFieldsValidating;
        let errors = prevVal?.errors ?? [];
        if (!prevBaseStore || currBaseStore.errorMap !== prevBaseStore.errorMap) {
          errors = Object.values(currBaseStore.errorMap).reduce((prev, curr) => {
            if (curr === void 0) return prev;
            if (curr && isGlobalFormValidationError(curr)) {
              prev.push(curr.form);
              return prev;
            }
            prev.push(curr);
            return prev;
          }, []);
        }
        const isFormValid = errors.length === 0;
        const isValid = isFieldsValid && isFormValid;
        const submitInvalid = this.options.canSubmitWhenInvalid ?? false;
        const canSubmit = currBaseStore.submissionAttempts === 0 && !isTouched && !hasOnMountError || !isValidating && !currBaseStore.isSubmitting && isValid || submitInvalid;
        let errorMap = currBaseStore.errorMap;
        if (shouldInvalidateOnMount) {
          errors = errors.filter(
            (err) => err !== currBaseStore.errorMap.onMount
          );
          errorMap = Object.assign(errorMap, { onMount: void 0 });
        }
        if (prevVal && prevBaseStore && prevVal.errorMap === errorMap && prevVal.fieldMeta === this.fieldMetaDerived.state && prevVal.errors === errors && prevVal.isFieldsValidating === isFieldsValidating && prevVal.isFieldsValid === isFieldsValid && prevVal.isFormValid === isFormValid && prevVal.isValid === isValid && prevVal.canSubmit === canSubmit && prevVal.isTouched === isTouched && prevVal.isBlurred === isBlurred && prevVal.isPristine === isPristine && prevVal.isDefaultValue === isDefaultValue && prevVal.isDirty === isDirty && evaluate(prevBaseStore, currBaseStore)) {
          return prevVal;
        }
        const state = {
          ...currBaseStore,
          errorMap,
          fieldMeta: this.fieldMetaDerived.state,
          errors,
          isFieldsValidating,
          isFieldsValid,
          isFormValid,
          isValid,
          canSubmit,
          isTouched,
          isBlurred,
          isPristine,
          isDefaultValue,
          isDirty
        };
        return state;
      }
    });
    this.handleSubmit = this.handleSubmit.bind(this);
    this.update(opts || {});
  }
  get state() {
    return this.store.state;
  }
  get formId() {
    return this._formId;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  handleSubmit(submitMeta) {
    return this._handleSubmit(submitMeta);
  }
}
function normalizeError$1(rawError) {
  if (rawError) {
    if (isGlobalFormValidationError(rawError)) {
      const formError = normalizeError$1(rawError.form).formError;
      const fieldErrors = rawError.fields;
      return { formError, fieldErrors };
    }
    return { formError: rawError };
  }
  return { formError: void 0 };
}
function getErrorMapKey$1(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}
class FieldApi {
  /**
   * Initializes a new `FieldApi` instance.
   */
  constructor(opts) {
    this.options = {};
    this.mount = () => {
      const cleanup = this.store.mount();
      if (this.options.defaultValue !== void 0 && !this.getMeta().isTouched) {
        this.form.setFieldValue(this.name, this.options.defaultValue, {
          dontUpdateMeta: true
        });
      }
      const info = this.getInfo();
      info.instance = this;
      this.update(this.options);
      const { onMount } = this.options.validators || {};
      if (onMount) {
        const error = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            fieldApi: this,
            validationSource: "field"
          },
          type: "validate"
        });
        if (error) {
          this.setMeta(
            (prev) => ({
              ...prev,
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              errorMap: { ...prev?.errorMap, onMount: error },
              errorSourceMap: {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                ...prev?.errorSourceMap,
                onMount: "field"
              }
            })
          );
        }
      }
      this.options.listeners?.onMount?.({
        value: this.state.value,
        fieldApi: this
      });
      return cleanup;
    };
    this.update = (opts2) => {
      this.options = opts2;
      this.name = opts2.name;
      if (!this.state.meta.isTouched && this.options.defaultValue !== void 0) {
        const formField = this.form.getFieldValue(this.name);
        if (!evaluate(formField, opts2.defaultValue)) {
          this.form.setFieldValue(this.name, opts2.defaultValue, {
            dontUpdateMeta: true,
            dontValidate: true,
            dontRunListeners: true
          });
        }
      }
      if (!this.form.getFieldMeta(this.name)) {
        this.form.setFieldMeta(this.name, this.state.meta);
      }
    };
    this.getValue = () => {
      return this.form.getFieldValue(this.name);
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(
        this.name,
        updater,
        mergeOpts(options, { dontRunListeners: true, dontValidate: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
      if (!options?.dontValidate) {
        this.validate("change");
      }
    };
    this.getMeta = () => this.store.state.meta;
    this.setMeta = (updater) => this.form.setFieldMeta(this.name, updater);
    this.getInfo = () => this.form.getFieldInfo(this.name);
    this.pushValue = (value, options) => {
      this.form.pushFieldValue(
        this.name,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.insertValue = (index, value, options) => {
      this.form.insertFieldValue(
        this.name,
        index,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.replaceValue = (index, value, options) => {
      this.form.replaceFieldValue(
        this.name,
        index,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.removeValue = (index, options) => {
      this.form.removeFieldValue(
        this.name,
        index,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.swapValues = (aIndex, bIndex, options) => {
      this.form.swapFieldValues(
        this.name,
        aIndex,
        bIndex,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.moveValue = (aIndex, bIndex, options) => {
      this.form.moveFieldValues(
        this.name,
        aIndex,
        bIndex,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.clearValues = (options) => {
      this.form.clearFieldValues(
        this.name,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.getLinkedFields = (cause) => {
      const fields = Object.values(this.form.fieldInfo);
      const linkedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        const { onChangeListenTo, onBlurListenTo } = field.instance.options.validators || {};
        if (cause === "change" && onChangeListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
        if (cause === "blur" && onBlurListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
      }
      return linkedFields;
    };
    this.validateSync = (cause, errorFromForm) => {
      const validates = getSyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      });
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getSyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      let hasErrored = false;
      batch(() => {
        const validateFieldFn = (field, validateObj) => {
          const errorMapKey = getErrorMapKey(validateObj.cause);
          const fieldLevelError = validateObj.validate ? normalizeError(
            field.runValidator({
              validate: validateObj.validate,
              value: {
                value: field.store.state.value,
                validationSource: "field",
                fieldApi: field
              },
              type: "validate"
            })
          ) : void 0;
          const formLevelError = errorFromForm[errorMapKey];
          const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (field.state.meta.errorMap?.[errorMapKey] !== newErrorValue) {
            field.setMeta((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: newErrorValue
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: newSource
              }
            }));
          }
          if (newErrorValue) {
            hasErrored = true;
          }
        };
        for (const validateObj of validates) {
          validateFieldFn(this, validateObj);
        }
        for (const fieldValitateObj of linkedFieldValidates) {
          if (!fieldValitateObj.validate) continue;
          validateFieldFn(fieldValitateObj.field, fieldValitateObj);
        }
      });
      const submitErrKey = getErrorMapKey("submit");
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.state.meta.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
      ) {
        this.setMeta((prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [submitErrKey]: void 0
          },
          errorSourceMap: {
            ...prev.errorSourceMap,
            [submitErrKey]: void 0
          }
        }));
      }
      return { hasErrored };
    };
    this.validateAsync = async (cause, formValidationResultPromise) => {
      const validates = getAsyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      });
      const asyncFormValidationResults = await formValidationResultPromise;
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getAsyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      const validatesPromises = [];
      const linkedPromises = [];
      const hasAsyncValidators = validates.some((v) => v.validate) || linkedFieldValidates.some((v) => v.validate);
      if (hasAsyncValidators) {
        if (!this.state.meta.isValidating) {
          this.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
        for (const linkedField of linkedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
      }
      const validateFieldAsyncFn = (field, validateObj, promises) => {
        const errorMapKey = getErrorMapKey(validateObj.cause);
        const fieldValidatorMeta = field.getInfo().validationMetaMap[errorMapKey];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        this.getInfo().validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                if (this.timeoutIds.validations[validateObj.cause]) {
                  clearTimeout(this.timeoutIds.validations[validateObj.cause]);
                }
                this.timeoutIds.validations[validateObj.cause] = setTimeout(
                  async () => {
                    if (controller.signal.aborted) return rawResolve(void 0);
                    try {
                      rawResolve(
                        await this.runValidator({
                          validate: validateObj.validate,
                          value: {
                            value: field.store.state.value,
                            fieldApi: field,
                            signal: controller.signal,
                            validationSource: "field"
                          },
                          type: "validateAsync"
                        })
                      );
                    } catch (e) {
                      rawReject(e);
                    }
                  },
                  validateObj.debounceMs
                );
              });
            } catch (e) {
              rawError = e;
            }
            if (controller.signal.aborted) return resolve(void 0);
            const fieldLevelError = normalizeError(rawError);
            const formLevelError = asyncFormValidationResults[this.name]?.[errorMapKey];
            const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
              formLevelError,
              fieldLevelError
            });
            field.setMeta((prev) => {
              return {
                ...prev,
                errorMap: {
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  ...prev?.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              };
            });
            resolve(newErrorValue);
          })
        );
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of linkedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldAsyncFn(
          fieldValitateObj.field,
          fieldValitateObj,
          linkedPromises
        );
      }
      let results = [];
      if (validatesPromises.length || linkedPromises.length) {
        results = await Promise.all(validatesPromises);
        await Promise.all(linkedPromises);
      }
      if (hasAsyncValidators) {
        this.setMeta((prev) => ({ ...prev, isValidating: false }));
        for (const linkedField of linkedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: false }));
        }
      }
      return results.filter(Boolean);
    };
    this.validate = (cause, opts2) => {
      if (!this.state.meta.isTouched) return [];
      const { fieldsErrorMap } = opts2?.skipFormValidation ? { fieldsErrorMap: {} } : this.form.validateSync(cause);
      const { hasErrored } = this.validateSync(
        cause,
        fieldsErrorMap[this.name] ?? {}
      );
      if (hasErrored && !this.options.asyncAlways) {
        this.getInfo().validationMetaMap[getErrorMapKey(cause)]?.lastAbortController.abort();
        return this.state.meta.errors;
      }
      const formValidationResultPromise = opts2?.skipFormValidation ? Promise.resolve({}) : this.form.validateAsync(cause);
      return this.validateAsync(cause, formValidationResultPromise);
    };
    this.handleChange = (updater) => {
      this.setValue(updater);
    };
    this.handleBlur = () => {
      const prevTouched = this.state.meta.isTouched;
      if (!prevTouched) {
        this.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      if (!this.state.meta.isBlurred) {
        this.setMeta((prev) => ({ ...prev, isBlurred: true }));
      }
      this.validate("blur");
      this.triggerOnBlurListener();
    };
    this.setErrorMap = (errorMap) => {
      this.setMeta((prev) => ({
        ...prev,
        errorMap: {
          ...prev.errorMap,
          ...errorMap
        }
      }));
    };
    this.parseValueWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.parseValueWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.triggerOnChangeListener = () => {
      const formDebounceMs = this.form.options.listeners?.onChangeDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.change) {
          clearTimeout(this.timeoutIds.formListeners.change);
        }
        this.timeoutIds.formListeners.change = setTimeout(() => {
          this.form.options.listeners?.onChange?.({
            formApi: this.form,
            fieldApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onChange?.({
          formApi: this.form,
          fieldApi: this
        });
      }
      const fieldDebounceMs = this.options.listeners?.onChangeDebounceMs;
      if (fieldDebounceMs && fieldDebounceMs > 0) {
        if (this.timeoutIds.listeners.change) {
          clearTimeout(this.timeoutIds.listeners.change);
        }
        this.timeoutIds.listeners.change = setTimeout(() => {
          this.options.listeners?.onChange?.({
            value: this.state.value,
            fieldApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onChange?.({
          value: this.state.value,
          fieldApi: this
        });
      }
    };
    this.form = opts.form;
    this.name = opts.name;
    this.options = opts;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.store = new Derived({
      deps: [this.form.store],
      fn: ({ prevVal: _prevVal }) => {
        const prevVal = _prevVal;
        const meta = this.form.getFieldMeta(this.name) ?? {
          ...defaultFieldMeta,
          ...opts.defaultMeta
        };
        let value = this.form.getFieldValue(this.name);
        if (!meta.isTouched && value === void 0 && this.options.defaultValue !== void 0 && !evaluate(value, this.options.defaultValue)) {
          value = this.options.defaultValue;
        }
        if (prevVal && prevVal.value === value && prevVal.meta === meta) {
          return prevVal;
        }
        return {
          value,
          meta
        };
      }
    });
  }
  /**
   * The current field state.
   */
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  triggerOnBlurListener() {
    const formDebounceMs = this.form.options.listeners?.onBlurDebounceMs;
    if (formDebounceMs && formDebounceMs > 0) {
      if (this.timeoutIds.formListeners.blur) {
        clearTimeout(this.timeoutIds.formListeners.blur);
      }
      this.timeoutIds.formListeners.blur = setTimeout(() => {
        this.form.options.listeners?.onBlur?.({
          formApi: this.form,
          fieldApi: this
        });
      }, formDebounceMs);
    } else {
      this.form.options.listeners?.onBlur?.({
        formApi: this.form,
        fieldApi: this
      });
    }
    const fieldDebounceMs = this.options.listeners?.onBlurDebounceMs;
    if (fieldDebounceMs && fieldDebounceMs > 0) {
      if (this.timeoutIds.listeners.blur) {
        clearTimeout(this.timeoutIds.listeners.blur);
      }
      this.timeoutIds.listeners.blur = setTimeout(() => {
        this.options.listeners?.onBlur?.({
          value: this.state.value,
          fieldApi: this
        });
      }, fieldDebounceMs);
    } else {
      this.options.listeners?.onBlur?.({
        value: this.state.value,
        fieldApi: this
      });
    }
  }
}
function normalizeError(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}
function useStore(store, selector = (d) => d, options = {}) {
  options.equal ?? shallow;
  let slice = selector(store.state);
  return {
    get current() {
      return slice;
    }
  };
}
function shallow(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const v of objA) {
      if (!objB.has(v)) return false;
    }
    return true;
  }
  if (objA instanceof Date && objB instanceof Date) {
    if (objA.getTime() !== objB.getTime()) return false;
    return true;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}
function createField(opts) {
  const options = opts();
  const api = new FieldApi(options);
  const extendedApi = api;
  extendedApi.Field = Field_1;
  const storeSub = useStore(api.store);
  Object.defineProperty(extendedApi, "state", {
    get() {
      return storeSub.current;
    }
  });
  return extendedApi;
}
function Field_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, $$slots, $$events, ...fieldOptions } = $$props;
    const fieldApi = createField(() => {
      return fieldOptions;
    });
    children($$renderer2, fieldApi);
    $$renderer2.push(`<!---->`);
  });
}
function Subscribe($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, store, selector = (state) => state } = $$props;
    const value = useStore(store, selector);
    children($$renderer2, value.current);
    $$renderer2.push(`<!---->`);
  });
}
function createForm(opts) {
  const options = opts?.();
  const api = new FormApi(options);
  const extendedApi = api;
  extendedApi.Field = (internal, props) => Field_1(internal, { ...props, form: api });
  extendedApi.createField = (props) => createField(() => {
    return { ...props(), form: api };
  });
  extendedApi.useStore = (selector) => useStore(api.store, selector);
  extendedApi.Subscribe = (internal, props) => Subscribe(internal, { ...props, store: api.store });
  noop$1(api.mount);
  return extendedApi;
}
function generateRecurringTasks(input) {
  const tasks = [];
  let currentDate = new Date(input.startDate);
  for (let i = 0; i < input.occurrences; i++) {
    const dateStr = formatISODate(currentDate);
    const startDateTime = `${dateStr}T00:00:00`;
    const dueDateTime = `${dateStr}T23:59:59`;
    tasks.push({
      title: input.title,
      description: input.description,
      startDate: startDateTime,
      dueDate: dueDateTime,
      category: input.category,
      status: input.status,
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      actualDurationMinutes: input.actualDurationMinutes
    });
    switch (input.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }
  return tasks;
}
function Create_task_dialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const createMutation2 = createTaskMutation();
    const updateMutation = updateTaskMutation();
    const deleteMutation = deleteTaskMutation();
    const batchMutation = batchCreateTasksMutation();
    let isRecurring = false;
    let recurringFrequency = "weekly";
    let recurringOccurrences = 4;
    const dialogState = derived(() => store_get($$store_subs ??= {}, "$createTaskDialogStore", createTaskDialogStore));
    const isEdit = derived(() => dialogState() !== null && typeof dialogState() === "object" && dialogState().mode === "edit");
    const editTask = derived(() => dialogState() !== null && typeof dialogState() === "object" && dialogState().mode === "edit" ? dialogState().task : null);
    const isOpen = derived(() => dialogState() !== null);
    const prefilledDate = derived(() => dialogState() !== null && typeof dialogState() === "object" && dialogState().mode === "create" && "date" in dialogState() ? dialogState().date : null);
    let editTitle = "";
    let editDescription = "";
    let editStartDate = `${today}T00:00`;
    let editDueDate = "";
    let editCategory = "A";
    let editStatus = "OPEN";
    let editEstimatedDuration = "";
    let editActualDuration = "";
    function parseDurationMinutes(raw) {
      if (raw === null || raw === void 0) return null;
      const normalized = typeof raw === "string" ? raw.trim() : String(raw);
      if (!normalized) return null;
      const value = Number(normalized);
      if (!Number.isFinite(value) || value < 0) return null;
      return Math.round(value);
    }
    function getPendingTimeDefaults() {
      if (typeof window !== "undefined") {
        const pendingTime = window.__pendingTaskTime;
        if (pendingTime && prefilledDate()) {
          return {
            startDate: `${prefilledDate()}T${pendingTime.startTime}`,
            dueDate: `${prefilledDate()}T${pendingTime.endTime}`
          };
        }
      }
      return {
        startDate: prefilledDate() ? `${prefilledDate()}T00:00` : `${today}T00:00`,
        dueDate: prefilledDate() ? `${prefilledDate()}T23:59` : ""
      };
    }
    const form = createForm(() => {
      const timeDefaults = getPendingTimeDefaults();
      return {
        defaultValues: {
          title: "",
          description: "",
          startDate: timeDefaults.startDate,
          dueDate: timeDefaults.dueDate,
          category: "A",
          status: "OPEN",
          estimatedDurationMinutes: "",
          actualDurationMinutes: ""
        },
        onSubmit: async ({ value }) => {
          const startDateTime = value.startDate ? `${value.startDate}:00` : "";
          const dueDateTime = value.dueDate ? `${value.dueDate}:00` : "";
          const input = {
            ...value,
            title: value.title.trim(),
            description: value.description?.trim() ?? "",
            startDate: startDateTime,
            dueDate: dueDateTime,
            estimatedDurationMinutes: parseDurationMinutes(value.estimatedDurationMinutes),
            actualDurationMinutes: parseDurationMinutes(value.actualDurationMinutes)
          };
          if (!input.title) return;
          if (isRecurring) {
            const tasks = generateRecurringTasks({
              title: input.title,
              description: input.description,
              startDate: input.startDate,
              frequency: recurringFrequency,
              occurrences: recurringOccurrences,
              category: input.category,
              status: input.status,
              estimatedDurationMinutes: input.estimatedDurationMinutes,
              actualDurationMinutes: input.actualDurationMinutes
            });
            const mut = get(batchMutation);
            mut.mutate(tasks);
          } else {
            const mut = get(createMutation2);
            mut.mutate(input, {
              onSuccess: (createdTask) => {
                if (typeof window !== "undefined") {
                  const pendingTime = window.__pendingTaskTime;
                  if (pendingTime && createdTask?.id) {
                    saveTaskTime(createdTask.id, pendingTime.startTime, pendingTime.endTime);
                    delete window.__pendingTaskTime;
                  }
                }
              }
            });
          }
          form.reset();
          isRecurring = false;
          createTaskDialogStore.close();
        }
      };
    });
    function handleDelete() {
      if (!editTask()) return;
      if (editTask().id.startsWith("project-card-")) {
        const bridge = window.__projectCardDialogBridge;
        const cardId = editTask().id.replace("project-card-", "");
        bridge?.deleteCard?.(cardId);
        createTaskDialogStore.close();
        return;
      }
      const taskToRestore = {
        title: editTask().title,
        description: editTask().description ?? "",
        startDate: editTask().startDate,
        dueDate: editTask().dueDate,
        category: editTask().category,
        status: editTask().status,
        estimatedDurationMinutes: editTask().estimatedDurationMinutes,
        actualDurationMinutes: editTask().actualDurationMinutes
      };
      get(deleteMutation).mutate(editTask().id, {
        onSuccess: () => {
          createTaskDialogStore.close();
          toastStore.success("Aufgabe gelöscht", {
            label: "Rückgängig machen",
            onClick: () => {
              get(createMutation2).mutate(taskToRestore);
            }
          });
        }
      });
    }
    const statusLabels = {
      OPEN: "Offen",
      IN_PROGRESS: "In Arbeit",
      DONE: "Erledigt",
      CANCELLED: "Abgebrochen"
    };
    const categoryLabels = { A: "A", B: "B", C: "C" };
    const selectClass = "border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (Dialog) {
        $$renderer3.push("<!--[-->");
        Dialog($$renderer3, {
          open: isOpen(),
          onOpenChange: (open) => !open && createTaskDialogStore.close(),
          children: ($$renderer4) => {
            if (Dialog_content) {
              $$renderer4.push("<!--[-->");
              Dialog_content($$renderer4, {
                class: "text-foreground sm:max-w-[425px] z-100",
                children: ($$renderer5) => {
                  if (Dialog_header) {
                    $$renderer5.push("<!--[-->");
                    Dialog_header($$renderer5, {
                      children: ($$renderer6) => {
                        if (Dialog_title) {
                          $$renderer6.push("<!--[-->");
                          Dialog_title($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->${escape_html(isEdit() ? "Aufgabe bearbeiten" : "Neue Aufgabe")}`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                        $$renderer6.push(` `);
                        if (Dialog_description) {
                          $$renderer6.push("<!--[-->");
                          Dialog_description($$renderer6, {
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->${escape_html(isEdit() ? "Ändere Titel, Frist oder Status. Speichern übernimmt die Änderungen." : "Erfasse Titel, Frist und Priorität. Die Aufgabe landet in deinem Eingang.")}`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push("<!--]-->");
                        } else {
                          $$renderer6.push("<!--[!-->");
                          $$renderer6.push("<!--]-->");
                        }
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push("<!--]-->");
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push("<!--]-->");
                  }
                  $$renderer5.push(` `);
                  if (isEdit()) {
                    $$renderer5.push("<!--[-->");
                    $$renderer5.push(`<form class="grid gap-4 pt-4"><div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-title",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Titel`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Input($$renderer5, {
                      id: "task-title",
                      type: "text",
                      placeholder: "Titel",
                      get value() {
                        return editTitle;
                      },
                      set value($$value) {
                        editTitle = $$value;
                        $$settled = false;
                      }
                    });
                    $$renderer5.push(`<!----></div> <div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-description",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Beschreibung (optional)`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Input($$renderer5, {
                      id: "task-description",
                      type: "text",
                      placeholder: "Details",
                      get value() {
                        return editDescription;
                      },
                      set value($$value) {
                        editDescription = $$value;
                        $$settled = false;
                      }
                    });
                    $$renderer5.push(`<!----></div> <div class="grid grid-cols-2 gap-4"><div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-startDate",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Start`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Input($$renderer5, {
                      id: "task-startDate",
                      type: "datetime-local",
                      get value() {
                        return editStartDate;
                      },
                      set value($$value) {
                        editStartDate = $$value;
                        $$settled = false;
                      }
                    });
                    $$renderer5.push(`<!----></div> <div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-dueDate",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Fällig`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Input($$renderer5, {
                      id: "task-dueDate",
                      type: "datetime-local",
                      get value() {
                        return editDueDate;
                      },
                      set value($$value) {
                        editDueDate = $$value;
                        $$settled = false;
                      }
                    });
                    $$renderer5.push(`<!----></div></div> <div class="grid grid-cols-2 gap-4"><div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-estimatedDuration",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Dauerschätzung (Min)`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Input($$renderer5, {
                      id: "task-estimatedDuration",
                      type: "number",
                      min: "0",
                      step: "1",
                      placeholder: "z. B. 60",
                      get value() {
                        return editEstimatedDuration;
                      },
                      set value($$value) {
                        editEstimatedDuration = $$value;
                        $$settled = false;
                      }
                    });
                    $$renderer5.push(`<!----></div> <div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-actualDuration",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Tatsächliche Dauer (Min)`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Input($$renderer5, {
                      id: "task-actualDuration",
                      type: "number",
                      min: "0",
                      step: "1",
                      placeholder: "z. B. 45",
                      get value() {
                        return editActualDuration;
                      },
                      set value($$value) {
                        editActualDuration = $$value;
                        $$settled = false;
                      }
                    });
                    $$renderer5.push(`<!----></div></div> <div class="grid grid-cols-2 gap-4"><div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-category",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Priorität`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    $$renderer5.select({ id: "task-category", class: selectClass, value: editCategory }, ($$renderer6) => {
                      $$renderer6.option({ value: "A" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(categoryLabels.A)}`);
                      });
                      $$renderer6.option({ value: "B" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(categoryLabels.B)}`);
                      });
                      $$renderer6.option({ value: "C" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(categoryLabels.C)}`);
                      });
                    });
                    $$renderer5.push(`</div> <div class="grid gap-2">`);
                    Label($$renderer5, {
                      for: "task-status",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Status`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    $$renderer5.select({ id: "task-status", class: selectClass, value: editStatus }, ($$renderer6) => {
                      $$renderer6.option({ value: "OPEN" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(statusLabels.OPEN)}`);
                      });
                      $$renderer6.option({ value: "IN_PROGRESS" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(statusLabels.IN_PROGRESS)}`);
                      });
                      $$renderer6.option({ value: "DONE" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(statusLabels.DONE)}`);
                      });
                      $$renderer6.option({ value: "CANCELLED" }, ($$renderer7) => {
                        $$renderer7.push(`${escape_html(statusLabels.CANCELLED)}`);
                      });
                    });
                    $$renderer5.push(`</div></div> `);
                    if (Dialog_footer) {
                      $$renderer5.push("<!--[-->");
                      Dialog_footer($$renderer5, {
                        class: "flex items-center justify-between pt-4",
                        children: ($$renderer6) => {
                          Button($$renderer6, {
                            type: "button",
                            variant: "destructive",
                            size: "sm",
                            onclick: handleDelete,
                            disabled: store_get($$store_subs ??= {}, "$deleteMutation", deleteMutation).isPending,
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->${escape_html(store_get($$store_subs ??= {}, "$deleteMutation", deleteMutation).isPending ? "Wird gelöscht…" : "Löschen")}`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push(`<!----> <div class="flex gap-2">`);
                          {
                            let child = function($$renderer7, { props }) {
                              Button($$renderer7, spread_props([
                                props,
                                {
                                  variant: "outline",
                                  children: ($$renderer8) => {
                                    $$renderer8.push(`<!---->Abbrechen`);
                                  },
                                  $$slots: { default: true }
                                }
                              ]));
                            };
                            if (Dialog_close) {
                              $$renderer6.push("<!--[-->");
                              Dialog_close($$renderer6, { child, $$slots: { child: true } });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                          }
                          $$renderer6.push(` `);
                          Button($$renderer6, {
                            type: "submit",
                            disabled: store_get($$store_subs ??= {}, "$updateMutation", updateMutation).isPending,
                            children: ($$renderer7) => {
                              $$renderer7.push(`<!---->${escape_html(store_get($$store_subs ??= {}, "$updateMutation", updateMutation).isPending ? "Wird gespeichert…" : "Speichern")}`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer6.push(`<!----></div>`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push("<!--]-->");
                    } else {
                      $$renderer5.push("<!--[!-->");
                      $$renderer5.push("<!--]-->");
                    }
                    $$renderer5.push(`</form>`);
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push(`<form class="grid gap-4 pt-4">`);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-title",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Titel`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        Input($$renderer6, {
                          id: "global-create-title",
                          type: "text",
                          placeholder: "z. B. Angebot prüfen",
                          value: field.state.value,
                          onblur: () => field.handleBlur(),
                          oninput: (e) => field.handleChange(e.currentTarget?.value ?? "")
                        });
                        $$renderer6.push(`<!----> `);
                        if (field.state.meta.errors?.length) {
                          $$renderer6.push("<!--[-->");
                          $$renderer6.push(`<p class="text-sm text-destructive">${escape_html(field.state.meta.errors[0])}</p>`);
                        } else {
                          $$renderer6.push("<!--[!-->");
                        }
                        $$renderer6.push(`<!--]--></div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, {
                          name: "title",
                          validators: {
                            onChange: ({ value }) => !value?.trim() ? "Titel erforderlich" : void 0
                          },
                          children,
                          $$slots: { default: true }
                        });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(` `);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-description",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Beschreibung (optional)`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        Input($$renderer6, {
                          id: "global-create-description",
                          type: "text",
                          placeholder: "Details zur Aufgabe",
                          value: field.state.value,
                          onblur: () => field.handleBlur(),
                          oninput: (e) => field.handleChange(e.currentTarget?.value ?? "")
                        });
                        $$renderer6.push(`<!----></div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, { name: "description", children, $$slots: { default: true } });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(` <div class="grid grid-cols-2 gap-4">`);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-startDate",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Start`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        Input($$renderer6, {
                          id: "global-create-startDate",
                          type: "datetime-local",
                          value: field.state.value,
                          onblur: () => field.handleBlur(),
                          oninput: (e) => field.handleChange(e.currentTarget?.value ?? "")
                        });
                        $$renderer6.push(`<!----></div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, { name: "startDate", children, $$slots: { default: true } });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(` `);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-dueDate",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Fällig`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        Input($$renderer6, {
                          id: "global-create-dueDate",
                          type: "datetime-local",
                          value: field.state.value,
                          onblur: () => field.handleBlur(),
                          oninput: (e) => field.handleChange(e.currentTarget?.value ?? "")
                        });
                        $$renderer6.push(`<!----></div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, { name: "dueDate", children, $$slots: { default: true } });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(`</div> <div class="grid grid-cols-2 gap-4">`);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-category",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Priorität`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        $$renderer6.select(
                          {
                            id: "global-create-category",
                            class: selectClass,
                            value: field.state.value,
                            onblur: () => field.handleBlur(),
                            onchange: (e) => field.handleChange(e.currentTarget.value)
                          },
                          ($$renderer7) => {
                            $$renderer7.option({ value: "A" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(categoryLabels.A)}`);
                            });
                            $$renderer7.option({ value: "B" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(categoryLabels.B)}`);
                            });
                            $$renderer7.option({ value: "C" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(categoryLabels.C)}`);
                            });
                          }
                        );
                        $$renderer6.push(`</div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, { name: "category", children, $$slots: { default: true } });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(` `);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-status",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Status`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        $$renderer6.select(
                          {
                            id: "global-create-status",
                            class: selectClass,
                            value: field.state.value,
                            onblur: () => field.handleBlur(),
                            onchange: (e) => field.handleChange(e.currentTarget.value)
                          },
                          ($$renderer7) => {
                            $$renderer7.option({ value: "OPEN" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(statusLabels.OPEN)}`);
                            });
                            $$renderer7.option({ value: "IN_PROGRESS" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(statusLabels.IN_PROGRESS)}`);
                            });
                            $$renderer7.option({ value: "DONE" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(statusLabels.DONE)}`);
                            });
                            $$renderer7.option({ value: "CANCELLED" }, ($$renderer8) => {
                              $$renderer8.push(`${escape_html(statusLabels.CANCELLED)}`);
                            });
                          }
                        );
                        $$renderer6.push(`</div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, { name: "status", children, $$slots: { default: true } });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(`</div> <div class="grid grid-cols-2 gap-4">`);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-estimatedDuration",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Dauerschätzung (Min)`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        Input($$renderer6, {
                          id: "global-create-estimatedDuration",
                          type: "number",
                          min: "0",
                          step: "1",
                          placeholder: "z. B. 60",
                          value: field.state.value,
                          onblur: () => field.handleBlur(),
                          oninput: (e) => field.handleChange(e.currentTarget?.value ?? "")
                        });
                        $$renderer6.push(`<!----></div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, {
                          name: "estimatedDurationMinutes",
                          children,
                          $$slots: { default: true }
                        });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(` `);
                    {
                      let children = function($$renderer6, field) {
                        $$renderer6.push(`<div class="grid gap-2">`);
                        Label($$renderer6, {
                          for: "global-create-actualDuration",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<!---->Tatsächliche Dauer (Min)`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----> `);
                        Input($$renderer6, {
                          id: "global-create-actualDuration",
                          type: "number",
                          min: "0",
                          step: "1",
                          placeholder: "z. B. 45",
                          value: field.state.value,
                          onblur: () => field.handleBlur(),
                          oninput: (e) => field.handleChange(e.currentTarget?.value ?? "")
                        });
                        $$renderer6.push(`<!----></div>`);
                      };
                      if (form.Field) {
                        $$renderer5.push("<!--[-->");
                        form.Field($$renderer5, {
                          name: "actualDurationMinutes",
                          children,
                          $$slots: { default: true }
                        });
                        $$renderer5.push("<!--]-->");
                      } else {
                        $$renderer5.push("<!--[!-->");
                        $$renderer5.push("<!--]-->");
                      }
                    }
                    $$renderer5.push(`</div> <div class="border-border space-y-3 rounded-md border p-3"><div class="flex items-center gap-2"><input type="checkbox" id="recurring-checkbox"${attr("checked", isRecurring, true)} class="border-input h-4 w-4 rounded border"/> `);
                    Label($$renderer5, {
                      for: "recurring-checkbox",
                      class: "cursor-pointer font-medium",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->Wiederholen`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----></div> `);
                    if (isRecurring) {
                      $$renderer5.push("<!--[-->");
                      $$renderer5.push(`<div class="grid grid-cols-2 gap-3"><div class="grid gap-2">`);
                      Label($$renderer5, {
                        for: "recurring-frequency",
                        class: "text-sm",
                        children: ($$renderer6) => {
                          $$renderer6.push(`<!---->Frequenz`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push(`<!----> `);
                      $$renderer5.select(
                        {
                          id: "recurring-frequency",
                          class: selectClass,
                          value: recurringFrequency
                        },
                        ($$renderer6) => {
                          $$renderer6.option({ value: "daily" }, ($$renderer7) => {
                            $$renderer7.push(`Täglich`);
                          });
                          $$renderer6.option({ value: "weekly" }, ($$renderer7) => {
                            $$renderer7.push(`Wöchentlich`);
                          });
                          $$renderer6.option({ value: "monthly" }, ($$renderer7) => {
                            $$renderer7.push(`Monatlich`);
                          });
                        }
                      );
                      $$renderer5.push(`</div> <div class="grid gap-2">`);
                      Label($$renderer5, {
                        for: "recurring-occurrences",
                        class: "text-sm",
                        children: ($$renderer6) => {
                          $$renderer6.push(`<!---->Anzahl`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push(`<!----> `);
                      Input($$renderer5, {
                        id: "recurring-occurrences",
                        type: "number",
                        min: "1",
                        max: "52",
                        get value() {
                          return recurringOccurrences;
                        },
                        set value($$value) {
                          recurringOccurrences = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer5.push(`<!----></div></div>`);
                    } else {
                      $$renderer5.push("<!--[!-->");
                    }
                    $$renderer5.push(`<!--]--></div> `);
                    if (Dialog_footer) {
                      $$renderer5.push("<!--[-->");
                      Dialog_footer($$renderer5, {
                        class: "pt-4",
                        children: ($$renderer6) => {
                          {
                            let child = function($$renderer7, { props }) {
                              Button($$renderer7, spread_props([
                                props,
                                {
                                  variant: "outline",
                                  children: ($$renderer8) => {
                                    $$renderer8.push(`<!---->Abbrechen`);
                                  },
                                  $$slots: { default: true }
                                }
                              ]));
                            };
                            if (Dialog_close) {
                              $$renderer6.push("<!--[-->");
                              Dialog_close($$renderer6, { child, $$slots: { child: true } });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                          }
                          $$renderer6.push(` `);
                          {
                            let children = function($$renderer7, { canSubmit, isSubmitting }) {
                              Button($$renderer7, {
                                type: "submit",
                                disabled: !canSubmit || isSubmitting,
                                children: ($$renderer8) => {
                                  $$renderer8.push(`<!---->${escape_html(isSubmitting ? "Wird erstellt…" : "Erstellen")}`);
                                },
                                $$slots: { default: true }
                              });
                            };
                            if (form.Subscribe) {
                              $$renderer6.push("<!--[-->");
                              form.Subscribe($$renderer6, {
                                selector: (state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting }),
                                children,
                                $$slots: { default: true }
                              });
                              $$renderer6.push("<!--]-->");
                            } else {
                              $$renderer6.push("<!--[!-->");
                              $$renderer6.push("<!--]-->");
                            }
                          }
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push("<!--]-->");
                    } else {
                      $$renderer5.push("<!--[!-->");
                      $$renderer5.push("<!--]-->");
                    }
                    $$renderer5.push(`</form>`);
                  }
                  $$renderer5.push(`<!--]-->`);
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
function Toast_container($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const toasts = derived(() => store_get($$store_subs ??= {}, "$toastStore", toastStore));
    $$renderer2.push(`<div class="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-6"><!--[-->`);
    const each_array = ensure_array_like(toasts());
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let toast = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${stringify(toast.type === "success" ? "border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100" : toast.type === "error" ? "border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100" : "border-blue-500/50 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100")}`)}><p class="flex-1 text-sm font-medium">${escape_html(toast.message)}</p> `);
      if (toast.action) {
        $$renderer2.push("<!--[-->");
        Button($$renderer2, {
          variant: "ghost",
          size: "sm",
          class: "shrink-0",
          onclick: () => {
            toast.action?.onClick();
            toastStore.remove(toast.id);
          },
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(toast.action.label)}`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <button class="text-current shrink-0 opacity-70 transition-opacity hover:opacity-100" aria-label="Schließen">`);
      X($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----></button></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    useQueryClient();
    if (Sidebar_provider) {
      $$renderer2.push("<!--[-->");
      Sidebar_provider($$renderer2, {
        children: ($$renderer3) => {
          App_sidebar($$renderer3, {});
          $$renderer3.push(`<!----> `);
          Create_task_dialog($$renderer3);
          $$renderer3.push(`<!----> `);
          Toast_container($$renderer3);
          $$renderer3.push(`<!----> <main class="h-screen w-full overflow-x-hidden bg-background p-4 text-foreground"><img src="/background.png" alt="Venera" class="absolute top-0 left-0 h-full w-full object-cover opacity-30"/> `);
          children($$renderer3);
          $$renderer3.push(`<!----></main>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push("<!--]-->");
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push("<!--]-->");
    }
  });
}
export {
  _layout as default
};
