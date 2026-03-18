<script lang="ts">
	import { get } from 'svelte/store';
	import { createForm } from '@tanstack/svelte-form';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { createTaskDialogStore } from './create-task-dialog-store';
	import {
		createTaskMutation,
		updateTaskMutation,
		deleteTaskMutation,
		batchCreateTasksMutation
	} from '$lib/features/tasks/queries';
	import type {
		CreateTaskInput,
		UpdateTaskInput,
		TaskPriorityCategory,
		TaskStatus
	} from '$lib/features/tasks/types';
	import {
		generateRecurringTasks,
		type RecurrenceFrequency
	} from '$lib/features/calendar/recurring-utils';
	import { saveTaskTime } from '$lib/features/calendar/task-time-store';
	import { toastStore } from '$lib/stores/toast-store';

	const today = new Date().toISOString().slice(0, 10);

	const createMutation = createTaskMutation();
	const updateMutation = updateTaskMutation();
	const deleteMutation = deleteTaskMutation();
	const batchMutation = batchCreateTasksMutation();

	let isRecurring = $state(false);
	let recurringFrequency = $state<RecurrenceFrequency>('weekly');
	let recurringOccurrences = $state(4);

	const dialogState = $derived($createTaskDialogStore);
	const isEdit = $derived(
		dialogState !== null && typeof dialogState === 'object' && dialogState.mode === 'edit'
	);
	const editTask = $derived(
		dialogState !== null && typeof dialogState === 'object' && dialogState.mode === 'edit'
			? dialogState.task
			: null
	);
	const isOpen = $derived(dialogState !== null);
	const prefilledDate = $derived(
		dialogState !== null &&
			typeof dialogState === 'object' &&
			dialogState.mode === 'create' &&
			'date' in dialogState
			? dialogState.date
			: null
	);

	// Edit form state
	let editTitle = $state('');
	let editDescription = $state('');
	let editStartDate = $state(`${today}T00:00`);
	let editDueDate = $state('');
	let editCategory = $state<TaskPriorityCategory>('A');
	let editStatus = $state<TaskStatus>('OPEN');
	let editEstimatedDuration = $state('');
	let editActualDuration = $state('');

	function parseDurationMinutes(raw: string | number | null | undefined): number | null {
		if (raw === null || raw === undefined) return null;
		const normalized = typeof raw === 'string' ? raw.trim() : String(raw);
		if (!normalized) return null;
		const value = Number(normalized);
		if (!Number.isFinite(value) || value < 0) return null;
		return Math.round(value);
	}

	function toDateTimeLocal(dateStr: string, defaultTime: string = '00:00'): string {
		if (!dateStr) return '';
		// If already in datetime format (contains 'T'), just take the datetime part
		if (dateStr.includes('T')) {
			return dateStr.slice(0, 16);
		}
		// Otherwise it's a date-only string, append default time
		return `${dateStr}T${defaultTime}`;
	}

	$effect(() => {
		const task = editTask;
		if (task) {
			editTitle = task.title;
			editDescription = task.description ?? '';
			// Convert date/datetime strings to datetime-local format
			editStartDate = toDateTimeLocal(task.startDate, '00:00');
			editDueDate = toDateTimeLocal(task.dueDate, '23:59');
			editCategory = task.category;
			editStatus = task.status;
			editEstimatedDuration =
				task.estimatedDurationMinutes === null ? '' : String(task.estimatedDurationMinutes);
			editActualDuration = task.actualDurationMinutes === null ? '' : String(task.actualDurationMinutes);
		}
	});

	// Get pending time from drag-to-create
	function getPendingTimeDefaults(): { startDate: string; dueDate: string } {
		// Only access window in browser
		if (typeof window !== 'undefined') {
			const pendingTime = (window as any).__pendingTaskTime;
			if (pendingTime && prefilledDate) {
				return {
					startDate: `${prefilledDate}T${pendingTime.startTime}`,
					dueDate: `${prefilledDate}T${pendingTime.endTime}`
				};
			}
		}
		return {
			startDate: prefilledDate ? `${prefilledDate}T00:00` : `${today}T00:00`,
			dueDate: prefilledDate ? `${prefilledDate}T23:59` : ''
		};
	}

	// Create form (TanStack)
	const form = createForm(() => {
		const timeDefaults = getPendingTimeDefaults();
		return {
			defaultValues: {
				title: '',
				description: '',
				startDate: timeDefaults.startDate,
				dueDate: timeDefaults.dueDate,
				category: 'A' as TaskPriorityCategory,
				status: 'OPEN' as TaskStatus,
				estimatedDurationMinutes: '',
				actualDurationMinutes: ''
			},
			onSubmit: async ({ value }) => {
			// Convert datetime-local format to ISO datetime strings
			const startDateTime = value.startDate ? `${value.startDate}:00` : '';
			const dueDateTime = value.dueDate ? `${value.dueDate}:00` : '';

			const input: CreateTaskInput = {
				...value,
				title: value.title.trim(),
				description: value.description?.trim() ?? '',
				startDate: startDateTime,
				dueDate: dueDateTime,
				estimatedDurationMinutes: parseDurationMinutes(value.estimatedDurationMinutes),
				actualDurationMinutes: parseDurationMinutes(value.actualDurationMinutes)
			};
			if (!input.title) return;

			if (isRecurring) {
				// Create recurring tasks
				const tasks = generateRecurringTasks({
					title: input.title,
					description: input.description,
					startDate: input.startDate,
					frequency: recurringFrequency,
					occurrences: recurringOccurrences,
					category: input.category,
					status: input.status,
					estimatedDurationMinutes: input.estimatedDurationMinutes,
					actualDurationMinutes: input.actualDurationMinutes
				});
				const mut = get(batchMutation);
				mut.mutate(tasks);
			} else {
				// Create single task
				const mut = get(createMutation);
				mut.mutate(input, {
					onSuccess: (createdTask) => {
						// Save time if it was set via drag-to-create
						if (typeof window !== 'undefined') {
							const pendingTime = (window as any).__pendingTaskTime;
							if (pendingTime && createdTask?.id) {
								saveTaskTime(createdTask.id, pendingTime.startTime, pendingTime.endTime);
								delete (window as any).__pendingTaskTime;
							}
						}
					}
				});
			}

			form.reset();
			isRecurring = false;
			createTaskDialogStore.close();
		}
		};
	});

	// Reset form when dialog opens with prefilled date
	$effect(() => {
		if (prefilledDate && !isEdit && typeof window !== 'undefined') {
			const pendingTime = (window as any).__pendingTaskTime;
			const startDate = pendingTime
				? `${prefilledDate}T${pendingTime.startTime}`
				: `${prefilledDate}T00:00`;
			const dueDate = pendingTime
				? `${prefilledDate}T${pendingTime.endTime}`
				: `${prefilledDate}T23:59`;

			form.reset();
			form.setFieldValue('startDate', startDate);
			form.setFieldValue('dueDate', dueDate);
		}
	});

	function submitEdit(e: Event) {
		e.preventDefault();
		if (!editTask || !editTitle.trim()) return;

		if (editTask.id.startsWith('project-card-')) {
			const bridge = (window as any).__projectCardDialogBridge as
				| {
						updateCard?: (
							cardId: string,
							input: {
								title: string;
								description: string;
								done: boolean;
								startDate: string;
								dueDate: string;
							}
						) => void;
					}
				| undefined;
			const cardId = editTask.id.replace('project-card-', '');
			bridge?.updateCard?.(cardId, {
				title: editTitle.trim(),
				description: editDescription.trim(),
				done: editStatus === 'DONE',
				startDate: editStartDate ? `${editStartDate}:00` : '',
				dueDate: editDueDate ? `${editDueDate}:00` : ''
			});
			createTaskDialogStore.close();
			return;
		}

		// Convert datetime-local format to ISO datetime strings
		const startDateTime = editStartDate ? `${editStartDate}:00` : '';
		const dueDateTime = editDueDate ? `${editDueDate}:00` : '';

		const input: UpdateTaskInput = {
			title: editTitle.trim(),
			description: editDescription.trim(),
			startDate: startDateTime,
			dueDate: dueDateTime,
			category: editCategory,
			status: editStatus,
			estimatedDurationMinutes: parseDurationMinutes(editEstimatedDuration),
			actualDurationMinutes: parseDurationMinutes(editActualDuration)
		};
		get(updateMutation).mutate(
			{ id: editTask.id, input },
			{
				onSuccess: () => createTaskDialogStore.close()
			}
		);
	}

	function handleDelete() {
		if (!editTask) return;

		if (editTask.id.startsWith('project-card-')) {
			const bridge = (window as any).__projectCardDialogBridge as
				| {
						deleteCard?: (cardId: string) => void;
					}
				| undefined;
			const cardId = editTask.id.replace('project-card-', '');
			bridge?.deleteCard?.(cardId);
			createTaskDialogStore.close();
			return;
		}

		// Store task data for undo functionality
		const taskToRestore: CreateTaskInput = {
			title: editTask.title,
			description: editTask.description ?? '',
			startDate: editTask.startDate,
			dueDate: editTask.dueDate,
			category: editTask.category,
			status: editTask.status,
			estimatedDurationMinutes: editTask.estimatedDurationMinutes,
			actualDurationMinutes: editTask.actualDurationMinutes
		};

		// Delete immediately
		get(deleteMutation).mutate(editTask.id, {
			onSuccess: () => {
				createTaskDialogStore.close();

				// Show toast with undo action
				toastStore.success('Aufgabe gelöscht', {
					label: 'Rückgängig machen',
					onClick: () => {
						// Recreate the task
						get(createMutation).mutate(taskToRestore);
					}
				});
			}
		});
	}

	const statusLabels: Record<TaskStatus, string> = {
		OPEN: 'Offen',
		IN_PROGRESS: 'In Arbeit',
		DONE: 'Erledigt',
		CANCELLED: 'Abgebrochen'
	};

	const categoryLabels: Record<TaskPriorityCategory, string> = {
		A: 'A',
		B: 'B',
		C: 'C'
	};

	const selectClass =
		'border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
