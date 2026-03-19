<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { resetPassword } from '$lib/api/auth';

	const token = $derived(page.url.searchParams.get('resetPasswordToken') ?? '');

	let newPassword = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		if (newPassword !== confirmPassword) {
			error = 'Passwörter stimmen nicht überein.';
			return;
		}
		if (!token) {
			error = 'Ungültiger oder fehlender Reset-Token.';
			return;
		}
		loading = true;
		try {
			await resetPassword(token, newPassword);
			goto('/login?passwordReset=true');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Passwort-Reset fehlgeschlagen.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Neues Passwort | Venera</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<img src="/background.png" alt="Venera" class="absolute top-0 left-0 w-full h-full object-cover" />
	<div class="z-10 text-white mt-60 flex flex-col gap-4 items-center w-full max-w-sm px-4">
		<h1 class="text-4xl font-bold">Venera</h1>
		<p class="text-white/70 text-sm">Neues Passwort festlegen</p>

		{#if !token}
			<p class="text-red-400 text-sm text-center">Ungültiger Reset-Link. Bitte fordere einen neuen an.</p>
			<a href="/forgot-password" class="text-white/70 hover:text-white text-sm underline">
				Neuen Link anfordern
			</a>
		{:else}
			<form onsubmit={handleSubmit} class="w-full flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<Label for="newPassword" class="text-white">Neues Passwort</Label>
					<Input
						id="newPassword"
						type="password"
						placeholder="Mindestens 8 Zeichen"
						bind:value={newPassword}
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
					{loading ? 'Speichern…' : 'Passwort setzen'}
				</Button>
			</form>
		{/if}

		<a href="/login" class="text-white/70 hover:text-white text-sm underline">
			Zurück zum Login
		</a>
	</div>
</div>
