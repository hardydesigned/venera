<script lang="ts">
	import type { Task } from '$lib/features/tasks/types';
	import { getPriorityColor, formatShortDate } from './calendar-utils';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';

	interface Props {
		task: Task;
		variant?: 'compact' | 'normal' | 'detailed';
		draggable?: boolean;
		class?: string;
	}

	let { task, variant = 'normal', draggable = false, class: className = '' }: Props = $props();

	const colorClasses = $derived(getPriorityColor(task.category));

	function handleClick() {
		createTaskDialogStore.openForEdit(task);
	}

	function handleDragStart(e: DragEvent) {
		if (!draggable) return;
		e.dataTransfer!.effectAllowed = 'move';
		e.dataTransfer!.setData('application/json', JSON.stringify(task));
	}
</script>

{#if variant === 'compact'}
	<button
		class="flex items-center gap-2 overflow-hidden rounded-md border px-2 py-1 text-xs transition-colors hover:opacity-80 {colorClasses} {className}"
		onclick={handleClick}
		ondragstart={handleDragStart}
		{draggable}
		tabindex={0}
		aria-label={`Aufgabe: ${task.title}`}
	>
		<span class="min-w-0 truncate font-medium">{task.title}</span>
	</button>
{:else if variant === 'normal'}
	<button
		class="flex flex-col gap-1 overflow-hidden rounded-md border px-3 py-2 text-left text-sm transition-colors hover:opacity-80 {colorClasses} {className}"
		onclick={handleClick}
		ondragstart={handleDragStart}
		{draggable}
		tabindex={0}
		aria-label={`Aufgabe: ${task.title}`}
	>
		<div class="flex items-center justify-between gap-2 min-w-0">
			<span class="min-w-0 truncate font-semibold">{task.title}</span>
			<span class="shrink-0 text-xs opacity-75">{task.category}</span>
		</div>
		{#if task.description}
			<p class="line-clamp-2 min-w-0 text-xs opacity-90">{task.description}</p>
		{/if}
	</button>
{:else if variant === 'detailed'}
	<button
		class="flex flex-col gap-2 overflow-hidden rounded-lg border px-4 py-3 text-left transition-colors hover:opacity-80 {colorClasses} {className}"
		onclick={handleClick}
		ondragstart={handleDragStart}
		{draggable}
		tabindex={0}
		aria-label={`Aufgabe: ${task.title}`}
	>
		<div class="flex items-start justify-between gap-2 min-w-0">
			<h3 class="min-w-0 flex-1 truncate font-semibold">{task.title}</h3>
			<span
				class="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold opacity-90"
				aria-label={`Priorität ${task.category}`}
			>
				{task.category}
			</span>
		</div>
		{#if task.description}
			<p class="line-clamp-2 min-w-0 text-sm opacity-90">{task.description}</p>
		{/if}
		<div class="flex items-center gap-4 text-xs opacity-75">
			{#if task.startDate}
				<span class="truncate">Start: {formatShortDate(task.startDate)}</span>
			{/if}
			{#if task.dueDate}
				<span class="truncate">Fällig: {formatShortDate(task.dueDate)}</span>
			{/if}
		</div>
	</button>
{/if}
