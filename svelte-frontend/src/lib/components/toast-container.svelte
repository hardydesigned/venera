<script lang="ts">
	import { toastStore } from '$lib/stores/toast-store';
	import { X } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const toasts = $derived($toastStore);
</script>

<div class="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-6">
	{#each toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all {toast.type ===
			'success'
				? 'border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
				: toast.type === 'error'
					? 'border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
					: 'border-blue-500/50 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100'}"
		>
			<p class="flex-1 text-sm font-medium">{toast.message}</p>

			{#if toast.action}
				<Button
					variant="ghost"
					size="sm"
					class="shrink-0"
					onclick={() => {
						toast.action?.onClick();
						toastStore.remove(toast.id);
					}}
				>
					{toast.action.label}
				</Button>
			{/if}

			<button
				class="text-current shrink-0 opacity-70 transition-opacity hover:opacity-100"
				onclick={() => toastStore.remove(toast.id)}
				aria-label="Schließen"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
