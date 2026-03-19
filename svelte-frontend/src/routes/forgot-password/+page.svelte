<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { forgotPassword } from '$lib/api/auth';

	let email = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			await forgotPassword(email);
			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Anfrage fehlgeschlagen.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Passwort vergessen | Venera</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<img src="/background.png" alt="Venera" class="absolute top-0 left-0 w-full h-full object-cover" />
	<div class="z-10 text-white mt-60 flex flex-col gap-4 items-center w-full max-w-sm px-4">
		<h1 class="text-4xl font-bold">Venera</h1>
		<p class="text-white/70 text-sm">Passwort zurücksetzen</p>

		{#if success}
			<div class="w-full text-center bg-white/10 border border-white/30 rounded-md p-4">
				<p class="text-white text-sm">
					Falls diese E-Mail-Adresse registriert ist, haben wir einen Reset-Link gesendet.
				</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="w-full flex flex-col gap-3">
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
				{#if error}
					<p class="text-red-400 text-sm text-center">{error}</p>
				{/if}
				<Button type="submit" variant="default" class="w-full" disabled={loading}>
					{loading ? 'Senden…' : 'Reset-Link senden'}
				</Button>
			</form>
		{/if}

		<a href="/login" class="text-white/70 hover:text-white text-sm underline">
			Zurück zum Login
		</a>
	</div>
</div>
