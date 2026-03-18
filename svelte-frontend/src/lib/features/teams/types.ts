export type TeamRole = 'OWNER' | 'MEMBER';
export type TeamInvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Team {
	id: string;
	name: string;
	description: string | null;
	role: TeamRole;
	memberCount: number;
}

export interface TeamInvitation {
	id: string;
	teamId: string;
	teamName: string;
	email: string;
	status: TeamInvitationStatus;
	invitedByUserId: string;
	createdAt: string;
	respondedAt: string | null;
}

export interface CreateTeamInput {
	name: string;
	description?: string;
}

export interface InviteMemberInput {
	teamId: string;
	email: string;
}
