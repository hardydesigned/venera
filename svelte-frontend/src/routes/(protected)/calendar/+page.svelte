<script lang="ts">
	import { calendarStore } from '$lib/features/calendar/calendar-store';
	import { allTasksQuery } from '$lib/features/tasks/queries';
	import {
		filterTasksBySearch,
		filterTasksByPriorities,
		filterTasksByStatuses
	} from '$lib/features/calendar/calendar-utils';
	import CalendarToolbar from '$lib/features/calendar/calendar-toolbar.svelte';
	import CalendarMonthView from '$lib/features/calendar/calendar-month-view.svelte';
	import CalendarWeekView from '$lib/features/calendar/calendar-week-view.svelte';
	import CalendarDayView from '$lib/features/calendar/calendar-day-view.svelte';
	import CalendarYearView from '$lib/features/calendar/calendar-year-view.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const tasksQuery = allTasksQuery();
	let calendarState = $derived($calendarStore);

	// Filter tasks based on store state
	const allTasks = $derived($tasksQuery.data ?? []);
	const filteredTasks = $derived(() => {
		let tasks = allTasks;

		// Apply search filter
		tasks = filterTasksBySearch(tasks, calendarState.searchQuery);

		// Apply priority filter
		tasks = filterTasksByPriorities(tasks, calendarState.filters.priorities);

		// Apply status filter
		tasks = filterTasksByStatuses(tasks, calendarState.filters.statuses);

		return tasks;
	});
</script>

<svelte:head>
	<title>Kalender | Venera</title>
</svelte:head>

<div class="flex h-full flex-col overflow-hidden">
	<!-- Toolbar -->
	<CalendarToolbar />

	<!-- Calendar Views -->
	<div class="flex-1 overflow-hidden">
		{#if $tasksQuery.isLoading}
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<div
						class="border-primary mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"
					></div>
					<p class="text-muted-foreground">Lädt Aufgaben...</p>
				</div>
			</div>
		{:else if $tasksQuery.isError}
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<p class="text-destructive mb-2 text-lg font-semibold">Fehler beim Laden</p>
					<p class="text-muted-foreground">
						{$tasksQuery.error?.message || 'Unbekannter Fehler'}
					</p>
					<Button class="mt-4" onclick={() => $tasksQuery.refetch()}>Erneut versuchen</Button>
				</div>
			</div>
		{:else}
			{#if calendarState.view === 'month'}
				<CalendarMonthView tasks={filteredTasks()} currentDate={calendarState.currentDate} />
			{:else if calendarState.view === 'week'}
				<CalendarWeekView tasks={filteredTasks()} currentDate={calendarState.currentDate} />
			{:else if calendarState.view === 'day'}
				<CalendarDayView tasks={filteredTasks()} currentDate={calendarState.currentDate} />
			{:else if calendarState.view === 'year'}
				<CalendarYearView tasks={filteredTasks()} currentDate={calendarState.currentDate} />
			{/if}
		{/if}
	</div>
</div>
