import { writable } from 'svelte/store';

export type TeamScope =
	| { type: 'personal' }
	| { type: 'team'; teamId: string; teamName: string };

const SCOPE_COOKIE_NAME = 'venera_task_scope';
const SCOPE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function readCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

function parseScopeFromCookie(): TeamScope {
	const raw = readCookie(SCOPE_COOKIE_NAME);
	if (!raw) {
		return { type: 'personal' };
	}
	try {
		const parsed = JSON.parse(raw) as TeamScope;
		if (parsed && parsed.type === 'team' && parsed.teamId && parsed.teamName) {
			return parsed;
		}
		return { type: 'personal' };
	} catch {
		return { type: 'personal' };
	}
}

function persistScopeToCookie(scope: TeamScope) {
	if (typeof document === 'undefined') return;
	document.cookie = `${SCOPE_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(scope))}; Max-Age=${SCOPE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

const initialScope = parseScopeFromCookie();
let currentScope = initialScope;

export const teamScopeStore = writable<TeamScope>(initialScope);

teamScopeStore.subscribe((scope) => {
	currentScope = scope;
	persistScopeToCookie(scope);
});

export function switchToPersonalScope() {
	if (currentScope.type === 'personal') return;
	teamScopeStore.set({ type: 'personal' });
}

export function switchToTeamScope(teamId: string, teamName: string) {
	if (!teamId || !teamName.trim()) return;
	if (currentScope.type === 'team' && currentScope.teamId === teamId && currentScope.teamName === teamName) {
		return;
	}
	teamScopeStore.set({ type: 'team', teamId, teamName: teamName.trim() });
}

export function getActiveTeamId(): string | null {
	return currentScope.type === 'team' ? currentScope.teamId : null;
}

export function getActiveScopeKey(): string {
	return currentScope.type === 'team' ? `team:${currentScope.teamId}` : 'personal';
}
