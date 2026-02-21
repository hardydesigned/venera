import { writable } from 'svelte/store';

const AUTH_USER_KEY = 'venera_auth_user';

export interface AuthUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	active: boolean;
	onboardingCompleted?: boolean;
}

export interface AuthState {
	user: AuthUser | null;
	initialized: boolean;
}

function loadUserFromStorage(): AuthUser | null {
	if (typeof window === 'undefined') {
		return null;
	}
	try {
		const raw = localStorage.getItem(AUTH_USER_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as AuthUser;
	} catch {
		return null;
	}
}

function saveUserToStorage(user: AuthUser | null) {
	if (typeof window === 'undefined') return;
	try {
		if (user) {
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
		} else {
			localStorage.removeItem(AUTH_USER_KEY);
		}
	} catch {
		// ignore
	}
}

const initialUser = loadUserFromStorage();
export const authStore = writable<AuthState>({
	user: initialUser,
	initialized: !!initialUser
});

export function setAuthUser(user: AuthUser) {
	authStore.set({ user, initialized: true });
	saveUserToStorage(user);
}

export function setAuthInitialized() {
	authStore.update((state) => ({ ...state, initialized: true }));
}

export function clearAuth() {
	authStore.set({ user: null, initialized: true });
	saveUserToStorage(null);
}
