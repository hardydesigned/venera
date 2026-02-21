import { apiFetch } from './client';
import type { Task, CreateTaskInput } from '$lib/features/tasks/types';

export async function fetchInboxTasks(): Promise<Task[]> {
	const res = await apiFetch('/tasks/inbox');
	if (!res.ok) throw new Error(`Tasks fetch failed: ${res.status}`);
	return res.json();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
	const res = await apiFetch('/tasks', {
		method: 'POST',
		body: JSON.stringify(input)
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(err || `Create failed: ${res.status}`);
	}
	return res.json();
}

export async function deleteTask(id: string): Promise<void> {
	const res = await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}
