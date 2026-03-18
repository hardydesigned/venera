import { apiFetch } from './client';
import type {
	CreateTeamInput,
	InviteMemberInput,
	Team,
	TeamInvitation
} from '$lib/features/teams/types';

export async function fetchTeams(): Promise<Team[]> {
	const res = await apiFetch('/teams');
	if (!res.ok) {
		throw new Error(`Teams fetch failed: ${res.status}`);
	}
	return (await res.json()) as Team[];
}

export async function createTeam(input: CreateTeamInput): Promise<Team> {
	const res = await apiFetch('/teams', {
		method: 'POST',
		body: JSON.stringify(input)
	});
	if (!res.ok) {
		const message = await res.text();
		throw new Error(message || `Team create failed: ${res.status}`);
	}
	return (await res.json()) as Team;
}

export async function inviteTeamMember(input: InviteMemberInput): Promise<TeamInvitation> {
	const res = await apiFetch(`/teams/${input.teamId}/invites`, {
		method: 'POST',
		body: JSON.stringify({ email: input.email })
	});
	if (!res.ok) {
		const message = await res.text();
		throw new Error(message || `Team invite failed: ${res.status}`);
	}
	return (await res.json()) as TeamInvitation;
}

export async function fetchMyInvitations(): Promise<TeamInvitation[]> {
	const res = await apiFetch('/teams/invites');
	if (!res.ok) {
		throw new Error(`Team invites fetch failed: ${res.status}`);
	}
	return (await res.json()) as TeamInvitation[];
}

export async function acceptInvitation(invitationId: string): Promise<TeamInvitation> {
	const res = await apiFetch(`/teams/invites/${invitationId}/accept`, {
		method: 'POST'
	});
	if (!res.ok) {
		const message = await res.text();
		throw new Error(message || `Invite accept failed: ${res.status}`);
	}
	return (await res.json()) as TeamInvitation;
}
