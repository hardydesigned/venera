<script lang="ts">
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { Orbit } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';
	import {
		PlusIcon,
		InboxIcon,
		CalendarIcon,
		CalendarDaysIcon,
		WalletIcon,
		ChevronDownIcon,
		HashIcon,
		FolderPlusIcon,
		FolderIcon,
		MoreHorizontalIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import { authStore } from '$lib/auth/auth-store';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { projectStore, type Project } from '$lib/features/projects/project-store';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
	const projectState = $derived($projectStore);
	const projects = $derived(projectState.projects);
	const folders = $derived(
		[...projectState.folders].sort(
			(a, b) => a.order - b.order || a.name.localeCompare(b.name, 'de')
		)
	);
	const validFolderIds = $derived(new Set(folders.map((folder) => folder.id)));
	const ungroupedProjects = $derived(
		projects.filter((project) => !project.folderId || !validFolderIds.has(project.folderId))
	);

	let projectDialogOpen = $state(false);
	let projectDialogMode = $state<'create' | 'edit'>('create');
	let editingProjectId = $state<string | null>(null);
	let projectName = $state('');
	let projectDescription = $state('');
	let projectColor = $state('#2563eb');
	let createTargetFolderId = $state<string | null>(null);
	let createFolderOpen = $state(false);
	let folderName = $state('');
	let draggingProjectId = $state<string | null>(null);
	let activeDropZone = $state<string | null>(null);

	function openCreateProjectDialog(targetFolderId: string | null = null) {
		projectDialogMode = 'create';
		editingProjectId = null;
		projectName = '';
		projectDescription = '';
		projectColor = '#2563eb';
		createTargetFolderId = targetFolderId;
		projectDialogOpen = true;
	}

	function openEditProjectDialog(project: Project) {
		projectDialogMode = 'edit';
		editingProjectId = project.id;
		projectName = project.name;
		projectDescription = project.description;
		projectColor = project.color;
		createTargetFolderId = null;
		projectDialogOpen = true;
	}

	function submitProjectDialog() {
		const name = projectName.trim();
		if (!name) return;
		if (projectDialogMode === 'edit' && editingProjectId) {
			projectStore.updateProject(editingProjectId, {
				name,
				description: projectDescription.trim(),
				color: projectColor
			});
		} else {
			projectStore.createProject({
				name,
				description: projectDescription.trim(),
				color: projectColor,
				folderId: createTargetFolderId
			});
		}
		projectName = '';
		projectDescription = '';
		projectColor = '#2563eb';
		createTargetFolderId = null;
		projectDialogOpen = false;
		editingProjectId = null;
	}

	function createFolder() {
		const name = folderName.trim();
		if (!name) return;
		projectStore.createFolder(name);
		folderName = '';
		createFolderOpen = false;
	}

	function getProjectsForFolder(folderId: string): Project[] {
		return projects.filter((project) => project.folderId === folderId);
	}

	function moveProjectToFolder(projectId: string, folderId: string | null) {
		projectStore.moveProjectToFolder(projectId, folderId);
	}

	function deleteFolder(folderId: string) {
		projectStore.deleteFolder(folderId);
	}

	function handleProjectDragStart(projectId: string, e: DragEvent) {
		draggingProjectId = projectId;
		e.dataTransfer?.setData('application/x-project-id', projectId);
		e.dataTransfer!.effectAllowed = 'move';
	}

	function handleProjectDragEnd() {
		draggingProjectId = null;
		activeDropZone = null;
	}

	function resolveDraggedProjectId(e: DragEvent): string | null {
		const fromTransfer = e.dataTransfer?.getData('application/x-project-id');
		if (fromTransfer) return fromTransfer;
		return draggingProjectId;
	}

	function dropZoneKey(folderId: string | null): string {
		return folderId ?? '__none__';
	}

	function handleDropZoneDragOver(e: DragEvent, folderId: string | null) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		activeDropZone = dropZoneKey(folderId);
	}

	function handleDropZoneDragLeave(folderId: string | null) {
		if (activeDropZone === dropZoneKey(folderId)) {
			activeDropZone = null;
		}
	}

	function handleDropOnFolder(e: DragEvent, folderId: string | null) {
		e.preventDefault();
		const projectId = resolveDraggedProjectId(e);
		if (!projectId) return;
		moveProjectToFolder(projectId, folderId);
		draggingProjectId = null;
		activeDropZone = null;
	}

	function dropZoneClass(folderId: string | null): string {
		return activeDropZone === dropZoneKey(folderId)
			? 'bg-sidebar-accent text-sidebar-accent-foreground rounded-md'
			: '';
	}
