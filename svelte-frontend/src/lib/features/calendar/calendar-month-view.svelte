<script lang="ts">
	import type { Task } from '$lib/features/tasks/types';
	import {
		getMonthDates,
		getWeekdayName,
		formatISODate,
		filterTasksByDate,
		isToday,
		isSameDay,
		getMonthName
	} from './calendar-utils';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import { updateTaskMutation } from '$lib/features/tasks/queries';
	import { Circle, CircleCheckBig } from '@lucide/svelte';

	interface Props {
		tasks: Task[];
		currentDate: Date;
	}

	let { tasks, currentDate }: Props = $props();

	const updateMutation = updateTaskMutation();

	const year = $derived(currentDate.getFullYear());
	const month = $derived(currentDate.getMonth());
	const monthDates = $derived(getMonthDates(year, month));

	const weekdayLabels = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const date = new Date(2024, 0, 1 + i); // Monday = Jan 1, 2024
			return getWeekdayName(date, true);
		})
	);

	function getTasksForDate(date: Date): Task[] {
		return filterTasksByDate(tasks, date);
	}

	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === month;
	}

	function handleDayDoubleClick(date: Date) {
		const dateStr = formatISODate(date);
		createTaskDialogStore.open(dateStr);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
	}

	function handleDrop(e: DragEvent, date: Date) {
		e.preventDefault();
		const data = e.dataTransfer?.getData('application/json');
		if (!data) return;

		const payload = JSON.parse(data) as { id?: string };
		const task = tasks.find((t) => t.id === payload.id) ?? (payload as Task);
		if (!task || !task.id) return;
		const newDate = formatISODate(date);

		// Extract time from existing datetime or use default
		const existingDueTime = task.dueDate.includes('T') ? task.dueDate.split('T')[1] : '23:59:00';
		const existingStartTime = task.startDate.includes('T') ? task.startDate.split('T')[1] : '00:00:00';

		const newDueDateTime = `${newDate}T${existingDueTime}`;
		const newStartDateTime = `${newDate}T${existingStartTime}`;

		// Move task completely to the dropped day (start + due)
		$updateMutation.mutate({
			id: task.id,
			input: {
				title: task.title,
				description: task.description ?? '',
				startDate: newStartDateTime,
				dueDate: newDueDateTime,
				category: task.category,
				status: task.status
			}
		});
	}

	function handleTaskDragStart(e: DragEvent, task: Task) {
		e.dataTransfer!.effectAllowed = 'move';
		e.dataTransfer!.setData('application/json', JSON.stringify({ id: task.id }));
	}

	function openTask(task: Task) {
		createTaskDialogStore.openForEdit(task);
	}

	function toggleDone(task: Task, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const nextStatus = task.status === 'DONE' ? 'OPEN' : 'DONE';
		$updateMutation.mutate({
			id: task.id,
			input: {
				title: task.title,
				description: task.description ?? '',
				startDate: task.startDate,
				dueDate: task.dueDate,
				category: task.category,
				status: nextStatus
			}
		});
	}
</script>

<div class="flex flex-col h-full">
	<!-- Month/Year Header -->
	<div class="border-border bg-muted/30 border-b px-4 py-3">
		<h2 class="text-lg font-semibold">
			{getMonthName(month)}
			{year}
		</h2>
	</div>

	<!-- Calendar Grid -->
	<div class="flex-1 overflow-auto">
		<div class="grid h-full" style="grid-template-columns: repeat(7, 1fr);">
			<!-- Weekday Headers -->
			{#each weekdayLabels as label}
				<div class="border-border bg-muted/50 border-b border-r p-2 text-center text-sm font-medium">
					{label}
				</div>
			{/each}

			<!-- Date Cells -->
			{#each monthDates as date}
				{@const dayTasks = getTasksForDate(date)}
				{@const isTodayCell = isToday(date)}
				{@const isInMonth = isCurrentMonth(date)}
				<div
					class="border-border group relative min-h-[120px] border-b border-r p-2 transition-colors hover:bg-muted/50 {!isInMonth
						? 'bg-muted/20'
						: ''}"
					ondblclick={() => handleDayDoubleClick(date)}
					ondragover={handleDragOver}
					ondrop={(e) => handleDrop(e, date)}
					data-date={formatISODate(date)}
					role="gridcell"
					tabindex={0}
				>
					<!-- Day Number -->
					<div class="mb-2 flex items-center justify-between">
						<span
							class="flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors {isTodayCell
								? 'bg-primary text-primary-foreground'
								: isInMonth
									? 'text-foreground'
									: 'text-muted-foreground'}"
						>
							{date.getDate()}
						</span>
					</div>

					<!-- Tasks -->
					<div class="space-y-1">
						{#each dayTasks.slice(0, 3) as task (task.id)}
							<div
								role="button"
								tabindex={0}
								class="bg-card/85 hover:bg-card relative flex w-full items-center gap-1 overflow-hidden rounded-md border px-1.5 py-1 text-left text-xs transition-colors {task.status ===
								'DONE'
									? 'opacity-55 grayscale-[0.2]'
									: ''}"
								onclick={() => openTask(task)}
								ondragstart={(e) => handleTaskDragStart(e, task)}
								draggable={true}
								aria-label={`Aufgabe ${task.title}`}
							>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
									onclick={(e) => toggleDone(task, e)}
									aria-label={`Aufgabe ${task.title} abhaken`}
								>
									{#if task.status === 'DONE'}
										<CircleCheckBig class="size-3.5" />
									{:else}
										<Circle class="size-3.5" />
									{/if}
								</button>
								<span class="truncate {task.status === 'DONE' ? 'line-through' : ''}">
									{task.title}
								</span>
							</div>
						{/each}
						{#if dayTasks.length > 3}
							<button
								class="text-muted-foreground hover:text-foreground w-full rounded px-2 py-1 text-left text-xs transition-colors"
								onclick={() => handleDayDoubleClick(date)}
							>
								+{dayTasks.length - 3} weitere
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
