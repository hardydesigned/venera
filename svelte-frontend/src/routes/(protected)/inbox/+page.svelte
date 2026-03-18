<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		inboxTasksQuery,
		createTaskMutation,
		deleteTaskMutation,
		updateTaskMutation
	} from '$lib/features/tasks/queries';
	import type {
		TaskPriorityCategory,
		Task,
		CreateTaskInput,
		TaskStatus
	} from '$lib/features/tasks/types';
	import { createTaskDialogStore } from '$lib/features/tasks/create-task-dialog-store';
	import { playTaskSuccessSound } from '$lib/features/tasks/task-sound';
	import { TrashIcon, PlusIcon, Circle, CircleCheckBig } from '@lucide/svelte';
	import { toastStore } from '$lib/stores/toast-store';
	import { get } from 'svelte/store';

	const tasks = inboxTasksQuery();
	const createMutation = createTaskMutation();
	const deleteMutation = deleteTaskMutation();
	const updateMutation = updateTaskMutation();
	const tasksList = $derived($tasks.data ?? []);

	const categoryLabels: Record<TaskPriorityCategory, string> = {
		A: 'A',
		B: 'B',
		C: 'C'
	};

	function handleDelete(task: Task) {
		const taskToRestore: CreateTaskInput = {
			title: task.title,
			description: task.description ?? '',
			startDate: task.startDate,
			dueDate: task.dueDate,
			category: task.category,
			status: task.status,
			estimatedDurationMinutes: task.estimatedDurationMinutes,
			actualDurationMinutes: task.actualDurationMinutes
		};

		get(deleteMutation).mutate(task.id, {
			onSuccess: () => {
				toastStore.success('Aufgabe gelöscht', {
					label: 'Rückgängig machen',
					onClick: () => {
						get(createMutation).mutate(taskToRestore);
					}
				});
			}
		});
	}

	function toggleDone(task: Task, checked: boolean) {
		const nextStatus: TaskStatus = checked ? 'DONE' : 'OPEN';
		if (checked) {
			playTaskSuccessSound();
		}
		get(updateMutation).mutate({
			id: task.id,
			input: {
				title: task.title,
				description: task.description ?? '',
				startDate: task.startDate,
				dueDate: task.dueDate,
				category: task.category,
				status: nextStatus,
				estimatedDurationMinutes: task.estimatedDurationMinutes,
				actualDurationMinutes: task.actualDurationMinutes
			}
		});
	}
</script>

<svelte:head>
	<title>Eingang - Venera</title>
</svelte:head>

<section class="flex h-full w-full flex-col py-4">
	<div class="z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
		<header class="space-y-1 pb-1">
			<h2 class="text-2xl font-semibold">Eingang</h2>
		</header>

		{#if $tasks.isLoading}
			<div class="space-y-3 py-4">
				<p class="text-sm text-muted-foreground">Lade Aufgaben…</p>
			</div>
		{:else if $tasks.isError}
			<div class="space-y-3 py-4">
				<p class="text-sm text-destructive">
					Fehler beim Laden. Bist du eingeloggt? ({$tasks.error?.message})
				</p>
			</div>
		{:else if tasksList.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center py-8">
				<div
					class="mx-auto max-w-2xl rounded-lg border border-border p-4 text-center text-foreground shadow-sm"
				>
					<p>Noch keine Aufgaben im Eingang.</p>
					<p class="mt-1 text-sm">
						Klicke in der Sidebar auf „Aufgabe hinzufügen“, um deine erste Aufgabe anzulegen.
					</p>
				</div>
			</div>
		{:else}
			<div class="max-h-[calc(100vh-3rem)] space-y-3 overflow-y-auto py-4">
				<ul class="space-y-2">
					{#each tasksList as task (task.id)}
						<li
							class="flex flex-row items-center justify-between gap-3 rounded-lg border border-border bg-card/30 p-4 shadow-sm"
						>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground cursor-pointer"
								onclick={() => toggleDone(task, task.status !== 'DONE')}
								aria-label={`Aufgabe ${task.title} abhaken`}
							>
								{#if task.status === 'DONE'}
									<CircleCheckBig class="size-4" />
								{:else}
									<Circle class="size-4" />
								{/if}
							</button>
							<button
								type="button"
								class="-m-2 min-w-0 flex-1 cursor-pointer rounded-md p-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline {task.status ===
								'DONE'
									? 'opacity-60'
									: ''}"
								onclick={() => createTaskDialogStore.openForEdit(task)}
							>
								<p class="truncate font-medium {task.status === 'DONE' ? 'line-through' : ''}">
									{task.title}
								</p>
								{#if task.description}
									<p class="mt-0.5 truncate text-sm text-muted-foreground">{task.description}</p>
								{/if}
								<div class="mt-2 flex flex-wrap items-center gap-2">
									<span
										class="inline-flex items-center rounded-md border border-transparent bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
									>
										{categoryLabels[task.category]}
									</span>
									{#if task.dueDate}
										<span class="text-xs text-muted-foreground">
											bis {new Date(task.dueDate).toLocaleDateString('de-DE')}
										</span>
									{/if}
								</div>
							</button>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => handleDelete(task)}
								disabled={$deleteMutation.isPending}
								aria-label="Aufgabe löschen"
							>
								<TrashIcon />
							</Button>
						</li>
					{/each}
				</ul>
				<Button variant="ghost" class="justify-start" onclick={() => createTaskDialogStore.open()}>
					<PlusIcon class="size-4" />
					Aufgabe hinzufügen
				</Button>
			</div>
		{/if}
	</div>
</section>
