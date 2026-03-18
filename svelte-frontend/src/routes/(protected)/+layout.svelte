<script lang="ts">
	import { useQueryClient } from '@tanstack/svelte-query';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import CreateTaskDialog from '$lib/features/tasks/create-task-dialog.svelte';
	import ToastContainer from '$lib/components/toast-container.svelte';
	import { teamScopeStore } from '$lib/features/teams/team-context-store';

	let { children } = $props();
	const queryClient = useQueryClient();
	const scope = $derived($teamScopeStore);
	let previousScopeKey = $state<string | null>(null);

	$effect(() => {
		const currentScopeKey = scope.type === 'team' ? `team:${scope.teamId}` : 'personal';
		if (previousScopeKey === null) {
			previousScopeKey = currentScopeKey;
			return;
		}
		if (previousScopeKey === currentScopeKey) {
			return;
		}
		previousScopeKey = currentScopeKey;
		queryClient.invalidateQueries({ queryKey: ['tasks'] });
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<CreateTaskDialog />
	<ToastContainer />
	<main class="h-screen w-full overflow-x-hidden bg-background p-4 text-foreground">
		<img
			src="/background.png"
			alt="Venera"
			class="absolute top-0 left-0 h-full w-full object-cover opacity-30"
		/>
		{@render children()}
	</main>
</Sidebar.Provider>
