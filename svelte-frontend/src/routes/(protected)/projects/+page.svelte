<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		projectStore,
		type ProjectTaskCard,
		type ProjectList
	} from '$lib/features/projects/project-store';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Circle, CircleCheckBig, Trash2 } from '@lucide/svelte';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import type { Task } from '$lib/features/tasks/types';
	import { toastStore } from '$lib/stores/toast-store';
	import ProjectGanttView from '$lib/features/projects/project-gantt-view.svelte';

	type ViewMode = 'list' | 'board' | 'gantt';
	const VIEW_COOKIE_NAME = 'venera_project_views';
	const VIEW_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

	const projectState = $derived($projectStore);
	const projects = $derived(projectState.projects);

	const selectedProjectId = $derived(
		page.url.searchParams.get('project') ?? projects[0]?.id ?? null
	);
	const selectedProject = $derived(
		projects.find((project) => project.id === selectedProjectId) ?? null
	);

	let viewMode = $state<ViewMode>('board');
	let newListName = $state('');
	let newCardTitleByList = $state<Record<string, string>>({});
	let savedViewByProject = $state<Record<string, ViewMode>>({});
	let viewPrefsReady = $state(false);
	let activeProjectForView = $state<string | null>(null);

	type CardDragPayload = {
		projectId: string;
		fromListId: string;
		cardId: string;
	};

	let draggingCard: CardDragPayload | null = $state(null);
	let suppressCardOpenUntil = $state(0);

	function isViewMode(value: unknown): value is ViewMode {
		return value === 'list' || value === 'board' || value === 'gantt';
	}

	function readCookie(name: string): string | null {
		if (typeof document === 'undefined') return null;
		const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
		return match ? decodeURIComponent(match[1]) : null;
	}

	function loadViewPrefsFromCookie(): Record<string, ViewMode> {
		const raw = readCookie(VIEW_COOKIE_NAME);
		if (!raw) return {};
		try {
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			const next: Record<string, ViewMode> = {};
			for (const [projectId, mode] of Object.entries(parsed)) {
				if (isViewMode(mode)) {
					next[projectId] = mode;
				}
			}
			return next;
		} catch {
			return {};
		}
	}

	function persistViewPrefsToCookie(prefs: Record<string, ViewMode>) {
		if (typeof document === 'undefined') return;
		document.cookie = `${VIEW_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}; Max-Age=${VIEW_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
	}

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
		if (!viewPrefsReady || !selectedProjectId) return;
		const nextPrefs = { ...savedViewByProject, [selectedProjectId]: mode };
		savedViewByProject = nextPrefs;
		persistViewPrefsToCookie(nextPrefs);
	}

	function addList() {
		if (!selectedProject) return;
		projectStore.addList(selectedProject.id, newListName);
		newListName = '';
	}

	async function addCard(listId: string) {
		if (!selectedProject) return;
		const title = (newCardTitleByList[listId] ?? '').trim();
		if (!title) return;
		newCardTitleByList = { ...newCardTitleByList, [listId]: '' };
		await projectStore.addCard(selectedProject.id, listId, title);
	}

	function updateCardInput(listId: string, value: string) {
		newCardTitleByList = { ...newCardTitleByList, [listId]: value };
	}

	function handleListInputKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		addList();
	}

	function handleCardInputKeydown(event: KeyboardEvent, listId: string) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		addCard(listId);
	}

	function handleCardDragStart(
		projectId: string,
		fromListId: string,
		cardId: string,
		e: DragEvent
	) {
		draggingCard = { projectId, fromListId, cardId };
		e.dataTransfer?.setData('application/json', JSON.stringify(draggingCard));
		e.dataTransfer!.effectAllowed = 'move';
		suppressCardOpenUntil = Date.now() + 250;
	}

	function handleCardDragEnd() {
		draggingCard = null;
		suppressCardOpenUntil = Date.now() + 250;
	}

	function handleListDrop(projectId: string, toListId: string, e: DragEvent) {
		e.preventDefault();
		const raw = e.dataTransfer?.getData('application/json');
		const payload = raw ? (JSON.parse(raw) as CardDragPayload) : draggingCard;
		if (!payload) return;
		if (payload.projectId !== projectId) return;
		projectStore.moveCard(projectId, payload.fromListId, toListId, payload.cardId);
		draggingCard = null;
	}

	function handleListDragOver(e: DragEvent) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
	}

	function deleteListWithUndo(listId: string) {
		if (!selectedProject) return;
		if (selectedProject.lists.length <= 1) return;

		const listIndex = selectedProject.lists.findIndex((list) => list.id === listId);
		const list = selectedProject.lists[listIndex];
		if (!list) return;

		projectStore.deleteList(selectedProject.id, listId);
		toastStore.success('Liste gelöscht', {
			label: 'Rückgängig machen',
			onClick: () => {
				projectStore.insertList(selectedProject.id, list, listIndex);
			}
		});
	}

	function findCardById(cardId: string): { list: ProjectList; card: ProjectTaskCard } | null {
		const project = selectedProject;
		if (!project) return null;
		for (const list of project.lists) {
			const existing = list.cards.find((card) => card.id === cardId);
			if (existing) {
				return { list, card: existing };
			}
		}
		return null;
	}

	import type { TaskStatus } from '$lib/features/projects/project-store';

	function updateProjectCard(
		cardId: string,
		input: {
			title: string;
			description: string;
			status: TaskStatus;
			startDate: string | null;
			dueDate: string | null;
		}
	) {
		const project = selectedProject;
		const found = findCardById(cardId);
		if (!project || !found) return;

		const normalizeToDayStart = (value: string | null): string | null => {
			if (!value) return null;
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return null;
			const pad = (n: number) => String(n).padStart(2, '0');
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`;
		};

		projectStore.updateCard(project.id, found.list.id, cardId, {
			title: input.title,
			description: input.description,
			status: input.status,
			startDate: normalizeToDayStart(input.startDate),
			dueDate: normalizeToDayStart(input.dueDate)
		});
	}

	function deleteProjectCardWithUndo(cardId: string) {
		const project = selectedProject;
		if (!project) return;
		for (const list of project.lists) {
			const cardIndex = list.cards.findIndex((card) => card.id === cardId);
			if (cardIndex >= 0) {
				const cardSnapshot = list.cards[cardIndex];
				projectStore.deleteCardFromList(project.id, list.id, cardId);
				toastStore.success('Aufgabe gelöscht', {
					label: 'Rückgängig machen',
					onClick: () => {
						projectStore.insertCard(project.id, list.id, cardSnapshot, cardIndex);
					}
				});
				return;
			}
		}
	}

	function openCardEditor(_listId: string, card: ProjectTaskCard) {
		if (Date.now() < suppressCardOpenUntil) return;

		const today = new Date().toISOString().slice(0, 10);
		const pseudoTask: Task = {
			id: `project-card-${card.id}`,
			title: card.title,
			description: card.description ?? '',
			startDate: card.startDate ?? `${today}T00:00:00`,
			dueDate: card.dueDate ?? `${today}T00:00:00`,
			category: card.category,
			status: card.status,
			estimatedDurationMinutes: null,
			actualDurationMinutes: null
		};

		createTaskDialogStore.openForEdit(pseudoTask);
	}

	async function createCardFromGantt(preferredListId: string | null, title: string): Promise<boolean> {
		const project = selectedProject;
		if (!project) return false;
		const fallbackListId = project.lists[0]?.id;
		const targetListId = preferredListId ?? fallbackListId;
		if (!targetListId) return false;
		const createdCardId = await projectStore.addCard(project.id, targetListId, title);
		return Boolean(createdCardId);
	}

	$effect(() => {
		if (!viewPrefsReady) return;
		const projectId = selectedProjectId;
		if (!projectId || activeProjectForView === projectId) return;
		activeProjectForView = projectId;
		viewMode = savedViewByProject[projectId] ?? 'board';
	});

	onMount(() => {
		savedViewByProject = loadViewPrefsFromCookie();
		viewPrefsReady = true;

		(window as any).__projectCardDialogBridge = {
			updateCard: (
				cardId: string,
				input: {
					title: string;
					description: string;
					status: TaskStatus;
					startDate: string | null;
					dueDate: string | null;
				}
			) => {
				updateProjectCard(cardId, input);
			},
			deleteCard: (cardId: string) => {
				deleteProjectCardWithUndo(cardId);
			}
		};

		return () => {
			delete (window as any).__projectCardDialogBridge;
		};
	});
