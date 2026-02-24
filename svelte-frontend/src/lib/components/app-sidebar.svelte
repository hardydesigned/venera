<script lang="ts">
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { Orbit } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';
	import { PlusIcon, InboxIcon, CalendarIcon, ChevronDownIcon, HashIcon } from '@lucide/svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import { authStore } from '$lib/auth/auth-store';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { projectStore } from '$lib/features/projects/project-store';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
	const projectState = $derived($projectStore);
	const projects = $derived(projectState.projects);

	let createProjectOpen = $state(false);
	let projectName = $state('');
	let projectDescription = $state('');
	let projectColor = $state('#2563eb');

	function createProject() {
		const name = projectName.trim();
		if (!name) return;
		projectStore.createProject({
			name,
			description: projectDescription.trim(),
			color: projectColor
		});
		projectName = '';
		projectDescription = '';
		projectColor = '#2563eb';
		createProjectOpen = false;
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
			<Sidebar.Separator />

			<Collapsible.Root open={true} class="w-full">
				<Sidebar.GroupLabel
					class="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				>
					{#snippet child({ props })}
						<Collapsible.Trigger {...props}>
							Projekte
							<span
								role="button"
								tabindex={0}
								class="hover:bg-sidebar-accent ml-auto inline-flex h-5 w-5 items-center justify-center rounded-sm"
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									createProjectOpen = true;
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										createProjectOpen = true;
									}
								}}
								aria-label="Projekt erstellen"
							>
								<PlusIcon class="size-3.5" />
							</span>
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
							{/if}
							{#each projects as project (project.id)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton class="w-full justify-between">
										{#snippet child({ props })}
											<a {...props} href={`/projects?project=${project.id}`}>
												<div class="flex items-center gap-2">
													<HashIcon class="size-4" style={`color: ${project.color};`} />
													<span class="truncate">{project.name}</span>
												</div>
												<span class="text-xs text-sidebar-foreground">{project.lists.length}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
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
	open={createProjectOpen}
	onOpenChange={(open: boolean) => {
		createProjectOpen = open;
	}}
>
	<Dialog.Content class="text-foreground sm:max-w-[430px]">
		<Dialog.Header>
			<Dialog.Title>Projekt erstellen</Dialog.Title>
			<Dialog.Description>Name, Farbe und Beschreibung festlegen.</Dialog.Description>
		</Dialog.Header>

		<form
			class="grid gap-4 pt-2"
			onsubmit={(e) => {
				e.preventDefault();
				createProject();
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
					class="border-input bg-background ring-offset-background focus-visible:ring-ring min-h-[84px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
					placeholder="Kurzbeschreibung"
				></textarea>
			</div>
			<Dialog.Footer class="pt-2">
				<Button type="submit">Erstellen</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
