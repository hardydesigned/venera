import { writable } from 'svelte/store';
import type { Task } from './types';

export type TaskDialogState =
	| 'create'
	| { mode: 'create'; date: string }
	| { mode: 'edit'; task: Task }
	| null;

function createCreateTaskDialogStore() {
	const { subscribe, set } = writable<TaskDialogState>(null);
	return {
		subscribe,
		open: (date?: string) => set(date ? { mode: 'create', date } : 'create'),
		openForEdit: (task: Task) => set({ mode: 'edit', task }),
		close: () => set(null)
	};
}

export const createTaskDialogStore = createCreateTaskDialogStore();
