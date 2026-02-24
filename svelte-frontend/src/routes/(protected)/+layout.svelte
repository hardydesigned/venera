<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import CreateTaskDialog from '$lib/features/tasks/create-task-dialog.svelte';
	import ToastContainer from '$lib/components/toast-container.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<CreateTaskDialog />
	<ToastContainer />
	<main class="h-screen w-full bg-background p-4 text-foreground">
		<img
			src="/background.png"
			alt="Venera"
			class="absolute top-0 left-0 h-full w-full object-cover opacity-30"
		/>
		{@render children()}
	</main>
</Sidebar.Provider>
