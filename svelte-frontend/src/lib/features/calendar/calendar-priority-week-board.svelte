<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, Circle, CircleCheckBig, GripVertical } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { allTasksQuery, updateTaskMutation } from '$lib/features/tasks/queries';
	import type { Task, TaskPriorityCategory, TaskStatus, UpdateTaskInput } from '$lib/features/tasks/types';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import { playTaskSuccessSound } from '$lib/features/tasks/task-sound';
	import {
		extractDatePart,
		extractTimePart,
		formatISODate,
		getWeekDates,
		getWeekdayName,
		isToday
	} from './calendar-utils';

	type LaneOrderState = Record<string, Record<TaskPriorityCategory, string[]>>;
	type DragState = {
		taskId: string;
	};

	const SLOT_LIMITS: Record<TaskPriorityCategory, number> = {
		A: 5,
		B: 5,
		C: 3
	};
	const CATEGORY_ORDER: TaskPriorityCategory[] = ['A', 'B', 'C'];
	const BOARD_STORAGE_KEY = 'venera_week_board_lane_order:v1';

	const tasksQuery = allTasksQuery();
	const updateMutation = updateTaskMutation();

	let anchorDate = $state(new Date());
	let dragState: DragState | null = $state(null);
	let laneOrderState: LaneOrderState = $state({});
	let optimisticTasks: Record<string, Partial<Task>> = $state({});

	const tasks = $derived(
		($tasksQuery.data ?? [])
			.map((task) => ({ ...task, ...(optimisticTasks[task.id] ?? {}) }))
			.filter((task) => task.status !== 'CANCELLED')
	);
	const weekDates = $derived(getWeekDates(anchorDate));
	const weekDateStrings = $derived(weekDates.map((date) => formatISODate(date)));
	const weekRangeLabel = $derived.by(() => {
		const start = weekDates[0];
		const end = weekDates[6];
		if (!start || !end) return '';
		const startLabel = start.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
		const endLabel = end.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return `${startLabel} - ${endLabel}`;
	});

	function defaultDayOrder(): Record<TaskPriorityCategory, string[]> {
		return { A: [], B: [], C: [] };
	}

	function loadLaneOrderState(): LaneOrderState {
		if (typeof window === 'undefined') return {};
		const raw = localStorage.getItem(BOARD_STORAGE_KEY);
		if (!raw) return {};
		try {
			const parsed = JSON.parse(raw) as LaneOrderState;
			if (!parsed || typeof parsed !== 'object') return {};
			return parsed;
		} catch {
			return {};
		}
	}

	function saveLaneOrderState(next: LaneOrderState) {
		laneOrderState = next;
		if (typeof window !== 'undefined') {
			localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(next));
		}
	}

	function removeTaskFromAllLaneOrders(taskId: string, source: LaneOrderState): LaneOrderState {
		const next: LaneOrderState = {};
		for (const [dateKey, byPriority] of Object.entries(source)) {
			next[dateKey] = {
				A: (byPriority.A ?? []).filter((id) => id !== taskId),
				B: (byPriority.B ?? []).filter((id) => id !== taskId),
				C: (byPriority.C ?? []).filter((id) => id !== taskId)
			};
		}
		return next;
	}

	function getTaskDate(task: Task): string {
		const startDate = extractDatePart(task.startDate);
		if (startDate) return startDate;
		return extractDatePart(task.dueDate);
	}

	function compareTasksFallback(a: Task, b: Task): number {
		const aTime = `${a.startDate || ''}|${a.dueDate || ''}`;
		const bTime = `${b.startDate || ''}|${b.dueDate || ''}`;
		return aTime.localeCompare(bTime) || a.title.localeCompare(b.title, 'de');
	}

	function getTasksForDate(dateStr: string): Task[] {
		return tasks.filter((task) => getTaskDate(task) === dateStr);
	}

	function getOrderedLaneTasks(dateStr: string, category: TaskPriorityCategory): Task[] {
		const laneTasks = getTasksForDate(dateStr).filter((task) => task.category === category);
		const order = laneOrderState[dateStr]?.[category] ?? [];
		const orderIndex = new Map(order.map((id, index) => [id, index]));
		return [...laneTasks].sort((a, b) => {
			const aIdx = orderIndex.get(a.id);
			const bIdx = orderIndex.get(b.id);
			if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
			if (aIdx !== undefined) return -1;
			if (bIdx !== undefined) return 1;
			return compareTasksFallback(a, b);
		});
	}

	function getSlotTasks(dateStr: string, category: TaskPriorityCategory): Task[] {
		return getOrderedLaneTasks(dateStr, category).slice(0, SLOT_LIMITS[category]);
	}

	function getOverflowTasks(dateStr: string): Task[] {
		const slotIds = new Set(
			CATEGORY_ORDER.flatMap((category) => getSlotTasks(dateStr, category).map((task) => task.id))
		);
		return getTasksForDate(dateStr)
			.filter((task) => !slotIds.has(task.id))
			.sort((a, b) => {
				const categoryCmp = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
				if (categoryCmp !== 0) return categoryCmp;
				return compareTasksFallback(a, b);
			});
	}

	function insertTaskIntoLaneOrder(
		source: LaneOrderState,
		dateStr: string,
		category: TaskPriorityCategory,
		taskId: string,
		beforeTaskId: string | null
	): LaneOrderState {
		const cleaned = removeTaskFromAllLaneOrders(taskId, source);
		const day = cleaned[dateStr] ?? defaultDayOrder();
		const laneIds = getOrderedLaneTasks(dateStr, category)
			.map((task) => task.id)
			.filter((id) => id !== taskId);

		if (beforeTaskId && laneIds.includes(beforeTaskId)) {
			const index = laneIds.indexOf(beforeTaskId);
			laneIds.splice(index, 0, taskId);
		} else {
			laneIds.push(taskId);
		}

		return {
			...cleaned,
			[dateStr]: {
				A: day.A,
				B: day.B,
				C: day.C,
				[category]: laneIds
			}
		};
	}

	function withDateAndTime(dateStr: string, dateTime: string, fallbackTime: string): string {
		const time = dateTime ? extractTimePart(dateTime) : fallbackTime;
		return `${dateStr}T${time}:00`;
	}

	function patchOptimisticTask(taskId: string, patch: Partial<Task>) {
		optimisticTasks = {
			...optimisticTasks,
			[taskId]: {
				...(optimisticTasks[taskId] ?? {}),
				...patch
			}
		};
	}

	function clearOptimisticTask(taskId: string) {
		if (!optimisticTasks[taskId]) return;
		const next = { ...optimisticTasks };
		delete next[taskId];
		optimisticTasks = next;
	}

	function buildTaskUpdateInput(task: Task, overrides: Partial<UpdateTaskInput>): UpdateTaskInput {
		return {
			title: overrides.title ?? task.title,
			description: overrides.description ?? task.description ?? '',
			startDate: overrides.startDate ?? task.startDate,
			dueDate: overrides.dueDate ?? task.dueDate,
			category: overrides.category ?? task.category,
			status: overrides.status ?? task.status,
			estimatedDurationMinutes:
				overrides.estimatedDurationMinutes ?? task.estimatedDurationMinutes,
			actualDurationMinutes: overrides.actualDurationMinutes ?? task.actualDurationMinutes
		};
	}

	function moveTaskToLane(
		task: Task,
		targetDate: string,
		targetCategory: TaskPriorityCategory,
		beforeTaskId: string | null
	) {
		saveLaneOrderState(
			insertTaskIntoLaneOrder(laneOrderState, targetDate, targetCategory, task.id, beforeTaskId)
		);

		const nextStartDate = withDateAndTime(targetDate, task.startDate, '00:00');
		const nextDueDate = withDateAndTime(targetDate, task.dueDate, '23:59');
		const sourceDate = getTaskDate(task);
			const changedDate = sourceDate !== targetDate;
			const changedCategory = task.category !== targetCategory;
			if (!changedDate && !changedCategory) return;
			patchOptimisticTask(task.id, {
				startDate: nextStartDate,
				dueDate: nextDueDate,
				category: targetCategory
			});

			$updateMutation.mutate(
				{
					id: task.id,
					input: buildTaskUpdateInput(task, {
						startDate: nextStartDate,
						dueDate: nextDueDate,
						category: targetCategory
					})
				},
				{
					onError: () => clearOptimisticTask(task.id),
					onSuccess: () => clearOptimisticTask(task.id)
				}
			);
		}

	function assignTaskToCategory(task: Task, targetDate: string, targetCategory: TaskPriorityCategory) {
		const firstTaskId = getSlotTasks(targetDate, targetCategory)[0]?.id ?? null;
		moveTaskToLane(task, targetDate, targetCategory, firstTaskId);
	}

	function resolveDraggedTask(e: DragEvent): Task | null {
		const fromTransfer =
			e.dataTransfer?.getData('application/x-venera-task-id') || e.dataTransfer?.getData('text/plain');
		const taskId = fromTransfer || dragState?.taskId;
		if (!taskId) return null;
		return tasks.find((task) => task.id === taskId) ?? null;
	}

	function allowDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleTaskDragStart(e: DragEvent, task: Task) {
		dragState = {
			taskId: task.id
		};
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('application/x-venera-task-id', task.id);
			e.dataTransfer.setData('text/plain', task.id);
		}
	}

	function handleTaskDragEnd() {
		dragState = null;
	}

	function handleDropOnLane(
		e: DragEvent,
		targetDate: string,
		targetCategory: TaskPriorityCategory,
		beforeTaskId: string | null = null
	) {
		e.preventDefault();
		const task = resolveDraggedTask(e);
		if (!task) return;
		moveTaskToLane(task, targetDate, targetCategory, beforeTaskId);
		dragState = null;
	}

	function handleDropOnOverflow(e: DragEvent, targetDate: string) {
		e.preventDefault();
		const task = resolveDraggedTask(e);
		if (!task) return;

		saveLaneOrderState(
			insertTaskIntoLaneOrder(
				laneOrderState,
				targetDate,
				task.category,
				task.id,
				null
			)
		);

			const sourceDate = getTaskDate(task);
			if (sourceDate !== targetDate) {
				const nextStartDate = withDateAndTime(targetDate, task.startDate, '00:00');
				const nextDueDate = withDateAndTime(targetDate, task.dueDate, '23:59');
				patchOptimisticTask(task.id, {
					startDate: nextStartDate,
					dueDate: nextDueDate
				});
				$updateMutation.mutate(
					{
						id: task.id,
						input: buildTaskUpdateInput(task, {
							startDate: nextStartDate,
							dueDate: nextDueDate
						})
					},
					{
						onError: () => clearOptimisticTask(task.id),
						onSuccess: () => clearOptimisticTask(task.id)
					}
				);
			}

		dragState = null;
	}

	function toggleDone(task: Task, checked: boolean) {
		const nextStatus: TaskStatus = checked ? 'DONE' : 'OPEN';
			if (checked) {
				playTaskSuccessSound();
			}
			patchOptimisticTask(task.id, { status: nextStatus });

			$updateMutation.mutate(
				{
					id: task.id,
					input: buildTaskUpdateInput(task, { status: nextStatus })
				},
				{
					onError: () => clearOptimisticTask(task.id),
					onSuccess: () => clearOptimisticTask(task.id)
				}
			);
		}

	function formatTaskDay(task: Task): string {
		const rawDate = getTaskDate(task);
		if (!rawDate) return 'ohne Datum';
		const date = new Date(rawDate);
		return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
	}

	function formatMinutes(minutes: number | null): string {
		if (minutes === null || minutes === undefined) return '-';
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const rest = minutes % 60;
		if (rest === 0) return `${hours}h`;
		return `${hours}h ${rest}m`;
	}

	function openTask(task: Task) {
		createTaskDialogStore.openForEdit(task);
	}

	function handleTaskKeydown(event: KeyboardEvent, task: Task) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		openTask(task);
	}

	function previousWeek() {
		const next = new Date(anchorDate);
		next.setDate(anchorDate.getDate() - 7);
		anchorDate = next;
	}

	function nextWeek() {
		const next = new Date(anchorDate);
		next.setDate(anchorDate.getDate() + 7);
		anchorDate = next;
	}

	function today() {
		anchorDate = new Date();
	}

	onMount(() => {
		saveLaneOrderState(loadLaneOrderState());
	});
