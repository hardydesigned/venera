<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { setAuthUser, clearAuth } from '$lib/auth/auth-store';
	import { fetchCurrentUser } from '$lib/api/auth';
	import type { AuthUser } from '$lib/auth/auth-store';

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let errorMessage = $state('');

	onMount(() => {
		void completeLogin();
	});

	async function completeLogin() {
		try {
			const user = readUserFromHash();
			if (user) {
				setAuthUser(user);
			} else {
				const currentUser = await fetchCurrentUser();
				if (!currentUser) {
					throw new Error('Keine Authentifizierung gefunden.');
				}
				setAuthUser(currentUser);
			}
			status = 'success';
			window.history.replaceState(null, '', window.location.pathname);
			goto('/inbox');
		} catch (e) {
			clearAuth();
			status = 'error';
			errorMessage = e instanceof Error ? e.message : 'Unbekannter Fehler beim Login.';
		}
	}

	function readUserFromHash(): AuthUser | null {
		const hash = window.location.hash?.slice(1);
		if (!hash) return null;
		const params = new URLSearchParams(hash);
		const userEncoded = params.get('user');
		if (!userEncoded) return null;
		const userJson = decodeURIComponent(userEncoded);
		const userData = JSON.parse(userJson);
		return {
			id: userData.id,
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			active: userData.active ?? true,
			onboardingCompleted: userData.onboardingCompleted ?? false
		};
	}
</script>

<svelte:head>
	<title>Anmeldung | Venera</title>
</svelte:head>

<div class="flex min-h-[40vh] items-center justify-center">
	{#if status === 'loading'}
		<div class="flex flex-col items-center gap-4">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
			<p class="text-slate-600">Anmeldung wird abgeschlossen…</p>
		</div>
	{:else if status === 'error'}
		<div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
			<p class="font-medium text-red-800">Fehler bei der Anmeldung</p>
			<p class="mt-2 text-sm text-red-700">{errorMessage}</p>
			<a href="/login" class="mt-4 inline-block text-sm text-blue-600 hover:underline">Zurück zur Anmeldung</a>
		</div>
	{/if}
</div>
