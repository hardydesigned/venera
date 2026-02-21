<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Card } from 'flowbite-svelte';
	import { getApiBase } from '$lib/api/client';
	import { authStore } from '$lib/auth/auth-store';

	function loginWithGoogle() {
		const base = getApiBase();
		// Spring Security OAuth2: Redirect to backend, der wiederum zu Google weiterleitet
		window.location.href = `${base}/oauth2/authorization/google`;
	}

	// Wenn schon eingeloggt, zur Inbox
	$effect(() => {
		if (typeof window !== 'undefined' && $authStore.user) {
			goto('/inbox');
		}
	});
</script>

<svelte:head>
	<title>Login | Venera</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<Card class="w-full max-w-md">
		<div class="space-y-6 text-center">
			<div>
				<h1 class="text-2xl font-bold text-slate-900">Venera</h1>
				<p class="mt-1 text-sm text-slate-600">To-dos, Projekte, Kalender</p>
			</div>
			<p class="text-slate-600">Melde dich mit deinem Google-Konto an.</p>
			<Button class="w-full" size="lg" onclick={loginWithGoogle}>
				<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="currentColor"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="currentColor"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Mit Google anmelden
			</Button>
		</div>
	</Card>
</div>
