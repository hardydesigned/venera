import { env } from '$env/dynamic/public';
import { clearAuth } from '$lib/auth/auth-store';
import { getActiveTeamId } from '$lib/features/teams/team-context-store';

const API_BASE = env.PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function getApiBase(): string {
	return API_BASE;
}

export async function
	apiFetch(
		path: string,
		options: RequestInit = {}
	): Promise<Response> {
	const url = `${API_BASE}${path}`;
	const method = (options.method ?? 'GET').toUpperCase();

	const headers: Record<string, string> = {
		...(options.headers as Record<string, string>)
	};

	if (!headers['Content-Type'] && options.body && !isFormDataBody(options.body)) {
		headers['Content-Type'] = 'application/json';
	}

	const teamId = getActiveTeamId();
	if (teamId && !headers['X-Team-Id']) {
		headers['X-Team-Id'] = teamId;
	}

	if (isStateChangingMethod(method)) {
		await ensureCsrfCookie();
		const csrfToken = readCookie('XSRF-TOKEN');
		if (csrfToken) {
			headers['X-XSRF-TOKEN'] = csrfToken;
		}
	}

	const res = await fetch(url, {
		...options,
		headers,
		credentials: 'include'
	});

	// Bei 401: Session abgelaufen → Auth löschen, Layout leitet zur Login-Seite um
	if (res.status === 401 && typeof window !== 'undefined') {
		clearAuth();
	}

	return res;
}

function isStateChangingMethod(method: string): boolean {
	return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

function isFormDataBody(body: BodyInit): boolean {
	return typeof FormData !== 'undefined' && body instanceof FormData;
}

function readCookie(name: string): string | null {
	if (typeof document === 'undefined') {
		return null;
	}
	const entry = document.cookie
		.split('; ')
		.find((value) => value.startsWith(`${name}=`));
	if (!entry) return null;
	return decodeURIComponent(entry.split('=').slice(1).join('='));
}

let csrfInFlight: Promise<void> | null = null;
async function ensureCsrfCookie(): Promise<void> {
	if (typeof window === 'undefined') return;
	if (readCookie('XSRF-TOKEN')) return;
	if (!csrfInFlight) {
		csrfInFlight = fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' })
			.then(() => undefined)
			.finally(() => {
				csrfInFlight = null;
			});
	}
	await csrfInFlight;
}