</script>

<Dialog.Root open={isOpen} onOpenChange={(open: boolean) => !open && createTaskDialogStore.close()}>
	<Dialog.Content class="text-foreground sm:max-w-[425px] z-100">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</Dialog.Title>
			<Dialog.Description>
				{isEdit
					? 'Ändere Titel, Frist oder Status. Speichern übernimmt die Änderungen.'
					: 'Erfasse Titel, Frist und Priorität. Die Aufgabe landet in deinem Eingang.'}
			</Dialog.Description>
		</Dialog.Header>

		{#if isEdit}
			<form onsubmit={submitEdit} class="grid gap-4 pt-4">
				<div class="grid gap-2">
					<Label for="task-title">Titel</Label>
					<Input id="task-title" type="text" placeholder="Titel" bind:value={editTitle} />
				</div>
				<div class="grid gap-2">
					<Label for="task-description">Beschreibung (optional)</Label>
					<Input
						id="task-description"
						type="text"
						placeholder="Details"
						bind:value={editDescription}
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="task-startDate">Start</Label>
						<Input id="task-startDate" type="datetime-local" bind:value={editStartDate} />
					</div>
					<div class="grid gap-2">
						<Label for="task-dueDate">Fällig</Label>
						<Input id="task-dueDate" type="datetime-local" bind:value={editDueDate} />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="task-estimatedDuration">Dauerschätzung (Min)</Label>
						<Input
							id="task-estimatedDuration"
							type="number"
							min="0"
							step="1"
							placeholder="z. B. 60"
							bind:value={editEstimatedDuration}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="task-actualDuration">Tatsächliche Dauer (Min)</Label>
						<Input
							id="task-actualDuration"
							type="number"
							min="0"
							step="1"
							placeholder="z. B. 45"
							bind:value={editActualDuration}
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="task-category">Priorität</Label>
						<select id="task-category" class={selectClass} bind:value={editCategory}>
							<option value="A">{categoryLabels.A}</option>
							<option value="B">{categoryLabels.B}</option>
							<option value="C">{categoryLabels.C}</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="task-status">Status</Label>
						<select id="task-status" class={selectClass} bind:value={editStatus}>
							<option value="OPEN">{statusLabels.OPEN}</option>
							<option value="IN_PROGRESS">{statusLabels.IN_PROGRESS}</option>
							<option value="DONE">{statusLabels.DONE}</option>
							<option value="CANCELLED">{statusLabels.CANCELLED}</option>
						</select>
					</div>
				</div>
				<Dialog.Footer class="flex items-center justify-between pt-4">
					<Button
						type="button"
						variant="destructive"
						size="sm"
						onclick={handleDelete}
						disabled={$deleteMutation.isPending}
					>
						{$deleteMutation.isPending ? 'Wird gelöscht…' : 'Löschen'}
					</Button>
					<div class="flex gap-2">
						<Dialog.Close>
							{#snippet child({ props }: { props: Record<string, unknown> })}
								<Button {...props} variant="outline">Abbrechen</Button>
							{/snippet}
						</Dialog.Close>
						<Button type="submit" disabled={$updateMutation.isPending}>
							{$updateMutation.isPending ? 'Wird gespeichert…' : 'Speichern'}
						</Button>
					</div>
				</Dialog.Footer>
			</form>
		{:else}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				class="grid gap-4 pt-4"
			>
				<form.Field
					name="title"
					validators={{
						onChange: ({ value }) => (!value?.trim() ? 'Titel erforderlich' : undefined)
					}}
				>
					{#snippet children(field)}
						<div class="grid gap-2">
							<Label for="global-create-title">Titel</Label>
							<Input
								id="global-create-title"
								type="text"
								placeholder="z. B. Angebot prüfen"
								value={field.state.value}
								onblur={() => field.handleBlur()}
								oninput={(e) =>
									field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
							/>
							{#if field.state.meta.errors?.length}
								<p class="text-sm text-destructive">{field.state.meta.errors[0]}</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>
				<form.Field name="description">
					{#snippet children(field)}
						<div class="grid gap-2">
							<Label for="global-create-description">Beschreibung (optional)</Label>
							<Input
								id="global-create-description"
								type="text"
								placeholder="Details zur Aufgabe"
								value={field.state.value}
								onblur={() => field.handleBlur()}
								oninput={(e) =>
									field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
							/>
						</div>
					{/snippet}
				</form.Field>
				<div class="grid grid-cols-2 gap-4">
					<form.Field name="startDate">
						{#snippet children(field)}
							<div class="grid gap-2">
								<Label for="global-create-startDate">Start</Label>
								<Input
									id="global-create-startDate"
									type="datetime-local"
									value={field.state.value}
									onblur={() => field.handleBlur()}
									oninput={(e) =>
										field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
								/>
							</div>
						{/snippet}
					</form.Field>
					<form.Field name="dueDate">
						{#snippet children(field)}
							<div class="grid gap-2">
								<Label for="global-create-dueDate">Fällig</Label>
								<Input
									id="global-create-dueDate"
									type="datetime-local"
									value={field.state.value}
									onblur={() => field.handleBlur()}
									oninput={(e) =>
										field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
								/>
							</div>
						{/snippet}
					</form.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<form.Field name="category">
						{#snippet children(field)}
							<div class="grid gap-2">
								<Label for="global-create-category">Priorität</Label>
								<select
									id="global-create-category"
									class={selectClass}
									value={field.state.value}
									onblur={() => field.handleBlur()}
									onchange={(e) =>
										field.handleChange(
											(e.currentTarget as HTMLSelectElement).value as TaskPriorityCategory
										)}
								>
									<option value="A">{categoryLabels.A}</option>
									<option value="B">{categoryLabels.B}</option>
									<option value="C">{categoryLabels.C}</option>
								</select>
							</div>
						{/snippet}
					</form.Field>
					<form.Field name="status">
						{#snippet children(field)}
							<div class="grid gap-2">
								<Label for="global-create-status">Status</Label>
								<select
									id="global-create-status"
									class={selectClass}
									value={field.state.value}
									onblur={() => field.handleBlur()}
									onchange={(e) =>
										field.handleChange((e.currentTarget as HTMLSelectElement).value as TaskStatus)}
								>
									<option value="OPEN">{statusLabels.OPEN}</option>
									<option value="IN_PROGRESS">{statusLabels.IN_PROGRESS}</option>
									<option value="DONE">{statusLabels.DONE}</option>
									<option value="CANCELLED">{statusLabels.CANCELLED}</option>
								</select>
							</div>
						{/snippet}
					</form.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<form.Field name="estimatedDurationMinutes">
						{#snippet children(field)}
							<div class="grid gap-2">
								<Label for="global-create-estimatedDuration">Dauerschätzung (Min)</Label>
								<Input
									id="global-create-estimatedDuration"
									type="number"
									min="0"
									step="1"
									placeholder="z. B. 60"
									value={field.state.value}
									onblur={() => field.handleBlur()}
									oninput={(e) =>
										field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
								/>
							</div>
						{/snippet}
					</form.Field>
					<form.Field name="actualDurationMinutes">
						{#snippet children(field)}
							<div class="grid gap-2">
								<Label for="global-create-actualDuration">Tatsächliche Dauer (Min)</Label>
								<Input
									id="global-create-actualDuration"
									type="number"
									min="0"
									step="1"
									placeholder="z. B. 45"
									value={field.state.value}
									onblur={() => field.handleBlur()}
									oninput={(e) =>
										field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
								/>
							</div>
						{/snippet}
					</form.Field>
				</div>

				<!-- Recurring Task Option -->
				<div class="border-border space-y-3 rounded-md border p-3">
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							id="recurring-checkbox"
							bind:checked={isRecurring}
							class="border-input h-4 w-4 rounded border"
						/>
						<Label for="recurring-checkbox" class="cursor-pointer font-medium">
							Wiederholen
						</Label>
					</div>

					{#if isRecurring}
						<div class="grid grid-cols-2 gap-3">
							<div class="grid gap-2">
								<Label for="recurring-frequency" class="text-sm">Frequenz</Label>
								<select
									id="recurring-frequency"
									class={selectClass}
									bind:value={recurringFrequency}
								>
									<option value="daily">Täglich</option>
									<option value="weekly">Wöchentlich</option>
									<option value="monthly">Monatlich</option>
								</select>
							</div>
							<div class="grid gap-2">
								<Label for="recurring-occurrences" class="text-sm">Anzahl</Label>
								<Input
									id="recurring-occurrences"
									type="number"
									min="1"
									max="52"
									bind:value={recurringOccurrences}
								/>
							</div>
						</div>
					{/if}
				</div>

				<Dialog.Footer class="pt-4">
					<Dialog.Close>
						{#snippet child({ props }: { props: Record<string, unknown> })}
							<Button {...props} variant="outline">Abbrechen</Button>
						{/snippet}
					</Dialog.Close>
					<form.Subscribe
						selector={(state) => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting
						})}
					>
						{#snippet children({ canSubmit, isSubmitting })}
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? 'Wird erstellt…' : 'Erstellen'}
							</Button>
						{/snippet}
					</form.Subscribe>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
