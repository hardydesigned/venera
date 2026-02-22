<script lang="ts">
	import { themeStore, setTheme, type Theme } from '$lib/theme/theme-store';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { SunIcon, MoonIcon, ComputerIcon } from '@lucide/svelte';

	const options: { value: Theme; label: string }[] = [
		{ value: 'light', label: 'Hell' },
		{ value: 'dark', label: 'Dunkel' },
		{ value: 'system', label: 'System' }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="relative inline-flex cursor-pointer items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground"
		aria-label="Theme umschalten"
	>
		{#if $themeStore === 'light'}
			<SunIcon class="size-4" />
		{:else if $themeStore === 'dark'}
			<MoonIcon class="size-4" />
		{:else}
			<ComputerIcon class="size-4" />
		{/if}
		Theme
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each options as opt}
			<DropdownMenu.Item
				onclick={() => setTheme(opt.value)}
				class={$themeStore === opt.value ? 'font-semibold' : ''}
			>
				{opt.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
