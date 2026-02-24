import { writable } from 'svelte/store';

const STORAGE_KEY = 'venera_projects';

export interface ProjectTaskCard {
	id: string;
	title: string;
	done: boolean;
}

export interface ProjectList {
	id: string;
	name: string;
	cards: ProjectTaskCard[];
}

export interface Project {
	id: string;
	name: string;
	description: string;
	color: string;
	lists: ProjectList[];
}

interface ProjectState {
	projects: Project[];
}

function uid(): string {
	return (
		Math.random().toString(36).slice(2, 10) +
		Math.random().toString(36).slice(2, 6) +
		Date.now().toString(36).slice(-4)
	);
}

function defaultLists(): ProjectList[] {
	return [
		{ id: uid(), name: 'Backlog', cards: [] },
		{ id: uid(), name: 'In Arbeit', cards: [] },
		{ id: uid(), name: 'Erledigt', cards: [] }
	];
}

function loadState(): ProjectState {
	if (typeof window === 'undefined') return { projects: [] };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { projects: [] };
		const parsed = JSON.parse(raw) as ProjectState;
		if (!Array.isArray(parsed.projects)) return { projects: [] };
		return parsed;
	} catch {
		return { projects: [] };
	}
}

function persistState(state: ProjectState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

function createProjectStore() {
	const store = writable<ProjectState>(loadState());

	store.subscribe((state) => persistState(state));

	return {
		subscribe: store.subscribe,
		createProject(input: { name: string; description: string; color: string }) {
			store.update((state) => ({
				...state,
				projects: [
					...state.projects,
					{
						id: uid(),
						name: input.name.trim(),
						description: input.description.trim(),
						color: input.color,
						lists: defaultLists()
					}
				]
			}));
		},
		addList(projectId: string, listName: string) {
			const trimmed = listName.trim();
			if (!trimmed) return;
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								lists: [...project.lists, { id: uid(), name: trimmed, cards: [] }]
							}
						: project
				)
			}));
		},
		deleteList(projectId: string, listId: string) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) => {
					if (project.id !== projectId) return project;
					if (project.lists.length <= 1) return project;
					return {
						...project,
						lists: project.lists.filter((list) => list.id !== listId)
					};
				})
			}));
		},
		insertList(projectId: string, list: ProjectList, index: number) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) => {
					if (project.id !== projectId) return project;
					const nextLists = [...project.lists];
					const safeIndex = Math.max(0, Math.min(index, nextLists.length));
					nextLists.splice(safeIndex, 0, list);
					return { ...project, lists: nextLists };
				})
			}));
		},
		addCard(projectId: string, listId: string, title: string) {
			const trimmed = title.trim();
			if (!trimmed) return;
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								lists: project.lists.map((list) =>
									list.id === listId
										? {
												...list,
												cards: [...list.cards, { id: uid(), title: trimmed, done: false }]
											}
										: list
								)
							}
						: project
				)
			}));
		},
		deleteCardFromList(projectId: string, listId: string, cardId: string) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								lists: project.lists.map((list) =>
									list.id === listId
										? { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
										: list
								)
							}
						: project
				)
			}));
		},
		insertCard(projectId: string, listId: string, card: ProjectTaskCard, index: number) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								lists: project.lists.map((list) => {
									if (list.id !== listId) return list;
									const nextCards = [...list.cards];
									const safeIndex = Math.max(0, Math.min(index, nextCards.length));
									nextCards.splice(safeIndex, 0, card);
									return { ...list, cards: nextCards };
								})
							}
						: project
				)
			}));
		},
		toggleCardDone(projectId: string, listId: string, cardId: string) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								lists: project.lists.map((list) =>
									list.id === listId
										? {
												...list,
												cards: list.cards.map((card) =>
													card.id === cardId ? { ...card, done: !card.done } : card
												)
											}
										: list
								)
							}
						: project
				)
			}));
		},
		updateCard(
			projectId: string,
			listId: string,
			cardId: string,
			input: { title?: string; done?: boolean }
		) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								lists: project.lists.map((list) =>
									list.id === listId
										? {
												...list,
												cards: list.cards.map((card) =>
													card.id === cardId
														? {
																...card,
																title: input.title?.trim() || card.title,
																done: input.done ?? card.done
															}
														: card
												)
											}
										: list
								)
							}
						: project
				)
			}));
		},
		moveCard(projectId: string, fromListId: string, toListId: string, cardId: string) {
			if (fromListId === toListId) return;
			store.update((state) => {
				const projects = state.projects.map((project) => {
					if (project.id !== projectId) return project;

					let movedCard: ProjectTaskCard | null = null;
					const listsWithoutCard = project.lists.map((list) => {
						if (list.id !== fromListId) return list;
						const remainingCards = list.cards.filter((card) => {
							if (card.id === cardId) {
								movedCard = card;
								return false;
							}
							return true;
						});
						return { ...list, cards: remainingCards };
					});

					if (!movedCard) return project;

					return {
						...project,
						lists: listsWithoutCard.map((list) =>
							list.id === toListId ? { ...list, cards: [...list.cards, movedCard!] } : list
						)
					};
				});

				return { ...state, projects };
			});
		}
	};
}

export const projectStore = createProjectStore();
