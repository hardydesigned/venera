import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	action?: {
		label: string;
		onClick: () => void;
	};
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	let idCounter = 0;

	function add(toast: Omit<Toast, 'id'>): string {
		const id = `toast-${++idCounter}`;
		const newToast: Toast = { ...toast, id };

		update((toasts) => [...toasts, newToast]);

		// Auto-dismiss after duration (default 5 seconds)
		const duration = toast.duration ?? 5000;
		setTimeout(() => {
			remove(id);
		}, duration);

		return id;
	}

	function remove(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string, action?: Toast['action']) => add({ message, type: 'success', action }),
		error: (message: string, action?: Toast['action']) => add({ message, type: 'error', action }),
		info: (message: string, action?: Toast['action']) => add({ message, type: 'info', action }),
		remove
	};
}

export const toastStore = createToastStore();
