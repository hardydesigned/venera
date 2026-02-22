<script lang="ts">
	import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from '@lucide/svelte';

	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import ThemeToggle from './theme-toggle.svelte';
	import type { ComponentProps } from 'svelte';
	import type { AuthUser } from '$lib/auth/auth-store';
	import { logout } from '$lib/api/auth';

	let { user }: { user: AuthUser | null } = $props();
	const sidebar = useSidebar();
</script>

{#if user}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props }: { props: ComponentProps<typeof Sidebar.MenuButton> })}
						<Sidebar.MenuButton
							{...props}
							size="lg"
							class="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={user.email} alt={user.email} />
								<Avatar.Fallback class="rounded-lg"
									>{user.email.charAt(0).toUpperCase() +
										user.email.charAt(1).toUpperCase()}</Avatar.Fallback
								>
							</Avatar.Root>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">{user.firstName} {user.lastName}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown class="ms-auto size-4" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="start"
					sideOffset={4}
				>
					<DropdownMenu.Label class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={user.email} alt={user.email} />
								<Avatar.Fallback class="rounded-lg"
									>{user.email.charAt(0).toUpperCase() +
										user.email.charAt(1).toUpperCase()}</Avatar.Fallback
								>
							</Avatar.Root>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">{user.firstName} {user.lastName}</span>
								<span class="truncate text-xs">{user.email}</span>
							</div>
						</div>
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={(e) => e.preventDefault()}>
							<ThemeToggle />
						</DropdownMenu.Item>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={logout} class="cursor-pointer">
						<LogOut />
						Abmelden
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{/if}

{#if !user}
	<div class="text-sm text-muted-foreground">Nicht eingeloggt</div>
{/if}
