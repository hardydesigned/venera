import { apiFetch } from './client';

export type ProjectWorkspacePayload = {
	projects?: unknown[];
	folders?: unknown[];
};

export async function fetchProjectWorkspace(): Promise<ProjectWorkspacePayload> {
	const res = await apiFetch('/projects/workspace');
	if (!res.ok) {
		throw new Error(`Project workspace fetch failed: ${res.status}`);
	}
	return (await res.json()) as ProjectWorkspacePayload;
}

export async function saveProjectWorkspace(payload: ProjectWorkspacePayload): Promise<void> {
	const res = await apiFetch('/projects/workspace', {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		const message = await res.text();
		throw new Error(message || `Project workspace save failed: ${res.status}`);
	}
}
