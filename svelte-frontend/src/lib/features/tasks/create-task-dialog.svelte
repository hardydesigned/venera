<script lang="ts">
	import { get } from 'svelte/store';
	import { createForm } from '@tanstack/svelte-form';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { createTaskDialogStore } from './create-task-dialog-store';
	import { createTaskMutation, updateTaskMutation } from '$lib/features/tasks/queries';
	import type {
		CreateTaskInput,
		UpdateTaskInput,
		TaskPriorityCategory,
		TaskStatus
	} from '$lib/features/tasks/types';

	const today = new Date().toISOString().slice(0, 10);

	const createMutation = createTaskMutation();
	const updateMutation = updateTaskMutation();

	const dialogState = $derived($createTaskDialogStore);
	const isEdit = $derived(
		dialogState !== null && typeof dialogState === 'object' && dialogState.mode === 'edit'
	);
	const editTask = $derived(
		isEdit && dialogState !== null && typeof dialogState === 'object' ? dialogState.task : null
	);
	const isOpen = $derived(dialogState !== null);

	// Edit form state
	let editTitle = $state('');
	let editDescription = $state('');
	let editStartDate = $state(today);
	let editDueDate = $state('');
	let editCategory = $state<TaskPriorityCategory>('A');
	let editStatus = $state<TaskStatus>('OPEN');

	$effect(() => {
		const task = editTask;
		if (task) {
			editTitle = task.title;
			editDescription = task.description ?? '';
			editStartDate = task.startDate;
			editDueDate = task.dueDate;
			editCategory = task.category;
			editStatus = task.status;
		}
	});

	// Create form (TanStack)
	const form = createForm(() => ({
		defaultValues: {
			title: '',
			description: '',
			startDate: today,
			dueDate: '',
			category: 'A' as TaskPriorityCategory,
			status: 'OPEN' as TaskStatus
		},
		onSubmit: async ({ value }) => {
			const input: CreateTaskInput = {
				...value,
				title: value.title.trim(),
				description: value.description?.trim() ?? ''
			};
			if (!input.title) return;
			const mut = get(createMutation);
			mut.mutate(input);
			form.reset();
			createTaskDialogStore.close();
		}
	}));

	function submitEdit(e: Event) {
		e.preventDefault();
		if (!editTask || !editTitle.trim()) return;
		const input: UpdateTaskInput = {
			title: editTitle.trim(),
			description: editDescription.trim(),
			startDate: editStartDate,
			dueDate: editDueDate,
			category: editCategory,
			status: editStatus
		};
		get(updateMutation).mutate(
			{ id: editTask.id, input },
			{
				onSuccess: () => createTaskDialogStore.close()
			}
		);
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
	<Dialog.Content class="text-foreground sm:max-w-[425px]">
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
						<Input id="task-startDate" type="date" bind:value={editStartDate} />
					</div>
					<div class="grid gap-2">
						<Label for="task-dueDate">Fällig</Label>
						<Input id="task-dueDate" type="date" bind:value={editDueDate} />
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
				<Dialog.Footer class="pt-4">
					<Dialog.Close>
						{#snippet child({ props }: { props: Record<string, unknown> })}
							<Button {...props} variant="outline">Abbrechen</Button>
						{/snippet}
					</Dialog.Close>
					<Button type="submit" disabled={$updateMutation.isPending}>
						{$updateMutation.isPending ? 'Wird gespeichert…' : 'Speichern'}
					</Button>
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
									type="date"
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
									type="date"
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
