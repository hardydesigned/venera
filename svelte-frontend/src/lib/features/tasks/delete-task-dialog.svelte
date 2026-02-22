<script lang="ts">
	import { get } from 'svelte/store';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { deleteTaskMutation } from '$lib/features/tasks/queries';
	import type { Task } from '$lib/features/tasks/types';

	interface Props {
		open?: boolean;
		task?: Task | null;
		onOpenChange?: (open: boolean) => void;
	}

	let { open = $bindable(false), task = null, onOpenChange }: Props = $props();

	const deleteMutation = deleteTaskMutation();

	function handleConfirm() {
		if (!task) return;
		get(deleteMutation).mutate(task.id, {
			onSuccess: () => {
				open = false;
				onOpenChange?.(false);
			}
		});
	}
</script>

<Dialog.Root
	open={open}
	onOpenChange={(o: boolean) => {
		if (!o) {
			open = false;
			onOpenChange?.(false);
		}
	}}
>
	<Dialog.Content class="text-foreground sm:max-w-[380px]">
		<Dialog.Header>
			<Dialog.Title>Aufgabe löschen?</Dialog.Title>
			<Dialog.Description>
				{#if task}
					„{task.title}“ wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
				{:else}
					Diese Aktion kann nicht rückgängig gemacht werden. Die Aufgabe wird dauerhaft gelöscht.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex-row-reverse gap-2 pt-4">
			<Dialog.Close>
				{#snippet child({ props }: { props: Record<string, unknown> })}
					<Button {...props} variant="outline">Abbrechen</Button>
				{/snippet}
			</Dialog.Close>
			<Button variant="destructive" onclick={handleConfirm} disabled={$deleteMutation.isPending}>
				{$deleteMutation.isPending ? 'Wird gelöscht…' : 'Löschen'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
