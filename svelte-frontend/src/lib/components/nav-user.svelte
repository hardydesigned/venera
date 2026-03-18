<script lang="ts">
	import { get } from 'svelte/store';
	import {
		CheckIcon,
		ChevronsUpDown,
		LogOut,
		PlusIcon,
		SendIcon,
		UserIcon,
		UsersIcon
	} from '@lucide/svelte';

	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import ThemeToggle from './theme-toggle.svelte';
	import type { ComponentProps } from 'svelte';
	import type { AuthUser } from '$lib/auth/auth-store';
	import { clearAuth } from '$lib/auth/auth-store';
	import { logout as logoutRequest } from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		acceptInvitationMutation,
		createTeamMutation,
		inviteMemberMutation,
		teamInvitationsQuery,
		teamsQuery
	} from '$lib/features/teams/queries';
	import {
		teamScopeStore,
		switchToPersonalScope,
		switchToTeamScope
	} from '$lib/features/teams/team-context-store';
	import type { Team } from '$lib/features/teams/types';

	let { user }: { user: AuthUser | null } = $props();
	const sidebar = useSidebar();
	const teamsState = teamsQuery();
	const teamInvitationsState = teamInvitationsQuery();
	const createTeamState = createTeamMutation();
	const inviteMemberState = inviteMemberMutation();
	const acceptInvitationState = acceptInvitationMutation();
	const teams = $derived($teamsState.data ?? []);
	const teamInvitations = $derived($teamInvitationsState.data ?? []);
	const scope = $derived($teamScopeStore);
	const activeTeam = $derived(scope.type === 'team' ? teams.find((team) => team.id === scope.teamId) ?? null : null);

	let teamDialogOpen = $state(false);
	let teamName = $state('');
	let teamDescription = $state('');
	let inviteDialogOpen = $state(false);
	let inviteEmail = $state('');
	let inviteTeamId = $state<string | null>(null);

	async function handleLogout() {
		try {
			await logoutRequest();
		} catch {
			// ignore and clear client state anyway
		}
		clearAuth();
		goto('/login', { replaceState: true });
	}

	function openCreateTeamDialog() {
		teamName = '';
		teamDescription = '';
		teamDialogOpen = true;
	}

	function submitCreateTeam() {
		const name = teamName.trim();
		if (!name) return;
		get(createTeamState).mutate(
			{
				name,
				description: teamDescription.trim()
			},
			{
				onSuccess: (createdTeam) => {
					teamDialogOpen = false;
					teamName = '';
					teamDescription = '';
					switchToTeamScope(createdTeam.id, createdTeam.name);
				}
			}
		);
	}

	function openInviteDialog(teamId: string) {
		inviteTeamId = teamId;
		inviteEmail = '';
		inviteDialogOpen = true;
	}

	function submitInvite() {
		if (!inviteTeamId) return;
		const email = inviteEmail.trim();
		if (!email) return;
		get(inviteMemberState).mutate(
			{
				teamId: inviteTeamId,
				email
			},
			{
				onSuccess: () => {
					inviteEmail = '';
					inviteDialogOpen = false;
					inviteTeamId = null;
				}
			}
		);
	}

	function acceptInvitation(invitationId: string) {
		get(acceptInvitationState).mutate(invitationId, {
			onSuccess: (invitation) => {
				switchToTeamScope(invitation.teamId, invitation.teamName);
			}
		});
	}

	function switchScopeToTeam(team: Team) {
		switchToTeamScope(team.id, team.name);
	}

	$effect(() => {
		if (scope.type !== 'team') return;
		const currentTeam = teams.find((team) => team.id === scope.teamId);
		if (!currentTeam && !$teamsState.isLoading) {
			switchToPersonalScope();
			return;
		}
		if (currentTeam && currentTeam.name !== scope.teamName) {
			switchToTeamScope(currentTeam.id, currentTeam.name);
		}
	});
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
					class="w-(--bits-dropdown-menu-anchor-width) min-w-64 rounded-lg"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="start"
					sideOffset={4}
				>
					<DropdownMenu.Label class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
							<Avatar.Root class="size-8 rounded-lg">
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
						<DropdownMenu.GroupHeading class="px-2 py-1 text-xs tracking-wide text-muted-foreground uppercase">
							Account
						</DropdownMenu.GroupHeading>
						<DropdownMenu.Item class="cursor-pointer" onclick={switchToPersonalScope}>
							<UserIcon class="size-4" />
							Persönlich
							{#if scope.type === 'personal'}
								<CheckIcon class="ml-auto size-4" />
							{/if}
						</DropdownMenu.Item>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<UsersIcon class="size-4" />
								Team wählen
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent class="min-w-56">
								{#if $teamsState.isLoading}
									<div class="px-2 py-1 text-xs text-muted-foreground">Teams werden geladen…</div>
								{:else if teams.length === 0}
									<div class="px-2 py-1 text-xs text-muted-foreground">Noch kein Team</div>
								{:else}
									{#each teams as team (team.id)}
										<DropdownMenu.Item class="cursor-pointer" onclick={() => switchScopeToTeam(team)}>
											<UsersIcon class="size-4" />
											<span class="truncate">{team.name}</span>
											{#if scope.type === 'team' && scope.teamId === team.id}
												<CheckIcon class="ml-auto size-4" />
											{/if}
										</DropdownMenu.Item>
									{/each}
								{/if}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Item class="cursor-pointer" onclick={openCreateTeamDialog}>
							<PlusIcon class="size-4" />
							Neues Team erstellen
						</DropdownMenu.Item>

						{#if activeTeam?.role === 'OWNER'}
							<DropdownMenu.Item class="cursor-pointer" onclick={() => openInviteDialog(activeTeam.id)}>
								<SendIcon class="size-4" />
								Mitglied einladen
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Group>

					{#if teamInvitations.length > 0}
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.GroupHeading class="px-2 py-1 text-xs tracking-wide text-muted-foreground uppercase">
								Einladungen
							</DropdownMenu.GroupHeading>
							{#each teamInvitations as invitation (invitation.id)}
								<DropdownMenu.Item
									class="cursor-pointer"
									onclick={() => acceptInvitation(invitation.id)}
								>
									<CheckIcon class="size-4" />
									<span class="truncate">{invitation.teamName} beitreten</span>
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Group>
					{/if}

					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={(e) => e.preventDefault()}>
							<ThemeToggle />
						</DropdownMenu.Item>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={handleLogout} class="cursor-pointer">
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

<Dialog.Root
	open={teamDialogOpen}
	onOpenChange={(open: boolean) => {
		teamDialogOpen = open;
	}}
>
	<Dialog.Content class="text-foreground sm:max-w-[430px]">
		<Dialog.Header>
			<Dialog.Title>Team erstellen</Dialog.Title>
			<Dialog.Description>Lege einen Team-Workspace an und teile Aufgaben.</Dialog.Description>
		</Dialog.Header>
		<form
			class="grid gap-4 pt-2"
			onsubmit={(e) => {
				e.preventDefault();
				submitCreateTeam();
			}}
		>
			<div class="grid gap-2">
				<Label for="team-name">Name</Label>
				<Input id="team-name" bind:value={teamName} placeholder="z. B. Produktteam" />
			</div>
			<div class="grid gap-2">
				<Label for="team-description">Beschreibung</Label>
				<textarea
					id="team-description"
					bind:value={teamDescription}
					rows={3}
					class="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					placeholder="Optional"
				></textarea>
			</div>
			<Dialog.Footer class="pt-2">
				<Button type="submit" disabled={$createTeamState.isPending}>Erstellen</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={inviteDialogOpen}
	onOpenChange={(open: boolean) => {
		inviteDialogOpen = open;
		if (!open) {
			inviteTeamId = null;
		}
	}}
>
	<Dialog.Content class="text-foreground sm:max-w-[430px]">
		<Dialog.Header>
			<Dialog.Title>Mitglied einladen</Dialog.Title>
			<Dialog.Description>Per E-Mail zum Team einladen.</Dialog.Description>
		</Dialog.Header>
		<form
			class="grid gap-4 pt-2"
			onsubmit={(e) => {
				e.preventDefault();
				submitInvite();
			}}
		>
			<div class="grid gap-2">
				<Label for="invite-email">E-Mail</Label>
				<Input
					id="invite-email"
					type="email"
					bind:value={inviteEmail}
					placeholder="name@beispiel.de"
				/>
			</div>
			<Dialog.Footer class="pt-2">
				<Button type="submit" disabled={$inviteMemberState.isPending}>Einladen</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
