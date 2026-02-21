<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Badge, Button } from 'flowbite-svelte';
	import { authStore, clearAuth, setAuthInitialized, setAuthUser } from '$lib/auth/auth-store';
	import { fetchCurrentUser, logout as logoutRequest } from '$lib/api/auth';
	import './layout.css';

	const queryClient = new QueryClient();
	let { children } = $props();

	const PUBLIC_PATHS = ['/login', '/auth/callback'];
	const isPublicPath = $derived(PUBLIC_PATHS.some((p) => page.url.pathname.startsWith(p)));
	const isAuthenticated = $derived(!!$authStore.user);

	onMount(async () => {
		if (typeof window === 'undefined') return;
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

	const navItems = [
		{ href: '/inbox', label: 'Eingang' },
		{ href: '/projects', label: 'Projekte' },
		{ href: '/calendar', label: 'Kalender' }
	];

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
	<div class="min-h-screen bg-slate-50 text-slate-900">
		{#if !isPublicPath}
			<header class="border-b border-slate-200 bg-white">
				<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
					<div class="flex items-center gap-3">
						<h1 class="text-lg font-semibold">Venera</h1>
						<Badge color="blue">MVP</Badge>
					</div>
					<nav class="flex items-center gap-2">
						{#each navItems as item}
							<Button
								href={item.href}
								color={page.url.pathname.startsWith(item.href) ? 'dark' : 'light'}
								size="sm"
							>
								{item.label}
							</Button>
						{/each}
						<Button color="light" size="sm" onclick={logout}>Abmelden</Button>
					</nav>
				</div>
			</header>
		{/if}

		<main class="mx-auto w-full max-w-6xl px-4 py-6">
			{@render children()}
		</main>
	</div>
</QueryClientProvider>
