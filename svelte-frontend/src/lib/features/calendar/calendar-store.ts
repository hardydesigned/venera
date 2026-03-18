import { writable } from 'svelte/store';
import type { TaskPriorityCategory, TaskStatus } from '$lib/features/tasks/types';
import { getActiveScopeKey, teamScopeStore } from '$lib/features/teams/team-context-store';

export type CalendarView = 'month' | 'week' | 'day' | 'year';

export interface CalendarFilters {
	priorities: Set<TaskPriorityCategory>;
	statuses: Set<TaskStatus>;
	showCompleted: boolean;
}

export interface CalendarState {
	view: CalendarView;
	currentDate: Date;
	filters: CalendarFilters;
	searchQuery: string;
}

const BASE_STORAGE_KEY = 'venera_calendar_view';

function storageKeyForScope(scopeKey: string): string {
	return `${BASE_STORAGE_KEY}:${scopeKey}`;
}

function loadSavedView(scopeKey: string): CalendarView {
	if (typeof window === 'undefined') return 'month';
	try {
		const saved = localStorage.getItem(storageKeyForScope(scopeKey));
		if (saved && ['month', 'week', 'day', 'year'].includes(saved)) {
			return saved as CalendarView;
		}
	} catch (e) {
		console.error('Failed to load saved view', e);
	}
	return 'month';
}

const initialState: CalendarState = {
	view: loadSavedView(getActiveScopeKey()),
	currentDate: new Date(),
	filters: {
		priorities: new Set<TaskPriorityCategory>(['A', 'B', 'C']),
		statuses: new Set<TaskStatus>(['OPEN', 'IN_PROGRESS']),
		showCompleted: false
	},
	searchQuery: ''
};

function createCalendarStore() {
	const { subscribe, set, update } = writable<CalendarState>(initialState);

	if (typeof window !== 'undefined') {
		teamScopeStore.subscribe(() => {
			const nextView = loadSavedView(getActiveScopeKey());
			update((state) => ({ ...state, view: nextView }));
		});
	}

	return {
		subscribe,
		setView: (view: CalendarView) => {
			if (typeof window !== 'undefined') {
				try {
					localStorage.setItem(storageKeyForScope(getActiveScopeKey()), view);
				} catch (e) {
					console.error('Failed to save view', e);
				}
			}
			update((state) => ({ ...state, view }));
		},
		setCurrentDate: (date: Date) => update((state) => ({ ...state, currentDate: date })),
		goToToday: () => update((state) => ({ ...state, currentDate: new Date() })),
		nextPeriod: () =>
			update((state) => {
				const newDate = new Date(state.currentDate);
				switch (state.view) {
					case 'day':
						newDate.setDate(newDate.getDate() + 1);
						break;
					case 'week':
						newDate.setDate(newDate.getDate() + 7);
						break;
					case 'month':
						newDate.setMonth(newDate.getMonth() + 1);
						break;
					case 'year':
						newDate.setFullYear(newDate.getFullYear() + 1);
						break;
				}
				return { ...state, currentDate: newDate };
			}),
		previousPeriod: () =>
			update((state) => {
				const newDate = new Date(state.currentDate);
				switch (state.view) {
					case 'day':
						newDate.setDate(newDate.getDate() - 1);
						break;
					case 'week':
						newDate.setDate(newDate.getDate() - 7);
						break;
					case 'month':
						newDate.setMonth(newDate.getMonth() - 1);
						break;
					case 'year':
						newDate.setFullYear(newDate.getFullYear() - 1);
						break;
				}
				return { ...state, currentDate: newDate };
			}),
		togglePriority: (priority: TaskPriorityCategory) =>
			update((state) => {
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
		toggleStatus: (status: TaskStatus) =>
			update((state) => {
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
		toggleShowCompleted: () =>
			update((state) => {
				const newShowCompleted = !state.filters.showCompleted;
				const newStatuses = new Set(state.filters.statuses);

				if (newShowCompleted) {
					// Add DONE and CANCELLED to statuses
					newStatuses.add('DONE');
					newStatuses.add('CANCELLED');
				} else {
					// Remove DONE and CANCELLED from statuses
					newStatuses.delete('DONE');
					newStatuses.delete('CANCELLED');
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
		setSearchQuery: (query: string) => update((state) => ({ ...state, searchQuery: query })),
		reset: () =>
			set({
				...initialState,
				view: loadSavedView(getActiveScopeKey()),
				currentDate: new Date()
			})
	};
}

export const calendarStore = createCalendarStore();
