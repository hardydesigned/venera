<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { getApiBase } from '$lib/api/client';
	import { authStore, setAuthUser } from '$lib/auth/auth-store';
	import { login } from '$lib/api/auth';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	function loginWithGoogle() {
		const base = getApiBase();
		window.location.href = `${base}/oauth2/authorization/google`;
	}

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			const user = await login(email, password);
			setAuthUser(user);
			goto('/inbox');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login fehlgeschlagen.';
		} finally {
			loading = false;
		}
	}

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
	<div class="z-10 text-white mt-60 flex flex-col gap-4 items-center w-full max-w-sm px-4">
		<h1 class="text-4xl font-bold">Venera</h1>

		<form onsubmit={handleLogin} class="w-full flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<Label for="email" class="text-white">E-Mail</Label>
				<Input
					id="email"
					type="email"
					placeholder="deine@email.de"
					bind:value={email}
					required
					class="bg-white/10 border-white/30 text-white placeholder:text-white/50"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<Label for="password" class="text-white">Passwort</Label>
				<Input
					id="password"
					type="password"
					placeholder="••••••••"
					bind:value={password}
					required
					class="bg-white/10 border-white/30 text-white placeholder:text-white/50"
				/>
			</div>
			{#if error}
				<p class="text-red-400 text-sm text-center">{error}</p>
			{/if}
			<Button type="submit" variant="default" class="w-full" disabled={loading}>
				{loading ? 'Anmelden…' : 'Anmelden'}
			</Button>
			<div class="text-center text-sm">
				<a href="/forgot-password" class="text-white/70 hover:text-white underline">
					Passwort vergessen?
				</a>
			</div>
		</form>

		<div class="flex items-center w-full gap-2">
			<hr class="flex-1 border-white/30" />
			<span class="text-white/50 text-xs">oder</span>
			<hr class="flex-1 border-white/30" />
		</div>

		<Button variant="outline" class="w-full" onclick={loginWithGoogle}>
			Mit Google anmelden
		</Button>

		<p class="text-sm text-white/70">
			Noch kein Konto?
			<a href="/register" class="text-white underline hover:text-white/80">Registrieren</a>
		</p>
	</div>
</div>
