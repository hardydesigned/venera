<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { projectStore } from '$lib/features/projects/project-store';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Circle, CircleCheckBig, Trash2 } from '@lucide/svelte';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import type { Task } from '$lib/features/tasks/types';
	import { toastStore } from '$lib/stores/toast-store';

	const projectState = $derived($projectStore);
	const projects = $derived(projectState.projects);

	const selectedProjectId = $derived(page.url.searchParams.get('project') ?? projects[0]?.id ?? null);
	const selectedProject = $derived(projects.find((project) => project.id === selectedProjectId) ?? null);

	let viewMode = $state<'list' | 'board'>('board');
	let newListName = $state('');
	let newCardTitleByList = $state<Record<string, string>>({});

	type CardDragPayload = {
		projectId: string;
		fromListId: string;
		cardId: string;
	};

	let draggingCard: CardDragPayload | null = $state(null);
	let suppressCardOpenUntil = $state(0);

	function addList() {
		if (!selectedProject) return;
		projectStore.addList(selectedProject.id, newListName);
		newListName = '';
	}

	function addCard(listId: string) {
		if (!selectedProject) return;
		const title = (newCardTitleByList[listId] ?? '').trim();
		if (!title) return;
		projectStore.addCard(selectedProject.id, listId, title);
		newCardTitleByList = { ...newCardTitleByList, [listId]: '' };
	}

	function updateCardInput(listId: string, value: string) {
		newCardTitleByList = { ...newCardTitleByList, [listId]: value };
	}

	function handleCardDragStart(projectId: string, fromListId: string, cardId: string, e: DragEvent) {
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

	function updateProjectCard(cardId: string, title: string, done: boolean) {
		const project = selectedProject;
		if (!project) return;
		for (const list of project.lists) {
			const existing = list.cards.find((card) => card.id === cardId);
			if (existing) {
				projectStore.updateCard(project.id, list.id, cardId, { title, done });
				return;
			}
		}
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

	function openCardEditor(cardId: string, title: string, done: boolean) {
		if (Date.now() < suppressCardOpenUntil) return;

		const today = new Date().toISOString().slice(0, 10);
		const pseudoTask: Task = {
			id: `project-card-${cardId}`,
			title,
			description: '',
			startDate: `${today}T09:00:00`,
			dueDate: `${today}T10:00:00`,
			category: 'B',
			status: done ? 'DONE' : 'OPEN'
		};

		createTaskDialogStore.openForEdit(pseudoTask);
	}

	onMount(() => {
		(window as any).__projectCardDialogBridge = {
			updateCard: (cardId: string, title: string, done: boolean) => {
				updateProjectCard(cardId, title, done);
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
				<p class="text-sm text-muted-foreground">{selectedProject.description || 'Keine Beschreibung'}</p>
			{:else}
				<p class="text-sm text-muted-foreground">Erstelle in der Sidebar dein erstes Projekt.</p>
			{/if}
		</div>
		<div class="flex flex-wrap items-center justify-end gap-2">
			<Button
				variant={viewMode === 'list' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (viewMode = 'list')}
			>
				Liste
			</Button>
			<Button
				variant={viewMode === 'board' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (viewMode = 'board')}
			>
				Board
			</Button>
		</div>
	</header>

	{#if !selectedProject}
		<div class="rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
			Kein Projekt ausgewählt.
		</div>
	{:else}
		{#if viewMode === 'board'}
			<div class="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-2">
				<div class="flex h-full min-w-max items-start gap-3 pr-4">
					{#each selectedProject.lists as list (list.id)}
						<div
							class="border-border bg-card/50 flex h-full max-h-full w-[300px] shrink-0 flex-col rounded-lg border"
							ondragover={handleListDragOver}
							ondrop={(e) => handleListDrop(selectedProject.id, list.id, e)}
						>
							<div class="border-border flex items-center justify-between border-b px-3 py-2">
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
										ondragstart={(e) => handleCardDragStart(selectedProject.id, list.id, card.id, e)}
										ondragend={handleCardDragEnd}
										onclick={() => openCardEditor(card.id, card.title, card.done)}
										class="bg-background flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2"
									>
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground"
											onclick={(e) => {
												e.stopPropagation();
												projectStore.toggleCardDone(selectedProject.id, list.id, card.id);
											}}
										>
											{#if card.done}
												<CircleCheckBig class="size-4" />
											{:else}
												<Circle class="size-4" />
											{/if}
										</button>
										<span class="text-sm {card.done ? 'text-muted-foreground line-through' : ''}">{card.title}</span>
									</div>
								{/each}
								<div class="mt-1 flex gap-2">
									<input
										type="text"
										value={newCardTitleByList[list.id] ?? ''}
										oninput={(e) => updateCardInput(list.id, (e.currentTarget as HTMLInputElement).value)}
										placeholder="Aufgabe hinzufügen"
										class="border-input bg-background ring-offset-background focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
									/>
									<Button size="sm" variant="outline" onclick={() => addCard(list.id)}>+</Button>
								</div>
							</div>
						</div>
					{/each}

					<div class="border-border bg-card/30 flex h-fit w-[300px] shrink-0 flex-col rounded-lg border border-dashed p-3">
						<h3 class="mb-2 font-medium">Neue Liste</h3>
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={newListName}
								placeholder="Listenname"
								class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
									onclick={() => openCardEditor(card.id, card.title, card.done)}
								>
									<button
										type="button"
										class="text-muted-foreground hover:text-foreground"
										onclick={(e) => {
											e.stopPropagation();
											projectStore.toggleCardDone(selectedProject.id, list.id, card.id);
										}}
									>
										{#if card.done}
											<CircleCheckBig class="size-4" />
										{:else}
											<Circle class="size-4" />
										{/if}
									</button>
									<span class="text-sm {card.done ? 'text-muted-foreground line-through' : ''}">{card.title}</span>
								</li>
							{/each}
						</ul>
						<div class="mt-3 flex gap-2">
							<input
								type="text"
								value={newCardTitleByList[list.id] ?? ''}
								oninput={(e) => updateCardInput(list.id, (e.currentTarget as HTMLInputElement).value)}
								placeholder="Aufgabe hinzufügen"
								class="border-input bg-background ring-offset-background focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
							/>
							<Button size="sm" variant="outline" onclick={() => addCard(list.id)}>+</Button>
						</div>
					</div>
				{/each}

				<div class="border-border bg-card/30 sticky bottom-0 rounded-lg border border-dashed p-3">
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={newListName}
							placeholder="Neue Liste"
							class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
						/>
						<Button size="sm" onclick={addList}>Liste hinzufügen</Button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</section>
