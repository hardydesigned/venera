<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Badge, Button } from 'flowbite-svelte';
	import { authStore, clearAuth, setAuthInitialized, setAuthUser } from '$lib/auth/auth-store';
	import { fetchCurrentUser, logout as logoutRequest } from '$lib/api/auth';
	import { initThemeSync } from '$lib/theme/theme-store';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import './layout.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import CreateTaskDialog from '$lib/features/tasks/create-task-dialog.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	const queryClient = new QueryClient();
	let { children } = $props();

	const PUBLIC_PATHS = ['/login', '/auth/callback'];
	const isPublicPath = $derived(PUBLIC_PATHS.some((p) => page.url.pathname.startsWith(p)));
	const isAuthenticated = $derived(!!$authStore.user);

	onMount(async () => {
		if (typeof window === 'undefined') return;
		initThemeSync();
		if ($authStore.initialized) return;
		if (isPublicPath) {
			setAuthInitialized();
			return;
		}
		try {
			const user = await fetchCurrentUser();
			if (user) {
				setAuthUser(user);
			} else {
				setAuthInitialized();
			}
		} catch {
			setAuthInitialized();
		}
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (!isPublicPath && $authStore.initialized && !isAuthenticated) {
			goto('/login', { replaceState: true });
		}
	});

	async function logout() {
		try {
			await logoutRequest();
		} catch {
			// ignore and clear client state anyway
		}
		clearAuth();
		goto('/login');
	}
</script>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
