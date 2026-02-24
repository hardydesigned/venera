<script lang="ts">
	import type { Task } from '$lib/features/tasks/types';
	import {
		formatISODate,
		formatDisplayDate,
		getWeekdayName,
		isToday,
		extractTimePart,
		extractDatePart,
		getPriorityColorVar
	} from './calendar-utils';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import { updateTaskMutation } from '$lib/features/tasks/queries';
	import { Circle, CircleCheckBig } from '@lucide/svelte';
	import {
		getTaskTime,
		saveTaskTime,
		yPositionToTime,
		timeToYPosition,
		calculateDuration,
		timeToMinutes
	} from './task-time-store';

	interface Props {
		tasks: Task[];
		currentDate: Date;
	}

	type ResizeMode = 'start' | 'end';
	type ResizeState = {
		taskId: string;
		mode: ResizeMode;
		columnTop: number;
		startMinutes: number;
		endMinutes: number;
	};

	type PositionedTask = {
		task: Task;
		top: number;
		height: number;
		leftCss: string;
		rightCss: string;
		zIndex: number;
		timeLabel: string;
		priorityColor: string;
	};

	type DragPayload = {
		id: string;
		startMinutes: number;
		endMinutes: number;
		offsetMinutes: number;
	};

	type DragPreviewState = {
		startMinutes: number;
		endMinutes: number;
	};

	type OptimisticSchedule = {
		dateStr: string;
		startMinutes: number;
		endMinutes: number;
		expiresAt: number;
	};

	let { tasks, currentDate }: Props = $props();

	const updateMutation = updateTaskMutation();

	const hours = $derived(Array.from({ length: 24 }, (_, i) => i));
	const isTodayView = $derived(isToday(currentDate));
	const HOUR_HEIGHT = 80;
	const OVERLAP_INDENT = 18;
	const MAX_INDENT = 72;
	const MIN_HEIGHT = 56;
	const SIDE_BY_SIDE_THRESHOLD_MINUTES = 20;
	const MIN_DURATION_MINUTES = 15;
	const CELL_INSET_X = 8;

	let resizeState: ResizeState | null = $state(null);
	let dragPayload: DragPayload | null = $state(null);
	let dragPreview: DragPreviewState | null = $state(null);
	let suppressOpenUntil = $state(0);
	let optimisticSchedules = $state<Record<string, OptimisticSchedule>>({});

	const currentDateStr = $derived(formatISODate(currentDate));
	const dayTasks = $derived(
		tasks.filter((task) => {
			const optimistic = optimisticSchedules[task.id];
			if (optimistic && optimistic.expiresAt >= Date.now()) return optimistic.dateStr === currentDateStr;
			const startDate = extractDatePart(task.startDate);
			if (startDate) return startDate === currentDateStr;
			return extractDatePart(task.dueDate) === currentDateStr;
		})
	);

	function suppressDialogOpen(ms: number = 300) {
		suppressOpenUntil = Date.now() + ms;
	}

	function minutesToTime(minutes: number): string {
		const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
		const h = Math.floor(clamped / 60)
			.toString()
			.padStart(2, '0');
		const m = (clamped % 60).toString().padStart(2, '0');
		return `${h}:${m}`;
	}

	function timeToDateTime(dateStr: string, time: string): string {
		return `${dateStr}T${time}:00`;
	}

	function getOptimisticSchedule(taskId: string): OptimisticSchedule | null {
		const value = optimisticSchedules[taskId];
		if (!value) return null;
		if (value.expiresAt < Date.now()) return null;
		return value;
	}

	function setOptimisticSchedule(taskId: string, dateStr: string, startMinutes: number, endMinutes: number) {
		const expiresAt = Date.now() + 5000;
		optimisticSchedules = {
			...optimisticSchedules,
			[taskId]: { dateStr, startMinutes, endMinutes, expiresAt }
		};

		setTimeout(() => {
			const current = optimisticSchedules[taskId];
			if (!current || current.expiresAt !== expiresAt) return;
			const next = { ...optimisticSchedules };
			delete next[taskId];
			optimisticSchedules = next;
		}, 5200);
	}

	function clearOptimisticSchedule(taskId: string) {
		if (!optimisticSchedules[taskId]) return;
		const next = { ...optimisticSchedules };
		delete next[taskId];
		optimisticSchedules = next;
	}

	function resolveTaskTime(task: Task): { startTime: string; endTime: string } {
		if (resizeState && resizeState.taskId === task.id) {
			return {
				startTime: minutesToTime(resizeState.startMinutes),
				endTime: minutesToTime(resizeState.endMinutes)
			};
		}

		const optimistic = getOptimisticSchedule(task.id);
		if (optimistic) {
			return {
				startTime: minutesToTime(optimistic.startMinutes),
				endTime: minutesToTime(optimistic.endMinutes)
			};
		}

		const savedTime = getTaskTime(task.id);
		const extractedStart = extractTimePart(task.startDate);
		const extractedEnd = extractTimePart(task.dueDate);
		const startTime =
			extractedStart === '00:00' && savedTime?.startTime ? savedTime.startTime : extractedStart;
		let endTime = extractedEnd === '00:00' && savedTime?.endTime ? savedTime.endTime : extractedEnd;

		if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
			endTime = minutesToTime(Math.min(23 * 60 + 59, timeToMinutes(startTime) + 30));
		}

		return { startTime, endTime };
	}

	function updateTaskSchedule(task: Task, dateStr: string, startMinutes: number, endMinutes: number) {
		const startTime = minutesToTime(startMinutes);
		const endTime = minutesToTime(endMinutes);
		saveTaskTime(task.id, startTime, endTime);
		setOptimisticSchedule(task.id, dateStr, startMinutes, endMinutes);

		$updateMutation.mutate(
			{
				id: task.id,
				input: {
					title: task.title,
					description: task.description ?? '',
					startDate: timeToDateTime(dateStr, startTime),
					dueDate: timeToDateTime(dateStr, endTime),
					category: task.category,
					status: task.status
				}
			},
			{
				onError: () => clearOptimisticSchedule(task.id)
			}
		);
	}

	function getDropStartMinutes(e: DragEvent, hour: number, cell: HTMLElement): number {
		const rect = cell.getBoundingClientRect();
		const relativeY = Math.max(0, Math.min(HOUR_HEIGHT, e.clientY - rect.top));
		const quarter = Math.round((relativeY / HOUR_HEIGHT) * 4);
		const minuteInHour = Math.min(45, Math.max(0, quarter * 15));
		return hour * 60 + minuteInHour;
	}

	function clampDropRange(startMinutes: number, durationMinutes: number): { start: number; end: number } {
		const duration = Math.max(MIN_DURATION_MINUTES, durationMinutes);
		const clampedStart = Math.max(0, Math.min(23 * 60 + 59 - MIN_DURATION_MINUTES, startMinutes));
		const end = Math.min(23 * 60 + 59, clampedStart + duration);
		const start = Math.max(0, end - duration);
		return { start, end };
	}

	const positionedDayTasks = $derived.by(() => {
		const timed = dayTasks
			.map((task) => {
				const { startTime, endTime } = resolveTaskTime(task);
				return {
					task,
					startTime,
					endTime,
					startMinutes: timeToMinutes(startTime),
					endMinutes: timeToMinutes(endTime)
				};
			})
			.sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

		if (timed.length === 0) return [];

		const overlaps = (a: (typeof timed)[number], b: (typeof timed)[number]) =>
			a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;

		const adjacency = Array.from({ length: timed.length }, () => new Set<number>());
		for (let i = 0; i < timed.length; i++) {
			for (let j = i + 1; j < timed.length; j++) {
				if (overlaps(timed[i], timed[j])) {
					adjacency[i].add(j);
					adjacency[j].add(i);
				}
			}
		}

		const visited = new Set<number>();
		const components: number[][] = [];
		for (let i = 0; i < timed.length; i++) {
			if (visited.has(i)) continue;
			const stack = [i];
			const component: number[] = [];
			visited.add(i);
			while (stack.length > 0) {
				const current = stack.pop()!;
				component.push(current);
				for (const next of adjacency[current]) {
					if (!visited.has(next)) {
						visited.add(next);
						stack.push(next);
					}
				}
			}
			component.sort(
				(a, b) => timed[a].startMinutes - timed[b].startMinutes || timed[a].endMinutes - timed[b].endMinutes
			);
			components.push(component);
		}

		const positioned: Array<PositionedTask & { sortKey: number }> = [];

		for (const component of components) {
			const activeCols: Array<{ endMinutes: number; col: number }> = [];
			const colByIndex = new Map<number, number>();
			let maxColumns = 1;

			for (const idx of component) {
				const entry = timed[idx];
				for (let i = activeCols.length - 1; i >= 0; i--) {
					if (activeCols[i].endMinutes <= entry.startMinutes) activeCols.splice(i, 1);
				}
				const usedCols = new Set(activeCols.map((item) => item.col));
				let col = 0;
				while (usedCols.has(col)) col++;
				colByIndex.set(idx, col);
				activeCols.push({ endMinutes: entry.endMinutes, col });
				maxColumns = Math.max(maxColumns, activeCols.length);
			}

			let sideBySide = false;
			for (let i = 0; i < component.length && !sideBySide; i++) {
				for (let j = i + 1; j < component.length; j++) {
					const a = timed[component[i]];
					const b = timed[component[j]];
					if (Math.abs(a.startMinutes - b.startMinutes) <= SIDE_BY_SIDE_THRESHOLD_MINUTES) {
						sideBySide = true;
						break;
					}
				}
			}

			for (const idx of component) {
				const entry = timed[idx];
				const col = colByIndex.get(idx) ?? 0;
				const top = timeToYPosition(entry.startTime, HOUR_HEIGHT);
				const duration = calculateDuration(entry.startTime, entry.endTime);
				const height = Math.max((duration / 60) * HOUR_HEIGHT, MIN_HEIGHT);
				let leftCss = `${CELL_INSET_X}px`;
				let rightCss = `${CELL_INSET_X}px`;

				if (sideBySide && maxColumns > 1) {
					const widthPct = 100 / maxColumns;
					const rightCols = maxColumns - col - 1;
					leftCss = `calc(${CELL_INSET_X}px + ${col * widthPct}%)`;
					rightCss = `calc(${CELL_INSET_X}px + ${rightCols * widthPct}%)`;
				} else {
					const left = Math.min(col * OVERLAP_INDENT, MAX_INDENT);
					leftCss = `${CELL_INSET_X + left}px`;
				}

				positioned.push({
					task: entry.task,
					top,
					height,
					leftCss,
					rightCss,
					zIndex: 20,
					timeLabel: `${entry.startTime} - ${entry.endTime}`,
					priorityColor: getPriorityColorVar(entry.task.category),
					sortKey: entry.startMinutes * 10000 + entry.endMinutes
				});
			}
		}

		return positioned.sort((a, b) => a.sortKey - b.sortKey).map(({ sortKey, ...rest }) => rest);
	});

	function openTask(task: Task) {
		if (Date.now() < suppressOpenUntil) return;
		if (resizeState) return;
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

	function handleTaskDragStart(e: DragEvent, task: Task) {
		const { startTime, endTime } = resolveTaskTime(task);
		const startMinutes = timeToMinutes(startTime);
		const endMinutes = timeToMinutes(endTime);

		dragPayload = {
			id: task.id,
			startMinutes,
			endMinutes,
			offsetMinutes: 0
		};
		e.dataTransfer!.effectAllowed = 'move';
		e.dataTransfer!.setData('application/json', JSON.stringify(dragPayload));
		suppressDialogOpen(250);
	}

	function handleTaskDragEnd() {
		dragPayload = null;
		dragPreview = null;
		suppressDialogOpen(250);
	}

	function handleDragOver(e: DragEvent, hour: number, cell: HTMLElement) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		if (!dragPayload) return;
		const duration = dragPayload.endMinutes - dragPayload.startMinutes;
		const anchoredStart = getDropStartMinutes(e, hour, cell) - dragPayload.offsetMinutes;
		const { start, end } = clampDropRange(anchoredStart, duration);
		dragPreview = { startMinutes: start, endMinutes: end };
	}

	function handleDrop(e: DragEvent, hour: number, cell: HTMLElement) {
		e.preventDefault();
		if (!dragPayload) return;
		const task = tasks.find((t) => t.id === dragPayload?.id);
		if (!task) return;

		const duration = dragPayload.endMinutes - dragPayload.startMinutes;
		const anchoredStart = getDropStartMinutes(e, hour, cell) - dragPayload.offsetMinutes;
		const { start, end } = clampDropRange(anchoredStart, duration);
		updateTaskSchedule(task, currentDateStr, start, end);
		dragPreview = null;
		dragPayload = null;
		suppressDialogOpen(250);
	}

	function startResize(e: MouseEvent, task: Task, mode: ResizeMode) {
		e.preventDefault();
		e.stopPropagation();
		const column = (e.currentTarget as HTMLElement).closest('[data-day-column]') as HTMLElement | null;
		if (!column) return;

		const { startTime, endTime } = resolveTaskTime(task);
		resizeState = {
			taskId: task.id,
			mode,
			columnTop: column.getBoundingClientRect().top,
			startMinutes: timeToMinutes(startTime),
			endMinutes: timeToMinutes(endTime)
		};
		suppressDialogOpen(500);
	}

	let dragState: {
		active: boolean;
		startY: number;
		currentY: number;
		element: HTMLElement | null;
	} | null = $state(null);

	function handleMouseDown(e: MouseEvent, element: HTMLElement) {
		if (
			(e.target as HTMLElement).closest('[draggable="true"]') ||
			(e.target as HTMLElement).closest('[data-resize-handle]')
		) {
			return;
		}
		dragState = {
			active: false,
			startY: e.clientY,
			currentY: e.clientY,
			element
		};
	}

	function handleMouseMove(e: MouseEvent) {
		if (resizeState) {
			const snapped = timeToMinutes(yPositionToTime(e.clientY, resizeState.columnTop, HOUR_HEIGHT));
			if (resizeState.mode === 'start') {
				resizeState.startMinutes = Math.max(
					0,
					Math.min(snapped, resizeState.endMinutes - MIN_DURATION_MINUTES)
				);
			} else {
				resizeState.endMinutes = Math.min(
					23 * 60 + 59,
					Math.max(snapped, resizeState.startMinutes + MIN_DURATION_MINUTES)
				);
			}
			return;
		}

		if (!dragState) return;
		const distance = Math.abs(e.clientY - dragState.startY);
		if (distance > 20) {
			dragState.active = true;
			dragState.currentY = e.clientY;
		}
	}

	function handleMouseUp() {
		if (resizeState) {
			const task = tasks.find((t) => t.id === resizeState?.taskId);
			if (task) {
				updateTaskSchedule(task, currentDateStr, resizeState.startMinutes, resizeState.endMinutes);
			}
			resizeState = null;
			suppressDialogOpen(500);
			return;
		}

		if (!dragState) return;
		if (dragState.active && dragState.element) {
			const rect = dragState.element.getBoundingClientRect();
			const startTime = yPositionToTime(
				Math.min(dragState.startY, dragState.currentY),
				rect.top,
				HOUR_HEIGHT
			);
			const endTime = yPositionToTime(
				Math.max(dragState.startY, dragState.currentY),
				rect.top,
				HOUR_HEIGHT
			);
			(window as any).__pendingTaskTime = { startTime, endTime };
			createTaskDialogStore.open(currentDateStr);
		}
		dragState = null;
	}

	const selectionStyle = $derived(() => {
		if (!dragState?.active || !dragState.element) return null;
		const rect = dragState.element.getBoundingClientRect();
		const startY = Math.min(dragState.startY, dragState.currentY) - rect.top;
		const endY = Math.max(dragState.startY, dragState.currentY) - rect.top;
		return { top: `${startY}px`, height: `${endY - startY}px` };
	});
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="flex h-full flex-col overflow-hidden">
	<div class="border-border bg-primary/5 border-b p-4">
		<h2 class="text-lg font-semibold">
			{getWeekdayName(currentDate)}, {formatDisplayDate(currentDateStr)}
		</h2>
		{#if isTodayView}
			<p class="text-primary text-sm font-medium">Heute</p>
		{/if}
	</div>

	<div class="relative flex-1 overflow-auto">
		<div class="grid" style="grid-template-columns: 80px 1fr;">
			{#each hours as hour}
				<div
					class="border-border text-muted-foreground sticky left-0 bg-background border-r border-t px-3 py-2 text-right text-sm font-medium"
					style="height: {HOUR_HEIGHT}px;"
				>
					{hour.toString().padStart(2, '0')}:00
				</div>

				<div
					class="border-border border-r border-t"
					style="height: {HOUR_HEIGHT}px;"
					ondragover={(e) => handleDragOver(e, hour, e.currentTarget as HTMLElement)}
					ondrop={(e) => handleDrop(e, hour, e.currentTarget as HTMLElement)}
					ondragleave={() => (dragPreview = null)}
					onmousedown={(e) => {
						const target = e.currentTarget as HTMLElement;
						handleMouseDown(e, target.parentElement!);
					}}
					data-hour={hour}
					role="gridcell"
					tabindex={0}
				></div>
			{/each}
		</div>

		<div class="pointer-events-none absolute inset-0" style="padding-left: 80px;">
			<div class="relative h-full" data-day-column>
				{#if dragState?.active && selectionStyle()}
					<div
						class="bg-primary/20 border-primary pointer-events-none absolute inset-x-0 z-10 border-2 border-dashed"
						style="top: {selectionStyle()!.top}; height: {selectionStyle()!.height};"
					></div>
				{/if}

				{#if dragPreview}
					<div
						class="bg-primary/25 border-primary/70 pointer-events-none absolute z-15 rounded-md border border-dashed"
						style="left: {CELL_INSET_X}px; right: {CELL_INSET_X}px; top: {timeToYPosition(minutesToTime(dragPreview.startMinutes), HOUR_HEIGHT)}px; height: {Math.max(((dragPreview.endMinutes - dragPreview.startMinutes) / 60) * HOUR_HEIGHT, MIN_HEIGHT)}px;"
					></div>
				{/if}

				{#each positionedDayTasks as positionedTask (positionedTask.task.id)}
					<div
						class="pointer-events-auto absolute"
						style="top: {positionedTask.top}px; left: {positionedTask.leftCss}; right: {positionedTask.rightCss}; height: {positionedTask.height}px; z-index: {positionedTask.zIndex};"
					>
						<div
							role="button"
							tabindex={0}
							class="bg-card/85 hover:bg-card/95 relative flex h-full w-full flex-col overflow-hidden rounded-md border px-3 py-2 text-left shadow-sm backdrop-blur-[1px] transition-colors {positionedTask.task.status ===
							'DONE'
								? 'opacity-55 grayscale-[0.2]'
								: ''}"
							style="border-left: 3px solid {positionedTask.priorityColor};"
							onclick={() => openTask(positionedTask.task)}
							ondragstart={(e) => handleTaskDragStart(e, positionedTask.task)}
							ondragend={handleTaskDragEnd}
							draggable={true}
							aria-label={`Aufgabe: ${positionedTask.task.title}`}
						>
							<div
								class="absolute inset-x-0 top-0 h-2 cursor-ns-resize"
								data-resize-handle
								onmousedown={(e) => startResize(e, positionedTask.task, 'start')}
							></div>
							<div class="mb-1 flex items-center gap-2">
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
									onclick={(e) => toggleDone(positionedTask.task, e)}
									aria-label={`Aufgabe ${positionedTask.task.title} abhaken`}
								>
									{#if positionedTask.task.status === 'DONE'}
										<CircleCheckBig class="size-4" />
									{:else}
										<Circle class="size-4" />
									{/if}
								</button>
								<span
									class="truncate text-sm font-semibold leading-tight {positionedTask.task.status ===
									'DONE'
										? 'line-through'
										: ''}"
									>{positionedTask.task.title}</span
								>
							</div>
							<span class="mt-1 truncate text-xs text-muted-foreground">{positionedTask.timeLabel}</span>
							<div
								class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
								data-resize-handle
								onmousedown={(e) => startResize(e, positionedTask.task, 'end')}
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