</script>

<Sidebar.Root bind:ref {...restProps} variant="inset">
	<Sidebar.Header class="h-16 border-b border-sidebar-border">
		<div class="flex h-full items-center gap-2">
			<Orbit class="size-4" />
			<span class="font-bold">Venera</span>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<div class="flex flex-col items-center gap-1 py-2">
			<Button
				variant="ghost"
				class="w-full justify-start"
				onclick={() => createTaskDialogStore.open()}
			>
				<PlusIcon class="size-4" />
				Aufgabe hinzufügen
			</Button>
			<Button variant="ghost" class="w-full justify-start" href="/inbox">
				<InboxIcon class="size-4" />
				Eingang
			</Button>
			<Button variant="ghost" class="w-full justify-start" href="/calendar">
				<CalendarIcon class="size-4" />
				Kalender
			</Button>
			<Button variant="ghost" class="w-full justify-start pl-9 text-sm" href="/calendar/woche">
				<CalendarDaysIcon class="size-4" />
				Woche
			</Button>
			<Button variant="ghost" class="w-full justify-start" href="/finance">
				<WalletIcon class="size-4" />
				Finanzmanager
			</Button>
			<Sidebar.Separator />

			<Collapsible.Root open={true} class="w-full">
				<Sidebar.GroupLabel
					class="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				>
					{#snippet child({ props })}
						<Collapsible.Trigger {...props}>
							Projekte
							<button
								type="button"
								class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									createFolderOpen = true;
								}}
								aria-label="Ordner erstellen"
							>
								<FolderPlusIcon class="size-3.5" />
							</button>
							<button
								type="button"
								class="inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									openCreateProjectDialog();
								}}
								aria-label="Projekt erstellen"
							>
								<PlusIcon class="size-3.5" />
							</button>
							<ChevronDownIcon
								class="ml-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
							/>
						</Collapsible.Trigger>
					{/snippet}
				</Sidebar.GroupLabel>
				<Collapsible.Content>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#if projects.length === 0}
								<div class="px-2 py-1 text-xs text-muted-foreground">Noch keine Projekte</div>
							{:else}
								{#if folders.length > 0}
									<div
										role="region"
										aria-label="Drop-Zone Ohne Ordner"
										class="flex items-center gap-1 px-2 pt-1 text-[11px] font-medium text-sidebar-foreground/75 {dropZoneClass(
											null
										)}"
										ondragover={(e) => handleDropZoneDragOver(e, null)}
										ondragleave={() => handleDropZoneDragLeave(null)}
										ondrop={(e) => handleDropOnFolder(e, null)}
									>
										<span class="truncate">Ohne Ordner</span>
										<button
											type="button"
											class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"
											onclick={() => openCreateProjectDialog(null)}
											aria-label="Projekt ohne Ordner erstellen"
										>
											<PlusIcon class="size-3.5" />
										</button>
									</div>
								{/if}
								{#each folders.length > 0 ? ungroupedProjects : projects as project (project.id)}
									<Sidebar.MenuItem
										class="flex items-center gap-1"
										draggable={true}
										ondragstart={(e) => handleProjectDragStart(project.id, e)}
										ondragend={handleProjectDragEnd}
									>
										<Sidebar.MenuButton class="min-w-0 flex-1">
											{#snippet child({ props })}
												<a {...props} href={`/projects?project=${project.id}`}>
													<div class="flex min-w-0 items-center gap-2">
														<HashIcon class="size-4 shrink-0" style={`color: ${project.color};`} />
														<span class="truncate">{project.name}</span>
													</div>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
										<button
											type="button"
											class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
											aria-label={`Projekt ${project.name} bearbeiten`}
											onclick={() => openEditProjectDialog(project)}
										>
											<MoreHorizontalIcon class="size-4" />
										</button>
									</Sidebar.MenuItem>
								{/each}
								{#each folders as folder (folder.id)}
									<div
										role="region"
										aria-label={`Drop-Zone Ordner ${folder.name}`}
										class="flex items-center gap-1 px-2 pt-2 text-[11px] font-medium text-sidebar-foreground/75 {dropZoneClass(
											folder.id
										)}"
										ondragover={(e) => handleDropZoneDragOver(e, folder.id)}
										ondragleave={() => handleDropZoneDragLeave(folder.id)}
										ondrop={(e) => handleDropOnFolder(e, folder.id)}
									>
										<div class="inline-flex min-w-0 items-center gap-1">
											<FolderIcon class="size-3.5" />
											<span class="truncate">{folder.name}</span>
										</div>
										<button
											type="button"
											class="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"
											onclick={() => deleteFolder(folder.id)}
											aria-label={`Ordner ${folder.name} löschen`}
										>
											<Trash2Icon class="size-3.5" />
										</button>
										<button
											type="button"
											class="inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-sidebar-accent"
											onclick={() => openCreateProjectDialog(folder.id)}
											aria-label={`Projekt im Ordner ${folder.name} erstellen`}
										>
											<PlusIcon class="size-3.5" />
										</button>
									</div>
									{@const folderProjects = getProjectsForFolder(folder.id)}
									{#if folderProjects.length === 0}
										<div class="px-2 py-1 text-xs text-muted-foreground">Keine Projekte</div>
									{:else}
										{#each folderProjects as project (project.id)}
											<Sidebar.MenuItem
												class="flex items-center gap-1"
												draggable={true}
												ondragstart={(e) => handleProjectDragStart(project.id, e)}
												ondragend={handleProjectDragEnd}
											>
												<Sidebar.MenuButton class="min-w-0 flex-1">
													{#snippet child({ props })}
														<a {...props} href={`/projects?project=${project.id}`}>
															<div class="flex min-w-0 items-center gap-2">
																<HashIcon
																	class="size-4 shrink-0"
																	style={`color: ${project.color};`}
																/>
																<span class="truncate">{project.name}</span>
															</div>
														</a>
													{/snippet}
												</Sidebar.MenuButton>
												<button
													type="button"
													class="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
													aria-label={`Projekt ${project.name} bearbeiten`}
													onclick={() => openEditProjectDialog(project)}
												>
													<MoreHorizontalIcon class="size-4" />
												</button>
											</Sidebar.MenuItem>
										{/each}
									{/if}
								{/each}
							{/if}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Collapsible.Content>
			</Collapsible.Root>
		</div>
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={$authStore.user} />
	</Sidebar.Footer>
</Sidebar.Root>

<Dialog.Root
	open={projectDialogOpen}
	onOpenChange={(open: boolean) => {
		projectDialogOpen = open;
		if (!open) {
			editingProjectId = null;
			createTargetFolderId = null;
		}
	}}
>
	<Dialog.Content class="text-foreground sm:max-w-[430px]">
		<Dialog.Header>
			<Dialog.Title
				>{projectDialogMode === 'edit' ? 'Projekt bearbeiten' : 'Projekt erstellen'}</Dialog.Title
			>
			<Dialog.Description>Name, Farbe und Beschreibung festlegen.</Dialog.Description>
		</Dialog.Header>

		<form
			class="grid gap-4 pt-2"
			onsubmit={(e) => {
				e.preventDefault();
				submitProjectDialog();
			}}
		>
			<div class="grid gap-2">
				<Label for="project-name">Name</Label>
				<Input id="project-name" bind:value={projectName} placeholder="z. B. Website Relaunch" />
			</div>
			<div class="grid gap-2">
				<Label for="project-color">Farbe</Label>
				<input
					id="project-color"
					type="color"
					bind:value={projectColor}
					class="h-10 w-full cursor-pointer rounded-md border border-input bg-background p-1"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="project-desc">Beschreibung</Label>
				<textarea
					id="project-desc"
					bind:value={projectDescription}
					rows={3}
					class="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					placeholder="Kurzbeschreibung"
				></textarea>
			</div>
			<Dialog.Footer class="pt-2">
				<Button type="submit">{projectDialogMode === 'edit' ? 'Speichern' : 'Erstellen'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={createFolderOpen}
	onOpenChange={(open: boolean) => {
		createFolderOpen = open;
	}}
>
	<Dialog.Content class="text-foreground sm:max-w-[430px]">
		<Dialog.Header>
			<Dialog.Title>Ordner erstellen</Dialog.Title>
			<Dialog.Description>Lege einen Ordner an, um Projekte zu gruppieren.</Dialog.Description>
		</Dialog.Header>
		<form
			class="grid gap-4 pt-2"
			onsubmit={(e) => {
				e.preventDefault();
				createFolder();
			}}
		>
			<div class="grid gap-2">
				<Label for="folder-name">Name</Label>
				<Input id="folder-name" bind:value={folderName} placeholder="z. B. Kundenprojekte" />
			</div>
			<Dialog.Footer class="pt-2">
				<Button type="submit">Erstellen</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
