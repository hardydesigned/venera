import { writable } from 'svelte/store';
import type { Task } from './types';

export type TaskDialogState = 'create' | { mode: 'edit'; task: Task } | null;

function createCreateTaskDialogStore() {
	const { subscribe, set } = writable<TaskDialogState>(null);
	return {
		subscribe,
		open: () => set('create'),
		openForEdit: (task: Task) => set({ mode: 'edit', task }),
		close: () => set(null)
	};
}

export const createTaskDialogStore = createCreateTaskDialogStore();
