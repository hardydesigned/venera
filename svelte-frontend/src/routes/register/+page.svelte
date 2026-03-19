<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authStore, setAuthUser } from '$lib/auth/auth-store';
	import { signUp } from '$lib/api/auth';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister(e: Event) {
		e.preventDefault();
		error = '';
		if (password !== confirmPassword) {
			error = 'Passwörter stimmen nicht überein.';
			return;
		}
		loading = true;
		try {
			const user = await signUp(firstName, lastName, email, password, confirmPassword);
			setAuthUser(user);
			goto('/inbox');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.';
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
	<title>Registrieren | Venera</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<img src="/background.png" alt="Venera" class="absolute top-0 left-0 w-full h-full object-cover" />
	<div class="z-10 text-white mt-40 flex flex-col gap-4 items-center w-full max-w-sm px-4">
		<h1 class="text-4xl font-bold">Venera</h1>
		<p class="text-white/70 text-sm">Konto erstellen</p>

		<form onsubmit={handleRegister} class="w-full flex flex-col gap-3">
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<Label for="firstName" class="text-white">Vorname</Label>
					<Input
						id="firstName"
						type="text"
						placeholder="Max"
						bind:value={firstName}
						required
						class="bg-white/10 border-white/30 text-white placeholder:text-white/50"
					/>
				</div>
				<div class="flex flex-col gap-1">
					<Label for="lastName" class="text-white">Nachname</Label>
					<Input
						id="lastName"
						type="text"
						placeholder="Mustermann"
						bind:value={lastName}
						required
						class="bg-white/10 border-white/30 text-white placeholder:text-white/50"
					/>
				</div>
			</div>
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
					placeholder="Mindestens 8 Zeichen"
					bind:value={password}
					required
					minlength={8}
					class="bg-white/10 border-white/30 text-white placeholder:text-white/50"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<Label for="confirmPassword" class="text-white">Passwort bestätigen</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="••••••••"
					bind:value={confirmPassword}
					required
					class="bg-white/10 border-white/30 text-white placeholder:text-white/50"
				/>
			</div>
			{#if error}
				<p class="text-red-400 text-sm text-center">{error}</p>
			{/if}
			<Button type="submit" variant="default" class="w-full" disabled={loading}>
				{loading ? 'Registrieren…' : 'Registrieren'}
			</Button>
		</form>

		<p class="text-sm text-white/70">
			Bereits ein Konto?
			<a href="/login" class="text-white underline hover:text-white/80">Anmelden</a>
		</p>
	</div>
</div>
