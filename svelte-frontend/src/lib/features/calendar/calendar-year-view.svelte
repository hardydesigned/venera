<script lang="ts">
	import type { Task } from '$lib/features/tasks/types';
	import {
		getMonthDates,
		getMonthName,
		getWeekdayName,
		formatISODate,
		filterTasksByDate,
		isToday,
		isSameDay,
		extractDatePart
	} from './calendar-utils';
	import { calendarStore } from './calendar-store';

	interface Props {
		tasks: Task[];
		currentDate: Date;
	}

	let { tasks, currentDate }: Props = $props();

	const year = $derived(currentDate.getFullYear());
	const months = $derived(Array.from({ length: 12 }, (_, i) => i));

	const weekdayLabels = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const date = new Date(2024, 0, 1 + i);
			return getWeekdayName(date, true).substring(0, 1);
		})
	);

	function getTasksForDate(date: Date): Task[] {
		return filterTasksByDate(tasks, date);
	}

	function getTaskCountForMonth(month: number): number {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0);

		return tasks.filter((task) => {
			const taskDateStr = task.dueDate || task.startDate;
			const taskDate = extractDatePart(taskDateStr);
			return taskDate >= formatISODate(monthStart) && taskDate <= formatISODate(monthEnd);
		}).length;
	}

	function handleMonthClick(month: number) {
		const newDate = new Date(year, month, 1);
		calendarStore.setCurrentDate(newDate);
		calendarStore.setView('month');
	}
</script>

<div class="h-full overflow-auto p-6">
	<!-- Year Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold">{year}</h1>
	</div>

	<!-- 12-Month Grid (4 columns x 3 rows) -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each months as month}
			{@const monthDates = getMonthDates(year, month)}
			{@const taskCount = getTaskCountForMonth(month)}
			<button
				class="border-border group rounded-lg border p-3 transition-all hover:border-primary hover:shadow-md"
				onclick={() => handleMonthClick(month)}
			>
				<!-- Month Name & Task Count -->
				<div class="mb-2 flex items-center justify-between">
					<h3 class="text-sm font-semibold">{getMonthName(month)}</h3>
					{#if taskCount > 0}
						<span
							class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium"
						>
							{taskCount}
						</span>
					{/if}
				</div>

				<!-- Mini Calendar Grid -->
				<div class="grid grid-cols-7 gap-1">
					<!-- Weekday Headers -->
					{#each weekdayLabels as label}
						<div class="text-muted-foreground text-center text-xs">
							{label}
						</div>
					{/each}

					<!-- Date Cells -->
					{#each monthDates.slice(0, 35) as date}
						{@const dayTasks = getTasksForDate(date)}
						{@const isTodayCell = isToday(date)}
						{@const isInMonth = date.getMonth() === month}
						<div
							class="flex h-6 w-6 items-center justify-center rounded text-xs {isTodayCell
								? 'bg-primary text-primary-foreground font-semibold'
								: isInMonth
									? 'text-foreground'
									: 'text-muted-foreground/50'} {dayTasks.length > 0 && isInMonth
								? 'font-semibold'
								: ''}"
						>
							{#if dayTasks.length > 0 && isInMonth}
								<span class="relative">
									{date.getDate()}
									<span
										class="bg-primary absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
									></span>
								</span>
							{:else}
								{date.getDate()}
							{/if}
						</div>
					{/each}
				</div>
			</button>
		{/each}
	</div>
</div>
