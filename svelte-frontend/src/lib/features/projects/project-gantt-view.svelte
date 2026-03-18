<script lang="ts">
	import { tick } from 'svelte';
	import { ChevronDown, ChevronRight, Circle, CircleCheckBig } from '@lucide/svelte';
	import { projectStore, type ProjectList, type ProjectTaskCard } from './project-store';
	import Button from '$lib/components/ui/button/button.svelte';

	type Scale = 'day' | 'week' | 'month' | 'quarter' | 'year';
	type StatusFilter = 'all' | 'open' | 'done';

	type Row = {
		listId: string;
		card: ProjectTaskCard;
		level: number;
		hasChildren: boolean;
	};

	type TimelineColumn = {
		start: Date;
		end: Date;
		label: string;
	};

	type DragState = {
		listId: string;
		rootId: string;
		subtreeIds: string[];
	};

	type DropState = {
		listId: string;
		targetId: string | null;
		position: 'before' | 'after';
		depth: number;
	};

	type ActiveTimelineEdit = {
		type: 'create' | 'resize-start' | 'resize-end' | 'move';
		listId: string;
		cardId: string;
		startMs: number;
		currentMs: number;
		initialStartMs: number | null;
		initialEndMs: number | null;
	};

	interface Props {
		projectId: string;
		lists: ProjectList[];
		onOpenCard: (listId: string, card: ProjectTaskCard) => void;
		onToggleDone: (listId: string, cardId: string) => void;
		onCreateCard: (listId: string | null, title: string) => boolean;
	}

	const DAY_MS = 24 * 60 * 60 * 1000;
	const INDENT_STEP = 22;
	const MAX_DEPTH = 12;
	const COLUMN_COUNT = 180;
	const CENTER_INDEX = Math.floor(COLUMN_COUNT / 2);
	const SHIFT_COLUMNS = 60;

	let { projectId, lists, onOpenCard, onToggleDone, onCreateCard }: Props = $props();

	let scale = $state<Scale>('week');
	let searchQuery = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let selectedListId = $state('all');
	let columnWidth = $state(90);
	let quickCreateTitle = $state('');

	let collapsed = $state<Record<string, boolean>>({});
	let dragState = $state<DragState | null>(null);
	let dropState = $state<DropState | null>(null);
	let activeTimelineEdit = $state<ActiveTimelineEdit | null>(null);

	let timelineAnchor = $state<Date>(startOfUnit(new Date(), 'week'));
	let timelineViewport: HTMLDivElement | null = $state(null);
	let timelineReady = $state(false);
	let lastScale = $state<Scale>('week');
	let rebasingScroll = $state(false);

	function toDayStartMs(value: number | Date): number {
		const d = new Date(value);
		d.setHours(0, 0, 0, 0);
		return d.getTime();
	}

	function snapToDayMs(ms: number): number {
		return toDayStartMs(ms);
	}

	function formatDayStartIso(ms: number): string {
		const d = new Date(toDayStartMs(ms));
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
	}

	function parseDateMs(value: string): number | null {
		if (!value) return null;
		const ms = new Date(value).getTime();
		if (Number.isNaN(ms)) return null;
		return toDayStartMs(ms);
	}

	function startOfUnit(date: Date, view: Scale): Date {
		const d = new Date(date);
		d.setMilliseconds(0);
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		if (view === 'week') {
			const day = (d.getDay() + 6) % 7;
			d.setDate(d.getDate() - day);
		}
		if (view === 'month') {
			d.setDate(1);
		}
		if (view === 'quarter') {
			const month = d.getMonth();
			d.setMonth(Math.floor(month / 3) * 3, 1);
		}
		if (view === 'year') {
			d.setMonth(0, 1);
		}
		return d;
	}

	function addUnit(date: Date, view: Scale, count: number): Date {
		const d = new Date(date);
		if (view === 'day') d.setDate(d.getDate() + count);
		if (view === 'week') d.setDate(d.getDate() + count * 7);
		if (view === 'month') d.setMonth(d.getMonth() + count);
		if (view === 'quarter') d.setMonth(d.getMonth() + count * 3);
		if (view === 'year') d.setFullYear(d.getFullYear() + count);
		return d;
	}

	function formatColumnLabel(start: Date, view: Scale): string {
		if (view === 'day')
			return start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
		if (view === 'week')
			return start.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
		if (view === 'month')
			return start.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
		if (view === 'quarter')
			return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
		return String(start.getFullYear());
	}

	function rowShade(level: number): string {
		if (level <= 0) return '';
		const alpha = Math.min(0.05 + level * 0.035, 0.24);
		return `background-color: hsl(var(--primary) / ${alpha});`;
	}

	function barShade(level: number, done: boolean): string {
		const lightness = Math.max(44, 64 - level * 5);
		const borderLightness = Math.max(34, lightness - 9);
		const opacity = done ? 0.45 : 0.92;
		return `background-color: hsl(38 95% ${lightness}% / ${opacity}); border-color: hsl(38 85% ${borderLightness}%);`;
	}

	function buildRows(cards: ProjectTaskCard[], listId: string): Row[] {
		const byId = new Map(cards.map((card) => [card.id, card]));
		const children = new Map<string | null, ProjectTaskCard[]>();
		for (const card of cards) {
			const parentId = card.parentId && byId.has(card.parentId) ? card.parentId : null;
			const existing = children.get(parentId) ?? [];
			existing.push(card);
			children.set(parentId, existing);
		}

		for (const entry of children.values()) {
			entry.sort((a, b) => a.order - b.order);
		}

		const rows: Row[] = [];
		const visited = new Set<string>();

		function visit(card: ProjectTaskCard, level: number) {
			if (visited.has(card.id)) return;
			visited.add(card.id);
			rows.push({
				listId,
				card,
				level,
				hasChildren: (children.get(card.id)?.length ?? 0) > 0
			});
			for (const child of children.get(card.id) ?? []) {
				visit(child, level + 1);
			}
		}

		for (const root of children.get(null) ?? []) {
			visit(root, 0);
		}

		for (const card of cards) {
			if (!visited.has(card.id)) {
				visit(card, 0);
			}
		}

		return rows;
	}

	const allRows = $derived.by(() => {
		const rows: Row[] = [];
		for (const list of lists) {
			if (selectedListId !== 'all' && selectedListId !== list.id) continue;
			rows.push(
				...buildRows(
					[...list.cards].sort((a, b) => a.order - b.order),
					list.id
				)
			);
		}
		return rows;
	});

	function passesFilters(row: Row): boolean {
		if (statusFilter === 'done' && !row.card.done) return false;
		if (statusFilter === 'open' && row.card.done) return false;
		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			if (
				!row.card.title.toLowerCase().includes(q) &&
				!row.card.description.toLowerCase().includes(q)
			) {
				return false;
			}
		}
		return true;
	}

	function hasCollapsedAncestor(row: Row): boolean {
		const list = lists.find((entry) => entry.id === row.listId);
		if (!list) return false;
		const byId = new Map(list.cards.map((card) => [card.id, card]));
		let parent = row.card.parentId;
		while (parent) {
			if (collapsed[parent]) return true;
			parent = byId.get(parent)?.parentId ?? null;
		}
		return false;
	}

	const visibleRows = $derived.by(() =>
		allRows.filter((row: Row) => passesFilters(row) && !hasCollapsedAncestor(row))
	);

	const columns = $derived.by(() => {
		const cols: TimelineColumn[] = [];
		const base = startOfUnit(timelineAnchor, scale);
		let cursor = addUnit(base, scale, -CENTER_INDEX);
		for (let i = 0; i < COLUMN_COUNT; i += 1) {
			const next = addUnit(cursor, scale, 1);
			cols.push({ start: cursor, end: next, label: formatColumnLabel(cursor, scale) });
			cursor = next;
		}
		return cols;
	});

	const timelineWidth = $derived(Math.max(columns.length * columnWidth, 700));
	const rangeStartMs = $derived(columns[0]?.start.getTime() ?? Date.now());
	const rangeEndMs = $derived(columns[columns.length - 1]?.end.getTime() ?? Date.now() + DAY_MS);
	const rangeMs = $derived(Math.max(rangeEndMs - rangeStartMs, DAY_MS));

	function msToPx(ms: number): number {
		return ((ms - rangeStartMs) / rangeMs) * timelineWidth;
	}

	function pxToMs(clientX: number): number {
		if (!timelineViewport) return rangeStartMs;
		const rect = timelineViewport.getBoundingClientRect();
		const x = clientX - rect.left + timelineViewport.scrollLeft;
		const clamped = Math.max(0, Math.min(x, timelineWidth));
		return rangeStartMs + (clamped / timelineWidth) * rangeMs;
	}

	function getRowRange(row: Row): { startMs: number; endMs: number } | null {
		const startMs = parseDateMs(row.card.startDate);
		const endMs = parseDateMs(row.card.dueDate);
		if (startMs === null || endMs === null) return null;
		return {
			startMs: Math.min(startMs, endMs),
			endMs: Math.max(startMs, endMs)
		};
	}

	function getDisplayEndMs(endMs: number): number {
		return endMs + DAY_MS;
	}

	function toggleCollapse(row: Row) {
		collapsed = { ...collapsed, [row.card.id]: !collapsed[row.card.id] };
	}

	function beginRowDrag(listId: string, rowId: string, event: DragEvent) {
		const list = lists.find((entry) => entry.id === listId);
		if (!list) return;
		const rows = buildRows(
			[...list.cards].sort((a, b) => a.order - b.order),
			listId
		);
		const start = rows.findIndex((row) => row.card.id === rowId);
		if (start < 0) return;
		const rootLevel = rows[start].level;
		const subtreeIds = [rows[start].card.id];
		for (let i = start + 1; i < rows.length; i += 1) {
			if (rows[i].level <= rootLevel) break;
			subtreeIds.push(rows[i].card.id);
		}
		dragState = { listId, rootId: rowId, subtreeIds };
		event.dataTransfer?.setData('text/plain', rowId);
		event.dataTransfer!.effectAllowed = 'move';
	}

	function updateDropTarget(
		listId: string,
		targetId: string | null,
		position: 'before' | 'after',
		depth: number
	) {
		if (!dragState || dragState.listId !== listId) return;
		dropState = {
			listId,
			targetId,
			position,
			depth: Math.max(0, Math.min(depth, MAX_DEPTH))
		};
	}

	function applyRowDrop() {
		if (!dragState || !dropState || dragState.listId !== dropState.listId) return;
		const activeDrag = dragState;
		const activeDrop = dropState;
		const list = lists.find((entry) => entry.id === activeDrag.listId);
		if (!list) return;

		const rows = buildRows(
			[...list.cards].sort((a, b) => a.order - b.order),
			list.id
		);
		const byId = new Map(list.cards.map((card) => [card.id, card]));
		const draggedSet = new Set(activeDrag.subtreeIds);
		const remaining = rows.filter((row) => !draggedSet.has(row.card.id));

		let insertIndex = remaining.length;
		if (activeDrop.targetId) {
			const targetIndex = remaining.findIndex((row) => row.card.id === activeDrop.targetId);
			if (targetIndex >= 0) {
				insertIndex = activeDrop.position === 'after' ? targetIndex + 1 : targetIndex;
			}
		}

		let parentId: string | null = null;
		if (activeDrop.depth > 0) {
			for (let i = insertIndex - 1; i >= 0; i -= 1) {
				if (remaining[i].level <= activeDrop.depth - 1) {
					parentId = remaining[i].card.id;
					break;
				}
			}
		}

		const remainingIds = remaining.map((row) => row.card.id);
		remainingIds.splice(insertIndex, 0, ...activeDrag.subtreeIds);

		const nextCards = remainingIds
			.map((id, index) => {
				const card = byId.get(id);
				if (!card) return null;
				if (id === activeDrag.rootId) {
					return { ...card, order: index, parentId };
				}
				return { ...card, order: index };
			})
			.filter((card): card is ProjectTaskCard => card !== null);

		projectStore.replaceListCards(projectId, list.id, nextCards);
	}

	function finishRowDrop() {
		applyRowDrop();
		dragState = null;
		dropState = null;
	}

	function startTimelineCreate(row: Row, event: MouseEvent) {
		if ((event.target as HTMLElement).closest('[data-bar]')) return;
		const snapped = snapToDayMs(pxToMs(event.clientX));
		activeTimelineEdit = {
			type: 'create',
			listId: row.listId,
			cardId: row.card.id,
			startMs: snapped,
			currentMs: snapped,
			initialStartMs: null,
			initialEndMs: null
		};
	}

	function startTimelineResize(row: Row, edge: 'start' | 'end', event: MouseEvent) {
		const range = getRowRange(row);
		if (!range) return;
		event.stopPropagation();
		const snapped = snapToDayMs(pxToMs(event.clientX));
		activeTimelineEdit = {
			type: edge === 'start' ? 'resize-start' : 'resize-end',
			listId: row.listId,
			cardId: row.card.id,
			startMs: snapped,
			currentMs: snapped,
			initialStartMs: range.startMs,
			initialEndMs: range.endMs
		};
	}

	function startTimelineMove(row: Row, event: MouseEvent) {
		const range = getRowRange(row);
		if (!range) return;
		event.stopPropagation();
		const snapped = snapToDayMs(pxToMs(event.clientX));
		activeTimelineEdit = {
			type: 'move',
			listId: row.listId,
			cardId: row.card.id,
			startMs: snapped,
			currentMs: snapped,
			initialStartMs: range.startMs,
			initialEndMs: range.endMs
		};
	}

	function resolveEditRange(edit: ActiveTimelineEdit): { startMs: number; endMs: number } | null {
		if (edit.type === 'create') {
			return {
				startMs: Math.min(edit.startMs, edit.currentMs),
				endMs: Math.max(edit.startMs, edit.currentMs)
			};
		}

		if (edit.initialStartMs === null || edit.initialEndMs === null) {
			return null;
		}

		if (edit.type === 'resize-start') {
			return {
				startMs: Math.min(edit.currentMs, edit.initialEndMs),
				endMs: edit.initialEndMs
			};
		}

		if (edit.type === 'resize-end') {
			return {
				startMs: edit.initialStartMs,
				endMs: Math.max(edit.currentMs, edit.initialStartMs)
			};
		}

		const deltaDays = Math.round((edit.currentMs - edit.startMs) / DAY_MS);
		return {
			startMs: edit.initialStartMs + deltaDays * DAY_MS,
			endMs: edit.initialEndMs + deltaDays * DAY_MS
		};
	}

	function getPreviewRange(row: Row): { startMs: number; endMs: number } | null {
		const active = activeTimelineEdit;
		if (!active || active.cardId !== row.card.id || active.listId !== row.listId) {
			return getRowRange(row);
		}
		return resolveEditRange(active);
	}

	function commitTimelineEdit(edit: ActiveTimelineEdit) {
		const list = lists.find((entry) => entry.id === edit.listId);
		if (!list) return;
		const card = list.cards.find((entry) => entry.id === edit.cardId);
		if (!card) return;
		const range = resolveEditRange(edit);
		if (!range) return;

		projectStore.updateCard(projectId, list.id, card.id, {
			startDate: formatDayStartIso(range.startMs),
			dueDate: formatDayStartIso(range.endMs)
		});
	}

	function handleTimelineScroll() {
		if (!timelineViewport || rebasingScroll) return;
		const leftThreshold = columnWidth * 12;
		const rightThreshold = timelineWidth - timelineViewport.clientWidth - columnWidth * 12;

		if (timelineViewport.scrollLeft <= leftThreshold) {
			rebasingScroll = true;
			timelineAnchor = addUnit(timelineAnchor, scale, -SHIFT_COLUMNS);
			timelineViewport.scrollLeft += SHIFT_COLUMNS * columnWidth;
			requestAnimationFrame(() => {
				rebasingScroll = false;
			});
		} else if (timelineViewport.scrollLeft >= rightThreshold) {
			rebasingScroll = true;
			timelineAnchor = addUnit(timelineAnchor, scale, SHIFT_COLUMNS);
			timelineViewport.scrollLeft -= SHIFT_COLUMNS * columnWidth;
			requestAnimationFrame(() => {
				rebasingScroll = false;
			});
		}
	}

	function quickCreateCard() {
		const title = quickCreateTitle.trim();
		if (!title) return;
		const created = onCreateCard(selectedListId === 'all' ? null : selectedListId, title);
		if (created) {
			quickCreateTitle = '';
		}
	}

	async function jumpToToday() {
		timelineAnchor = startOfUnit(new Date(), scale);
		await tick();
		if (!timelineViewport) return;
		const todayPx = msToPx(toDayStartMs(Date.now()));
		timelineViewport.scrollLeft = Math.max(
			0,
			Math.min(todayPx - timelineViewport.clientWidth / 2 + columnWidth / 2, timelineWidth)
		);
	}

	$effect(() => {
		if (!activeTimelineEdit) return;

		const onMove = (event: MouseEvent) => {
			const active = activeTimelineEdit;
			if (!active) return;
			activeTimelineEdit = {
				...active,
				currentMs: snapToDayMs(pxToMs(event.clientX))
			};
		};
		const onUp = () => {
			if (activeTimelineEdit) {
				commitTimelineEdit(activeTimelineEdit);
			}
			activeTimelineEdit = null;
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp, { once: true });

		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	});

	$effect(() => {
		if (scale === lastScale) return;
		lastScale = scale;
		timelineReady = false;
	});

	$effect(() => {
		if (!timelineViewport || timelineReady) return;
		timelineReady = true;
		queueMicrotask(() => {
			jumpToToday();
		});
	});
