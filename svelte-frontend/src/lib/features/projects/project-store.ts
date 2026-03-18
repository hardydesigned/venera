import { writable } from 'svelte/store';
import {
	getActiveScopeKey,
	teamScopeStore,
	type TeamScope
} from '$lib/features/teams/team-context-store';
import {
	fetchProjectWorkspace,
	saveProjectWorkspace,
	type ProjectWorkspacePayload
} from '$lib/api/project-workspace';

const BASE_STORAGE_KEY = 'venera_projects';

export interface ProjectTaskCard {
	id: string;
	title: string;
	description: string;
	done: boolean;
	parentId: string | null;
	order: number;
	startDate: string;
	dueDate: string;
}

export interface ProjectList {
	id: string;
	name: string;
	cards: ProjectTaskCard[];
}

export interface ProjectFolder {
	id: string;
	name: string;
	order: number;
}

export interface Project {
	id: string;
	name: string;
	description: string;
	color: string;
	folderId: string | null;
	lists: ProjectList[];
}

interface ProjectState {
	projects: Project[];
	folders: ProjectFolder[];
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

function normalizeCard(input: unknown, index: number): ProjectTaskCard {
	const card = (input ?? {}) as Partial<ProjectTaskCard> & {
		description?: unknown;
		parentId?: unknown;
		order?: unknown;
		startDate?: unknown;
		dueDate?: unknown;
	};

	const parentId =
		typeof card.parentId === 'string' && card.parentId.trim().length > 0 ? card.parentId : null;

	return {
		id: typeof card.id === 'string' && card.id.trim() ? card.id : uid(),
		title: typeof card.title === 'string' ? card.title : '',
		description: typeof card.description === 'string' ? card.description : '',
		done: Boolean(card.done),
		parentId,
		order: typeof card.order === 'number' && Number.isFinite(card.order) ? card.order : index,
		startDate: typeof card.startDate === 'string' ? card.startDate : '',
		dueDate: typeof card.dueDate === 'string' ? card.dueDate : ''
	};
}

function normalizeList(input: unknown): ProjectList {
	const list = (input ?? {}) as Partial<ProjectList> & { cards?: unknown[] };
	const rawCards = Array.isArray(list.cards) ? list.cards : [];
	const cards = rawCards.map((card, index) => normalizeCard(card, index));
	return {
		id: typeof list.id === 'string' && list.id.trim() ? list.id : uid(),
		name: typeof list.name === 'string' && list.name.trim() ? list.name : 'Liste',
		cards: cards.sort((a, b) => a.order - b.order).map((card, index) => ({ ...card, order: index }))
	};
}

function normalizeProject(input: unknown): Project {
	const project = (input ?? {}) as Partial<Project> & { lists?: unknown[] };
	const rawLists = Array.isArray(project.lists) ? project.lists : [];

	return {
		id: typeof project.id === 'string' && project.id.trim() ? project.id : uid(),
		name: typeof project.name === 'string' ? project.name : 'Projekt',
		description: typeof project.description === 'string' ? project.description : '',
		color: typeof project.color === 'string' && project.color.trim() ? project.color : '#2563eb',
		folderId:
			typeof project.folderId === 'string' && project.folderId.trim().length > 0
				? project.folderId
				: null,
		lists: rawLists.length > 0 ? rawLists.map(normalizeList) : defaultLists()
	};
}

function normalizeFolder(input: unknown, index: number): ProjectFolder {
	const folder = (input ?? {}) as Partial<ProjectFolder>;
	return {
		id: typeof folder.id === 'string' && folder.id.trim() ? folder.id : uid(),
		name: typeof folder.name === 'string' && folder.name.trim() ? folder.name : 'Ordner',
		order: typeof folder.order === 'number' && Number.isFinite(folder.order) ? folder.order : index
	};
}

function storageKeyForScope(scopeKey: string): string {
	return `${BASE_STORAGE_KEY}:${scopeKey}`;
}

function toScopeKey(scope: TeamScope): string {
	return scope.type === 'team' ? `team:${scope.teamId}` : 'personal';
}

function parseState(raw: string | null): ProjectState {
	if (!raw) return { projects: [], folders: [] };
	try {
		const parsed = JSON.parse(raw) as { projects?: unknown[]; folders?: unknown[] };
		const folders = Array.isArray(parsed.folders)
			? parsed.folders.map((folder, index) => normalizeFolder(folder, index))
			: [];
		const folderIds = new Set(folders.map((folder) => folder.id));
		if (!Array.isArray(parsed.projects)) return { projects: [], folders };
		return {
			projects: parsed.projects.map(normalizeProject).map((project) => ({
				...project,
				folderId: project.folderId && folderIds.has(project.folderId) ? project.folderId : null
			})),
			folders
		};
	} catch {
		return { projects: [], folders: [] };
	}
}

function normalizeState(payload: ProjectWorkspacePayload | null | undefined): ProjectState {
	if (!payload) return { projects: [], folders: [] };
	return parseState(JSON.stringify(payload));
}

function toPayload(state: ProjectState): ProjectWorkspacePayload {
	return {
		projects: state.projects,
		folders: state.folders
	};
}

function loadState(scopeKey: string): ProjectState {
	if (typeof window === 'undefined') return { projects: [], folders: [] };
	const scopedRaw = localStorage.getItem(storageKeyForScope(scopeKey));
	if (scopedRaw) {
		return parseState(scopedRaw);
	}

	// Migration from legacy global key to personal scope
	if (scopeKey === 'personal') {
		const legacyRaw = localStorage.getItem(BASE_STORAGE_KEY);
		if (legacyRaw) {
			const legacyState = parseState(legacyRaw);
			localStorage.setItem(storageKeyForScope(scopeKey), JSON.stringify(legacyState));
			return legacyState;
		}
	}

	return { projects: [], folders: [] };
}

function persistState(scopeKey: string, state: ProjectState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(storageKeyForScope(scopeKey), JSON.stringify(state));
	} catch {
		// ignore
	}
}

