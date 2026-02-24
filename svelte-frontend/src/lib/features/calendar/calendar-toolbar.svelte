<script lang="ts">
	import { ChevronLeft, ChevronRight, Calendar, Search, Filter, Plus } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { calendarStore, type CalendarView } from './calendar-store';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import type { TaskPriorityCategory, TaskStatus } from '$lib/features/tasks/types';

	let calendarState = $derived($calendarStore);

	const viewLabels: Record<CalendarView, string> = {
		month: 'Monat',
		week: 'Woche',
		day: 'Tag',
		year: 'Jahr'
	};

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			calendarStore.setSearchQuery(searchInput);
		}, 300);
	}

	function handlePriorityToggle(priority: TaskPriorityCategory) {
		calendarStore.togglePriority(priority);
	}

	function handleStatusToggle(status: TaskStatus) {
		calendarStore.toggleStatus(status);
	}

	function openCreateDialog() {
		createTaskDialogStore.open();
	}
</script>

<div class="border-border flex flex-col gap-4 border-b bg-card p-4 z-10">
	<!-- View Tabs -->
	<div class="flex flex-wrap items-center gap-2">
		<div class="flex gap-1 rounded-lg bg-muted p-1">
			{#each Object.entries(viewLabels) as [view, label]}
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {calendarState.view ===
					view
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'}"
					onclick={() => calendarStore.setView(view as CalendarView)}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Navigation & Actions -->
	<div class="flex flex-wrap items-center gap-3">
		<!-- Navigation -->
		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon-sm" onclick={() => calendarStore.previousPeriod()}>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<Button variant="outline" onclick={() => calendarStore.goToToday()}>
				<Calendar class="mr-2 h-4 w-4" />
				Heute
			</Button>
			<Button variant="outline" size="icon-sm" onclick={() => calendarStore.nextPeriod()}>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>

		<div class="h-6 w-px bg-border"></div>

		<!-- Search -->
		<div class="relative flex-1 min-w-[200px] max-w-sm">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Aufgaben durchsuchen..."
				class="pl-9"
				bind:value={searchInput}
				oninput={handleSearchInput}
			/>
		</div>

		<!-- Filters -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline">
						<Filter class="mr-2 h-4 w-4" />
						Filter
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-56">
				<DropdownMenu.Label>Priorität</DropdownMenu.Label>
				<DropdownMenu.CheckboxItem
					checked={calendarState.filters.priorities.has('A')}
					onCheckedChange={() => handlePriorityToggle('A')}
				>
					<span class="flex items-center gap-2">
						<span class="h-3 w-3 rounded-full bg-priority-a"></span>
						A (Hoch)
					</span>
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					checked={calendarState.filters.priorities.has('B')}
					onCheckedChange={() => handlePriorityToggle('B')}
				>
					<span class="flex items-center gap-2">
						<span class="h-3 w-3 rounded-full bg-priority-b"></span>
						B (Mittel)
					</span>
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					checked={calendarState.filters.priorities.has('C')}
					onCheckedChange={() => handlePriorityToggle('C')}
				>
					<span class="flex items-center gap-2">
						<span class="h-3 w-3 rounded-full bg-priority-c"></span>
						C (Niedrig)
					</span>
				</DropdownMenu.CheckboxItem>

				<DropdownMenu.Separator />

				<DropdownMenu.Label>Status</DropdownMenu.Label>
				<DropdownMenu.CheckboxItem
					checked={calendarState.filters.statuses.has('OPEN')}
					onCheckedChange={() => handleStatusToggle('OPEN')}
				>
					Offen
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					checked={calendarState.filters.statuses.has('IN_PROGRESS')}
					onCheckedChange={() => handleStatusToggle('IN_PROGRESS')}
				>
					In Arbeit
				</DropdownMenu.CheckboxItem>

				<DropdownMenu.Separator />

				<DropdownMenu.CheckboxItem
					checked={calendarState.filters.showCompleted}
					onCheckedChange={() => calendarStore.toggleShowCompleted()}
				>
					Erledigte anzeigen
				</DropdownMenu.CheckboxItem>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<!-- Create Task Button -->
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 h-4 w-4" />
			Neue Aufgabe
		</Button>
	</div>
</div>
