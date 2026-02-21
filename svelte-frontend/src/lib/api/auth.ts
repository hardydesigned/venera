import { apiFetch } from './client';
import type { AuthUser } from '$lib/auth/auth-store';

export async function fetchCurrentUser(): Promise<AuthUser | null> {
	const res = await apiFetch('/auth/me');
	if (res.status === 401) {
		return null;
	}
	if (!res.ok) {
		throw new Error(`Current user fetch failed: ${res.status}`);
	}
	return (await res.json()) as AuthUser;
}

export async function logout(): Promise<void> {
	const res = await apiFetch('/auth/logout', { method: 'POST' });
	if (!res.ok) {
		throw new Error(`Logout failed: ${res.status}`);
	}
}
