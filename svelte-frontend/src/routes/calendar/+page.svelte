<script lang="ts">
	import { Button, Card, Select } from 'flowbite-svelte';

	const options = [
		{ value: 'day', name: 'Tag' },
		{ value: 'week', name: 'Woche' },
		{ value: 'month', name: 'Monat' },
		{ value: 'year', name: 'Jahr' }
	];

	let mode = $state('week');
</script>

<svelte:head>
	<title>Kalender | Venera</title>
</svelte:head>

<section class="space-y-6">
	<header class="space-y-2">
		<h2 class="text-2xl font-semibold">Kalender</h2>
		<p class="text-sm text-slate-600">Tag/Woche/Monat/Jahr mit spaeterem Drag-to-Create.</p>
	</header>

	<Card class="space-y-4">
		<div class="flex flex-wrap items-end gap-3">
			<div class="w-44">
				<Select items={options} bind:value={mode} />
			</div>
			<Button type="button" color="light">Heute</Button>
			<Button type="button">Termin erstellen</Button>
		</div>

		<div class="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
			Ansicht: {mode}. Hier kommt als naechstes das Zeitraster mit Slots.
		</div>
	</Card>
</section>
