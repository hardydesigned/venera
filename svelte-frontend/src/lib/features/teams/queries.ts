import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import {
	acceptInvitation,
	createTeam,
	fetchMyInvitations,
	fetchTeams,
	inviteTeamMember
} from '$lib/api/teams';
import type { CreateTeamInput, InviteMemberInput } from './types';

export const teamsQuery = () =>
	createQuery({
		queryKey: ['teams'],
		queryFn: fetchTeams
	});

export const teamInvitationsQuery = () =>
	createQuery({
		queryKey: ['teams', 'invites'],
		queryFn: fetchMyInvitations
	});

export const createTeamMutation = () => {
	const queryClient = useQueryClient();
	return createMutation(
		{
			mutationFn: (input: CreateTeamInput) => createTeam(input),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['teams'] });
			}
		},
		queryClient
	);
};

export const inviteMemberMutation = () => {
	const queryClient = useQueryClient();
	return createMutation(
		{
			mutationFn: (input: InviteMemberInput) => inviteTeamMember(input),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['teams', 'invites'] });
			}
		},
		queryClient
	);
};

export const acceptInvitationMutation = () => {
	const queryClient = useQueryClient();
	return createMutation(
		{
			mutationFn: (invitationId: string) => acceptInvitation(invitationId),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['teams'] });
				queryClient.invalidateQueries({ queryKey: ['teams', 'invites'] });
			}
		},
		queryClient
	);
};