function createProjectStore() {
	let activeScopeKey = getActiveScopeKey();
	const store = writable<ProjectState>(loadState(activeScopeKey));
	let isHydratingFromServer = false;
	let isRemoteSyncReady = false;
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let hydrationToken = 0;

	const scheduleRemoteSave = (scopeKey: string, state: ProjectState) => {
		if (typeof window === 'undefined') return;
		if (saveTimer) {
			clearTimeout(saveTimer);
		}
		const payload = toPayload(state);
		saveTimer = setTimeout(async () => {
			if (scopeKey !== activeScopeKey) return;
			try {
				await saveProjectWorkspace(payload);
			} catch {
				// keep local state when backend sync fails
			}
		}, 350);
	};

	const hydrateFromServer = async (scopeKey: string) => {
		if (typeof window === 'undefined') return;
		const token = ++hydrationToken;
		try {
			const payload = await fetchProjectWorkspace();
			if (token !== hydrationToken || scopeKey !== activeScopeKey) {
				return;
			}
			const normalized = normalizeState(payload);
			isHydratingFromServer = true;
			store.set(normalized);
			isHydratingFromServer = false;
			persistState(scopeKey, normalized);
		} catch {
			// keep cached local state when backend is unavailable
		} finally {
			if (token === hydrationToken && scopeKey === activeScopeKey) {
				isRemoteSyncReady = true;
			}
		}
	};

	store.subscribe((state) => {
		persistState(activeScopeKey, state);
		if (!isHydratingFromServer && isRemoteSyncReady) {
			scheduleRemoteSave(activeScopeKey, state);
		}
	});

	if (typeof window !== 'undefined') {
		isRemoteSyncReady = false;
		void hydrateFromServer(activeScopeKey);
		teamScopeStore.subscribe((scope) => {
			const nextScopeKey = toScopeKey(scope);
			if (nextScopeKey === activeScopeKey) return;
			activeScopeKey = nextScopeKey;
			isRemoteSyncReady = false;
			if (saveTimer) {
				clearTimeout(saveTimer);
				saveTimer = null;
			}
			isHydratingFromServer = true;
			store.set(loadState(activeScopeKey));
			isHydratingFromServer = false;
			void hydrateFromServer(activeScopeKey);
		});
	}

	return {
		subscribe: store.subscribe,
		createProject(input: {
			name: string;
			description: string;
			color: string;
			folderId?: string | null;
		}) {
			store.update((state) => ({
				...state,
				projects: [
					...state.projects,
					{
						id: uid(),
						name: input.name.trim(),
						description: input.description.trim(),
						color: input.color,
						folderId:
							input.folderId && state.folders.some((folder) => folder.id === input.folderId)
								? input.folderId
								: null,
						lists: defaultLists()
					}
				]
			}));
		},
		updateProject(
			projectId: string,
			input: {
				name?: string;
				description?: string;
				color?: string;
				folderId?: string | null;
			}
		) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) => {
					if (project.id !== projectId) return project;
					const nextFolderId =
						input.folderId === undefined
							? project.folderId
							: input.folderId && state.folders.some((folder) => folder.id === input.folderId)
								? input.folderId
								: null;
					return {
						...project,
						name: input.name !== undefined ? input.name.trim() || project.name : project.name,
						description:
							input.description !== undefined ? input.description.trim() : project.description,
						color: input.color ?? project.color,
						folderId: nextFolderId
					};
				})
			}));
		},
		createFolder(name: string): string | null {
			const trimmed = name.trim();
			if (!trimmed) return null;
			const folderId = uid();
			store.update((state) => ({
				...state,
				folders: [...state.folders, { id: folderId, name: trimmed, order: state.folders.length }]
			}));
			return folderId;
		},
		deleteFolder(folderId: string) {
			store.update((state) => ({
				...state,
				folders: state.folders.filter((folder) => folder.id !== folderId),
				projects: state.projects.map((project) =>
					project.folderId === folderId ? { ...project, folderId: null } : project
				)
			}));
		},
		moveProjectToFolder(projectId: string, folderId: string | null) {
			store.update((state) => ({
				...state,
				projects: state.projects.map((project) =>
					project.id === projectId
						? {
								...project,
								folderId:
									folderId && state.folders.some((folder) => folder.id === folderId)
										? folderId
										: null
							}
						: project
				)
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
		addCard(projectId: string, listId: string, title: string): string | null {
			const trimmed = title.trim();
			if (!trimmed) return null;
			const cardId = uid();
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
												cards: [
													...list.cards,
													{
														id: cardId,
														title: trimmed,
														description: '',
														done: false,
														parentId: null,
														order: list.cards.length,
														startDate: '',
														dueDate: ''
													}
												]
											}
										: list
								)
							}
						: project
				)
			}));
			return cardId;
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
			input: {
				title?: string;
				description?: string;
				done?: boolean;
				parentId?: string | null;
				order?: number;
				startDate?: string;
				dueDate?: string;
			}
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
																description: input.description?.trim() ?? card.description,
																done: input.done ?? card.done,
																parentId:
																	input.parentId !== undefined ? input.parentId : card.parentId,
																order: input.order ?? card.order,
																startDate: input.startDate ?? card.startDate,
																dueDate: input.dueDate ?? card.dueDate
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
							list.id === toListId
								? {
										...list,
										cards: [
											...list.cards,
											{
												...movedCard!,
												parentId: null,
												order: list.cards.length
											}
										]
									}
								: list
						)
					};
				});

				return { ...state, projects };
			});
		},
		replaceListCards(projectId: string, listId: string, cards: ProjectTaskCard[]) {
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
												cards: cards.map((card, index) => ({
													...card,
													order: index
												}))
											}
										: list
								)
							}
						: project
				)
			}));
		}
	};
}

export const projectStore = createProjectStore();
