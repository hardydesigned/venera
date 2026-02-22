<script lang="ts" module>
	// This is sample data.
	const data = {
		projects: [
			{ name: 'Projekt 1', amount: 10 },
			{ name: 'Projekt 2', amount: 20 },
			{ name: 'Projekt 3', amount: 30 }
		]
	};
</script>

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

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
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
							<ChevronDownIcon
								class="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
							/>
						</Collapsible.Trigger>
					{/snippet}
				</Sidebar.GroupLabel>
				<Collapsible.Content>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each data.projects as project, itemIndex (project.name)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton class="w-full justify-between">
										<div class="flex items-center gap-2">
											<HashIcon class="size-4" />
											{project.name}
										</div>
										<span class="text-xs text-sidebar-foreground">
											{project.amount}
										</span>
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
