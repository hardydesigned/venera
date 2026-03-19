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

export async function login(email: string, password: string): Promise<AuthUser> {
	const res = await apiFetch('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(text || `Login failed: ${res.status}`);
	}
	const data = await res.json();
	return data.user as AuthUser;
}

export async function signUp(
	firstName: string,
	lastName: string,
	email: string,
	password: string,
	confirmPassword: string
): Promise<AuthUser> {
	const res = await apiFetch('/auth/signup', {
		method: 'POST',
		body: JSON.stringify({ firstName, lastName, email, password, confirmPassword })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(text || `Registrierung fehlgeschlagen: ${res.status}`);
	}
	const data = await res.json();
	return data.user as AuthUser;
}

export async function forgotPassword(email: string): Promise<void> {
	const res = await apiFetch('/auth/forgot-password', {
		method: 'POST',
		body: JSON.stringify({ email })
	});
	if (!res.ok) {
		throw new Error(`Anfrage fehlgeschlagen: ${res.status}`);
	}
}

export async function resetPassword(resetPasswordToken: string, newPassword: string): Promise<void> {
	const res = await apiFetch('/auth/reset-password', {
		method: 'POST',
		body: JSON.stringify({ resetPasswordToken, newPassword })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(text || `Passwort-Reset fehlgeschlagen: ${res.status}`);
	}
}