</script>

<div class="flex min-h-0 flex-1 flex-col gap-3">
	<div class="flex flex-wrap items-center gap-2">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Aufgaben filtern..."
			class="h-9 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		/>
		<select
			bind:value={statusFilter}
			class="h-9 rounded-md border border-input bg-background px-3 text-sm"
		>
			<option value="all">Alle Status</option>
			<option value="open">Offen</option>
			<option value="done">Abgeschlossen</option>
		</select>
		<select
			bind:value={selectedListId}
			class="h-9 rounded-md border border-input bg-background px-3 text-sm"
		>
			<option value="all">Alle Listen</option>
			{#each lists as list (list.id)}
				<option value={list.id}>{list.name}</option>
			{/each}
		</select>
		<div class="ml-auto flex flex-wrap items-center gap-2">
			<select
				bind:value={scale}
				class="h-9 rounded-md border border-input bg-background px-3 text-sm"
			>
				<option value="day">Tage</option>
				<option value="week">Wochen</option>
				<option value="month">Monate</option>
				<option value="quarter">Quartale</option>
				<option value="year">Jahre</option>
			</select>
			<button
				type="button"
				class="rounded-md border border-border px-3 py-1.5 text-xs"
				onclick={jumpToToday}
			>
				Heute
			</button>
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<input
					type="range"
					min="44"
					max="220"
					step="2"
					bind:value={columnWidth}
					aria-label="Spaltenbreite"
				/>
			</div>
		</div>
	</div>

	<div class="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-card/40">
		<div class="grid h-full min-w-[980px] grid-cols-[420px_1fr]">
			<div class="flex min-h-0 flex-col border-r border-border">
				<div
					class="sticky top-0 z-20 grid grid-cols-[1fr] border-b border-border bg-card/95 px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur"
				>
					<span>Aufgabe</span>
				</div>
				<div class="min-h-0 flex-1 overflow-auto">
					{#if visibleRows.length === 0}
						<div class="p-4 text-sm text-muted-foreground">
							Keine Aufgaben für den aktuellen Filter.
						</div>
					{:else}
						{#each visibleRows as row (row.card.id)}
							<div
								role="listitem"
								class="grid h-10 grid-cols-[1fr] items-center border-b border-border/70 px-3 text-sm {dropState?.targetId ===
								row.card.id
									? 'bg-primary/10'
									: ''}"
								style={rowShade(row.level)}
								draggable={true}
								ondragstart={(event) => beginRowDrag(row.listId, row.card.id, event)}
								ondragover={(event) => {
									event.preventDefault();
									const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
									const position = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
									const depth = Math.round((event.clientX - rect.left - 24) / INDENT_STEP);
									updateDropTarget(row.listId, row.card.id, position, depth);
								}}
								ondrop={() => finishRowDrop()}
							>
								<div
									class="flex min-w-0 items-center gap-2"
									style={`padding-left: ${row.level * INDENT_STEP}px;`}
								>
									{#if row.hasChildren}
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground"
											onclick={() => toggleCollapse(row)}
											aria-label="Unteraufgaben ein-/ausblenden"
										>
											{#if collapsed[row.card.id]}
												<ChevronRight class="size-4" />
											{:else}
												<ChevronDown class="size-4" />
											{/if}
										</button>
									{:else}
										<span class="inline-block size-4"></span>
									{/if}
									<button
										type="button"
										class="text-muted-foreground hover:text-foreground"
										onclick={() => onToggleDone(row.listId, row.card.id)}
									>
										{#if row.card.done}
											<CircleCheckBig class="size-4" />
										{:else}
											<Circle class="size-4" />
										{/if}
									</button>
									<button
										type="button"
										class="min-w-0 truncate text-left {row.card.done
											? 'text-muted-foreground line-through'
											: ''}"
										onclick={() => onOpenCard(row.listId, row.card)}
									>
										{row.card.title}
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
				<div class="border-t border-border bg-card/95 p-3 backdrop-blur">
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={quickCreateTitle}
							placeholder="Aufgabe hinzufügen"
							onkeydown={(event) => {
								if (event.key !== 'Enter') return;
								event.preventDefault();
								quickCreateCard();
							}}
							class="h-8 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						/>
						<Button class="shrink-0" size="sm" variant="outline" onclick={quickCreateCard}>+</Button
						>
					</div>
				</div>
			</div>

			<div
				bind:this={timelineViewport}
				class="min-h-0 overflow-auto"
				onscroll={handleTimelineScroll}
			>
				<div
					style={`width: ${timelineWidth}px; min-height: 100%; background-image: linear-gradient(to right, hsl(var(--border) / 0.85) 1px, transparent 1px); background-size: ${columnWidth}px 100%;`}
				>
					<div
						class="sticky top-0 z-20 grid h-10 border-b border-border bg-card/95 text-xs text-muted-foreground backdrop-blur"
						style={`grid-template-columns: repeat(${columns.length}, minmax(0, 1fr));`}
					>
						{#each columns as column}
							<div class="flex items-center justify-center border-r border-border px-1">
								{column.label}
							</div>
						{/each}
					</div>
					{#if visibleRows.length === 0}
						<div class="p-4 text-sm text-muted-foreground">Keine Zeitleiste verfügbar.</div>
					{:else}
						{#each visibleRows as row (row.card.id)}
							<div
								role="presentation"
								class="relative h-10 border-b border-border/70"
								style={rowShade(row.level)}
								onmousedown={(event) => startTimelineCreate(row, event)}
							>
								{#if getPreviewRange(row)}
									{@const range = getPreviewRange(row)!}
									<div
										data-bar
										role="button"
										class="absolute top-1.5 h-7 cursor-move rounded-full border px-2 text-xs leading-7 text-amber-950"
										style={`${barShade(row.level, row.card.done)} left: ${msToPx(range.startMs)}px; width: ${Math.max(
											msToPx(getDisplayEndMs(range.endMs)) - msToPx(range.startMs),
											12
										)}px;`}
										onmousedown={(event) => startTimelineMove(row, event)}
									>
										<div class="truncate pr-2">{row.card.title}</div>
										<button
											type="button"
											data-bar
											class="absolute top-0 left-0 h-full w-2 cursor-ew-resize rounded-l-full bg-amber-500/70"
											onmousedown={(event) => startTimelineResize(row, 'start', event)}
											aria-label="Startzeit anpassen"
										></button>
										<button
											type="button"
											data-bar
											class="absolute top-0 right-0 h-full w-2 cursor-ew-resize rounded-r-full bg-amber-500/70"
											onmousedown={(event) => startTimelineResize(row, 'end', event)}
											aria-label="Endzeit anpassen"
										></button>
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