</script>

<section class="flex h-full flex-col gap-4 p-4">
	<header class="flex flex-wrap items-center justify-between gap-3 z-10">
		<div>
			<h1 class="text-2xl font-semibold">Woche</h1>
			<p class="text-sm text-muted-foreground">{weekRangeLabel}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon-sm" onclick={previousWeek}>
				<ChevronLeft class="size-4" />
			</Button>
			<Button variant="outline" onclick={today}>Heute</Button>
			<Button variant="outline" size="icon-sm" onclick={nextWeek}>
				<ChevronRight class="size-4" />
			</Button>
		</div>
	</header>

	{#if $tasksQuery.isLoading}
		<div class="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
			Lade Wochenaufgaben...
		</div>
	{:else if $tasksQuery.isError}
		<div class="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-sm text-destructive">
			Fehler beim Laden: {$tasksQuery.error?.message}
		</div>
	{:else}
		<div class="flex-1 min-w-0 overflow-auto pb-2 z-10">
			<div
				class="grid grid-cols-7 gap-4 w-max min-w-full"
				style="grid-template-columns: repeat(7, minmax(18rem, 1fr));"
			>
				{#each weekDates as date, index (weekDateStrings[index])}
					{@const dateStr = weekDateStrings[index]}
					{@const dayTasks = getTasksForDate(dateStr)}
					<article class="flex min-h-[640px] min-w-0 flex-col rounded-xl border border-border bg-card/40">
						<header
							class="flex items-center justify-between border-b border-border px-3 py-2 {isToday(date)
								? 'bg-primary/10'
								: 'bg-muted/20'}"
						>
							<div>
								<p class="text-sm font-semibold capitalize">{getWeekdayName(date)}</p>
								<p class="text-xs text-muted-foreground">
									{date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
								</p>
							</div>
							<span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
								{dayTasks.length}
							</span>
						</header>

						<div class="flex-1 space-y-4 px-3 py-3">
							{#each CATEGORY_ORDER as category (category)}
								<section class="space-y-2">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2 text-sm font-medium">
											<span
												class="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1 text-xs"
											>
												{category}
											</span>
											<span class="text-muted-foreground">{SLOT_LIMITS[category]} Aufgaben</span>
										</div>
									</div>

										<div
											class="space-y-2 rounded-lg border border-dashed border-border/80 bg-background/30 p-2"
											ondragover={allowDrop}
											ondrop={(event) => handleDropOnLane(event, dateStr, category)}
											role="group"
											aria-label={`Slots ${category} am ${dateStr}`}
										>
											{#each getSlotTasks(dateStr, category) as task (task.id)}
												<div
													ondragover={allowDrop}
													ondrop={(event) => handleDropOnLane(event, dateStr, category, task.id)}
													role="group"
													aria-label={`Drop vor ${task.title}`}
												>
												<div
													class="group rounded-lg border border-border bg-card px-2.5 py-2 shadow-xs transition hover:border-primary/30 hover:bg-card/80 {task.status ===
													'DONE'
														? 'opacity-60'
														: ''}"
													draggable={true}
												ondragstart={(event) => handleTaskDragStart(event, task)}
													ondragend={handleTaskDragEnd}
													role="button"
													tabindex={0}
													onclick={() => openTask(task)}
													onkeydown={(event) => handleTaskKeydown(event, task)}
												>
													<div class="flex items-start gap-2">
														<button
															type="button"
															class="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
															onclick={(event) => {
																event.stopPropagation();
																toggleDone(task, task.status !== 'DONE');
															}}
															aria-label={`Aufgabe ${task.title} abhaken`}
														>
															{#if task.status === 'DONE'}
																<CircleCheckBig class="size-4" />
															{:else}
																<Circle class="size-4" />
															{/if}
														</button>
														<div class="min-w-0 flex-1">
															<p class="truncate text-sm font-medium {task.status === 'DONE' ? 'line-through' : ''}">
																{task.title}
															</p>
															<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
																<span>{formatTaskDay(task)}</span>
																<span>Soll: {formatMinutes(task.estimatedDurationMinutes)}</span>
																<span>Ist: {formatMinutes(task.actualDurationMinutes)}</span>
															</div>
														</div>
														<GripVertical class="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
													</div>
												</div>
											</div>
										{/each}

										{#each Array.from({
											length: Math.max(0, SLOT_LIMITS[category] - getSlotTasks(dateStr, category).length)
										}) as _, slotIndex (`${category}-empty-${slotIndex}`)}
											<div class="flex min-h-15 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/15 text-xs text-muted-foreground">
												
											</div>
										{/each}
									</div>
								</section>
							{/each}

								<section
									class="space-y-2 border-t border-border pt-2"
									ondragover={allowDrop}
									ondrop={(event) => handleDropOnOverflow(event, dateStr)}
									role="group"
									aria-label={`Weitere Aufgaben am ${dateStr}`}
								>
								<p class="text-xs font-medium text-muted-foreground">Weitere Aufgaben</p>
								{#if getOverflowTasks(dateStr).length === 0}
									<p class="rounded-md border border-dashed border-border/80 px-2 py-2 text-xs text-muted-foreground">
										Keine weiteren Aufgaben
									</p>
								{:else}
									<div class="space-y-2">
										{#each getOverflowTasks(dateStr) as task (task.id)}
												<div
													class="rounded-md border border-border bg-background/70 px-2 py-2 transition hover:border-primary/30"
													draggable={true}
													ondragstart={(event) => handleTaskDragStart(event, task)}
													ondragend={handleTaskDragEnd}
													role="article"
												>
												<div class="flex items-start gap-2">
													<button
														type="button"
														class="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
														onclick={(event) => {
															event.stopPropagation();
															toggleDone(task, task.status !== 'DONE');
														}}
														aria-label={`Aufgabe ${task.title} abhaken`}
													>
														{#if task.status === 'DONE'}
															<CircleCheckBig class="size-4" />
														{:else}
															<Circle class="size-4" />
														{/if}
													</button>
													<div
														class="min-w-0 flex-1 cursor-pointer"
														onclick={() => openTask(task)}
														onkeydown={(event) => handleTaskKeydown(event, task)}
														role="button"
														tabindex={0}
													>
														<p class="truncate text-sm font-medium {task.status === 'DONE' ? 'line-through' : ''}">
															{task.title}
														</p>
														<p class="text-[11px] text-muted-foreground">
															{task.category} · Soll {formatMinutes(task.estimatedDurationMinutes)} · Ist {formatMinutes(task.actualDurationMinutes)}
														</p>
													</div>
												</div>
												<div class="mt-2 flex items-center gap-1">
													{#each CATEGORY_ORDER as category (category)}
														<button
															type="button"
															class="rounded-md border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
															onclick={(event) => {
																event.stopPropagation();
																assignTaskToCategory(task, dateStr, category);
															}}
														>
															Als {category}
														</button>
													{/each}
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</section>
						</div>
					</article>
				{/each}
			</div>
		</div>
	{/if}
</section>
