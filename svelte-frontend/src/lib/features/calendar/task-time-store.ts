/**
 * Task Time Store - Manages time information for tasks
 * Since the backend only stores dates (LocalDate), we store times separately in localStorage
 */

import { getActiveScopeKey } from '$lib/features/teams/team-context-store';

const BASE_STORAGE_KEY = 'venera_task_times';

function storageKeyForActiveScope(): string {
	return `${BASE_STORAGE_KEY}:${getActiveScopeKey()}`;
}

export interface TaskTime {
	taskId: string;
	startTime: string; // HH:mm format
	endTime: string; // HH:mm format
}

/**
 * Load all task times from localStorage
 */
export function loadTaskTimes(): Map<string, TaskTime> {
	if (typeof window === 'undefined') return new Map();

	try {
		const data = localStorage.getItem(storageKeyForActiveScope());
		if (!data) return new Map();

		const parsed: TaskTime[] = JSON.parse(data);
		return new Map(parsed.map((t) => [t.taskId, t]));
	} catch (e) {
		console.error('Failed to load task times', e);
		return new Map();
	}
}

/**
 * Save task time to localStorage
 */
export function saveTaskTime(taskId: string, startTime: string, endTime: string): void {
	if (typeof window === 'undefined') return;

	try {
		const times = loadTaskTimes();
		times.set(taskId, { taskId, startTime, endTime });

		const data = Array.from(times.values());
		localStorage.setItem(storageKeyForActiveScope(), JSON.stringify(data));
	} catch (e) {
		console.error('Failed to save task time', e);
	}
}

/**
 * Get task time
 */
export function getTaskTime(taskId: string): TaskTime | undefined {
	const times = loadTaskTimes();
	return times.get(taskId);
}

/**
 * Delete task time
 */
export function deleteTaskTime(taskId: string): void {
	if (typeof window === 'undefined') return;

	try {
		const times = loadTaskTimes();
		times.delete(taskId);

		const data = Array.from(times.values());
		localStorage.setItem(storageKeyForActiveScope(), JSON.stringify(data));
	} catch (e) {
		console.error('Failed to delete task time', e);
	}
}

/**
 * Convert Y position to time slot (15-minute intervals)
 */
export function yPositionToTime(y: number, containerTop: number, hourHeight: number): string {
	const relativeY = y - containerTop;
	const hours = relativeY / hourHeight;

	// Round to nearest 15 minutes
	const totalMinutes = Math.round(hours * 4) * 15;
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;

	// Clamp to 0-23:45
	const clampedH = Math.max(0, Math.min(23, h));
	const clampedM = clampedH === 23 ? Math.min(45, m) : m;

	return `${String(clampedH).padStart(2, '0')}:${String(clampedM).padStart(2, '0')}`;
}

/**
 * Convert time string to Y position
 */
export function timeToYPosition(time: string, hourHeight: number): number {
	const [h, m] = time.split(':').map(Number);
	const hours = h + m / 60;
	return hours * hourHeight;
}

/**
 * Parse time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}

/**
 * Calculate duration in minutes between two times
 */
export function calculateDuration(startTime: string, endTime: string): number {
	return timeToMinutes(endTime) - timeToMinutes(startTime);
}
