<script lang="ts">
	import { get } from 'svelte/store';
	import { createForm } from '@tanstack/svelte-form';
	import { Button, Card, Input, Label, Badge } from 'flowbite-svelte';
	import { inboxTasksQuery, createTaskMutation, deleteTaskMutation } from '$lib/features/tasks/queries';
	import type { CreateTaskInput, TaskPriorityCategory, TaskStatus } from '$lib/features/tasks/types';

	const today = new Date().toISOString().slice(0, 10);
	const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

	const tasks = inboxTasksQuery();
	const createMutation = createTaskMutation();
	const deleteMutation = deleteTaskMutation();

	const form = createForm(() => ({
		defaultValues: {
			title: '',
			description: '',
			startDate: today,
			dueDate: nextWeek,
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
			mut.mutate(input, { onSuccess: () => form.reset() });
		}
	}));

	const statusLabels: Record<TaskStatus, string> = {
		OPEN: 'Offen',
		IN_PROGRESS: 'In Arbeit',
		DONE: 'Erledigt',
		CANCELLED: 'Abgebrochen'
	};

	const categoryLabels: Record<TaskPriorityCategory, string> = {
		A: 'A (wichtig)',
		B: 'B',
		C: 'C'
	};
</script>

<svelte:head>
	<title>Eingang | Venera</title>
</svelte:head>

<section class="space-y-6">
	<header class="space-y-2">
		<h2 class="text-2xl font-semibold">Eingang</h2>
		<p class="text-sm text-slate-600">Schneller Capture-Bereich für neue To-dos.</p>
	</header>

	<Card>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			class="space-y-4"
		>
			<form.Field name="title" validators={{ onChange: ({ value }) => (!value?.trim() ? 'Titel erforderlich' : undefined) }}>
				{#snippet children(field)}
					<div>
						<Label for="title">Titel</Label>
						<Input
							id="title"
							type="text"
							placeholder="z. B. Angebot prüfen"
							value={field.state.value}
							onblur={() => field.handleBlur()}
							oninput={(e) => field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
						/>
						{#if field.state.meta.errors?.length}
							<p class="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="description">
				{#snippet children(field)}
					<div>
						<Label for="description">Beschreibung (optional)</Label>
						<Input
							id="description"
							type="text"
							placeholder="Details zur Aufgabe"
							value={field.state.value}
							onblur={() => field.handleBlur()}
							oninput={(e) => field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
						/>
					</div>
				{/snippet}
			</form.Field>

			<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
				<form.Field name="startDate">
					{#snippet children(field)}
						<div>
							<Label for="startDate">Start</Label>
							<Input
								id="startDate"
								type="date"
								value={field.state.value}
								onblur={() => field.handleBlur()}
								oninput={(e) => field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
							/>
						</div>
					{/snippet}
				</form.Field>
				<form.Field name="dueDate">
					{#snippet children(field)}
						<div>
							<Label for="dueDate">Fällig</Label>
							<Input
								id="dueDate"
								type="date"
								value={field.state.value}
								onblur={() => field.handleBlur()}
								oninput={(e) => field.handleChange((e.currentTarget as HTMLInputElement)?.value ?? '')}
							/>
						</div>
					{/snippet}
				</form.Field>
				<form.Field name="category">
					{#snippet children(field)}
						<div>
							<Label for="category">Priorität</Label>
							<select
								id="category"
								class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
								value={field.state.value}
								onblur={() => field.handleBlur()}
								onchange={(e) => field.handleChange((e.currentTarget as HTMLSelectElement).value as TaskPriorityCategory)}
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
						<div>
							<Label for="status">Status</Label>
							<select
								id="status"
								class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
								value={field.state.value}
								onblur={() => field.handleBlur()}
								onchange={(e) => field.handleChange((e.currentTarget as HTMLSelectElement).value as TaskStatus)}
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

			<form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
				>{#snippet children({ canSubmit, isSubmitting })}
					<Button type="submit" disabled={!canSubmit || isSubmitting}>
						{isSubmitting ? 'Wird erstellt…' : 'Aufgabe hinzufügen'}
					</Button>
				{/snippet}
			</form.Subscribe>
		</form>
	</Card>

	<div class="space-y-3">
		<h3 class="text-lg font-medium">Deine Aufgaben</h3>

		{#if $tasks.isLoading}
			<p class="text-sm text-slate-500">Lade Aufgaben…</p>
		{:else if $tasks.isError}
			<p class="text-sm text-red-600">Fehler beim Laden. Bist du eingeloggt? ({$tasks.error?.message})</p>
		{:else if $tasks.data?.length === 0}
			<Card>
				<p class="text-slate-600">Noch keine Aufgaben im Eingang.</p>
				<p class="mt-1 text-sm text-slate-500">Erstelle oben deine erste Aufgabe.</p>
			</Card>
		{:else}
			<ul class="space-y-2">
				{#each $tasks.data ?? [] as task (task.id)}
					<Card class="flex flex-row items-center justify-between gap-4">
						<div class="min-w-0 flex-1">
							<p class="font-medium">{task.title}</p>
							{#if task.description}
								<p class="mt-0.5 truncate text-sm text-slate-600">{task.description}</p>
							{/if}
							<div class="mt-2 flex flex-wrap gap-2">
								<Badge size="small" color="blue">{categoryLabels[task.category]}</Badge>
								<Badge size="small" color="gray">{statusLabels[task.status]}</Badge>
								<span class="text-xs text-slate-500"
									>bis {new Date(task.dueDate).toLocaleDateString('de-DE')}</span
								>
							</div>
						</div>
						<Button
							color="red"
							size="xs"
							onclick={() => get(deleteMutation).mutate(task.id)}
							disabled={$deleteMutation.isPending}
						>
							Löschen
						</Button>
					</Card>
				{/each}
			</ul>
		{/if}
	</div>
</section>
