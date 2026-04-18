import { w as writable } from "./index2.js";
function createToastStore() {
  const { subscribe, update } = writable([]);
  let idCounter = 0;
  function add(toast) {
    const id = `toast-${++idCounter}`;
    const newToast = { ...toast, id };
    update((toasts) => [...toasts, newToast]);
    const duration = toast.duration ?? 5e3;
    setTimeout(() => {
      remove(id);
    }, duration);
    return id;
  }
  function remove(id) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }
  return {
    subscribe,
    success: (message, action) => add({ message, type: "success", action }),
    error: (message, action) => add({ message, type: "error", action }),
    info: (message, action) => add({ message, type: "info", action }),
    remove
  };
}
const toastStore = createToastStore();
export {
  toastStore as t
};
