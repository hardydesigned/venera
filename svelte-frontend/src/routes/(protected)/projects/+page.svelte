<script lang="ts">
	import { Badge, Card } from 'flowbite-svelte';

	const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
	const buckets = ['A', 'B', 'C'];
</script>

<svelte:head>
	<title>Projekte | Venera</title>
</svelte:head>

<section class="space-y-6">
	<header class="space-y-2">
		<h2 class="text-2xl font-semibold">Projekte</h2>
		<p class="text-sm text-slate-600">Wochenmatrix mit Prioritaetsspalten A/B/C als Startpunkt.</p>
	</header>

	<div class="grid gap-3 lg:grid-cols-7">
		{#each weekdays as day}
			<Card class="space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="font-medium">{day}</h3>
					<Badge color="gray">0 Tasks</Badge>
				</div>
				<div class="grid gap-2">
					{#each buckets as bucket}
						<div class="rounded-md border border-slate-200 bg-slate-50 p-2 text-sm text-slate-600">
							{bucket}-Aufgaben
						</div>
					{/each}
				</div>
			</Card>
		{/each}
	</div>
</section>