</script>

<svelte:head>
	<title>Projekte | Venera</title>
</svelte:head>

<section class="relative z-10 flex h-full flex-col gap-4">
	<header class="flex flex-wrap items-center justify-between gap-3">
		<div class="space-y-1">
			<h2 class="text-2xl font-semibold">{selectedProject?.name ?? 'Projekte'}</h2>
			{#if selectedProject}
				<p class="text-sm text-muted-foreground">
					{selectedProject.description || 'Keine Beschreibung'}
				</p>
			{:else}
				<p class="text-sm text-muted-foreground">Erstelle in der Sidebar dein erstes Projekt.</p>
			{/if}
		</div>
		<div class="flex flex-wrap items-center justify-end gap-2">
			<Button
				variant={viewMode === 'list' ? 'default' : 'outline'}
				size="sm"
				onclick={() => setViewMode('list')}
			>
				Liste
			</Button>
			<Button
				variant={viewMode === 'board' ? 'default' : 'outline'}
				size="sm"
				onclick={() => setViewMode('board')}
			>
				Board
			</Button>
			<Button
				variant={viewMode === 'gantt' ? 'default' : 'outline'}
				size="sm"
				onclick={() => setViewMode('gantt')}
			>
				Gantt
			</Button>
		</div>
	</header>

	{#if !selectedProject}
		<div class="rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
			Kein Projekt ausgewählt.
		</div>
	{:else if viewMode === 'gantt'}
		<ProjectGanttView
			projectId={selectedProject.id}
			lists={selectedProject.lists}
			onOpenCard={openCardEditor}
			onToggleDone={(listId: string, cardId: string) =>
				projectStore.toggleCardDone(selectedProject.id, listId, cardId)}
			onCreateCard={createCardFromGantt}
		/>
	{:else if viewMode === 'board'}
		<div class="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden pb-2">
			<div class="flex h-full items-start gap-3 pr-4">
				{#each selectedProject.lists as list (list.id)}
					<div
						role="region"
						aria-label="Drop-Zone für Liste {list.name}"
						class="flex h-full max-h-full w-[300px] shrink-0 flex-col rounded-lg border border-border bg-card/50"
						ondragover={handleListDragOver}
						ondrop={(e) => handleListDrop(selectedProject.id, list.id, e)}
					>
						<div class="flex items-center justify-between border-b border-border px-3 py-2">
							<h3 class="font-medium">{list.name}</h3>
							<div class="flex items-center gap-2">
								<span class="text-xs text-muted-foreground">{list.cards.length}</span>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground"
									disabled={selectedProject.lists.length <= 1}
									onclick={() => deleteListWithUndo(list.id)}
									aria-label={`Liste ${list.name} löschen`}
								>
									<Trash2 class="size-4" />
								</button>
							</div>
						</div>
						<div class="flex flex-1 flex-col gap-2 overflow-auto p-3">
							{#each list.cards as card (card.id)}
								<div
									draggable={true}
									aria-label="Aufgabe {card.title}"
									ondragstart={(e) => handleCardDragStart(selectedProject.id, list.id, card.id, e)}
									ondragend={handleCardDragEnd}
									onclick={() => openCardEditor(list.id, card)}
									class="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
								>
									<button
										type="button"
										class="text-muted-foreground hover:text-foreground"
										onclick={(e) => {
											e.stopPropagation();
											projectStore.toggleCardDone(selectedProject.id, list.id, card.id);
										}}
									>
										{#if card.status === 'DONE'}
											<CircleCheckBig class="size-4" />
										{:else}
											<Circle class="size-4" />
										{/if}
									</button>
									<span class="text-sm {card.status === 'DONE' ? 'text-muted-foreground line-through' : ''}"
										>{card.title}</span
									>
								</div>
							{/each}
							<div class="mt-1 flex gap-2">
								<input
									type="text"
									value={newCardTitleByList[list.id] ?? ''}
									oninput={(e) =>
										updateCardInput(list.id, (e.currentTarget as HTMLInputElement).value)}
									onkeydown={(e) => handleCardInputKeydown(e, list.id)}
									placeholder="Aufgabe hinzufügen"
									class="h-8 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								/>
								<Button size="sm" variant="outline" onclick={() => addCard(list.id)}>+</Button>
							</div>
						</div>
					</div>
				{/each}

				<div
					class="flex h-fit w-[300px] shrink-0 flex-col rounded-lg border border-dashed border-border bg-card/30 py-3"
				>
					<h3 class="mb-2 border-b border-border px-3 pb-2 text-sm font-medium">Neue Liste</h3>
					<div class="mt-2 flex gap-2 px-3">
						<input
							type="text"
							bind:value={newListName}
							onkeydown={handleListInputKeydown}
							placeholder="Listenname"
							class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						/>
						<Button size="sm" onclick={addList}>+</Button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="min-h-0 flex-1 space-y-3 overflow-auto pb-2">
			{#each selectedProject.lists as list (list.id)}
				<div class="rounded-lg border border-border bg-card/50 p-3">
					<div class="mb-2 flex items-center justify-between">
						<h3 class="font-medium">{list.name}</h3>
						<div class="flex items-center gap-2">
							<span class="text-xs text-muted-foreground">{list.cards.length}</span>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground"
								disabled={selectedProject.lists.length <= 1}
								onclick={() => deleteListWithUndo(list.id)}
								aria-label={`Liste ${list.name} löschen`}
							>
								<Trash2 class="size-4" />
							</button>
						</div>
					</div>
					<ul class="space-y-2">
						{#each list.cards as card (card.id)}
							<li
								class="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
								onclick={() => openCardEditor(list.id, card)}
							>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground"
									onclick={(e) => {
										e.stopPropagation();
										projectStore.toggleCardDone(selectedProject.id, list.id, card.id);
									}}
								>
									{#if card.status === 'DONE'}
										<CircleCheckBig class="size-4" />
									{:else}
										<Circle class="size-4" />
									{/if}
								</button>
								<span class="text-sm {card.status === 'DONE' ? 'text-muted-foreground line-through' : ''}"
									>{card.title}</span
								>
							</li>
						{/each}
					</ul>
					<div class="mt-3 flex gap-2">
						<input
							type="text"
							value={newCardTitleByList[list.id] ?? ''}
							oninput={(e) => updateCardInput(list.id, (e.currentTarget as HTMLInputElement).value)}
							onkeydown={(e) => handleCardInputKeydown(e, list.id)}
							placeholder="Aufgabe hinzufügen"
							class="h-8 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						/>
						<Button size="sm" variant="outline" onclick={() => addCard(list.id)}>+</Button>
					</div>
				</div>
			{/each}

			<div class="sticky bottom-0 rounded-lg border border-dashed border-border bg-card/30">
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={newListName}
						onkeydown={handleListInputKeydown}
						placeholder="Neue Liste"
						class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					/>
					<Button size="sm" onclick={addList}>Liste hinzufügen</Button>
				</div>
			</div>
		</div>
	{/if}
</section>
