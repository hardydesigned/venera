<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
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
	<img src="/background.png" alt="Venera" class="absolute top-0 left-0 w-full h-full object-cover" />
		<div class="z-10 text-white mt-60 flex flex-col gap-4 items-center">
			<div>
				<h1 class="text-4xl font-bold ">Venera</h1>
			</div>
			<Button variant="outline" class="w-full" onclick={loginWithGoogle}>
				Mit Google anmelden
			</Button>
		</div>
</div>
