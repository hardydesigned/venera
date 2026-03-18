import type { CreateTaskInput, TaskPriorityCategory, TaskStatus } from '$lib/features/tasks/types';
import { formatISODate } from './calendar-utils';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringTaskInput {
	title: string;
	description: string;
	startDate: string;
	frequency: RecurrenceFrequency;
	occurrences: number;
	category: TaskPriorityCategory;
	status: TaskStatus;
	estimatedDurationMinutes: number | null;
	actualDurationMinutes: number | null;
}

/**
 * Generate multiple task inputs based on recurrence pattern
 */
export function generateRecurringTasks(input: RecurringTaskInput): CreateTaskInput[] {
	const tasks: CreateTaskInput[] = [];
	let currentDate = new Date(input.startDate);

	for (let i = 0; i < input.occurrences; i++) {
		const dateStr = formatISODate(currentDate);
		// Convert to datetime strings
		const startDateTime = `${dateStr}T00:00:00`;
		const dueDateTime = `${dateStr}T23:59:59`;

		tasks.push({
			title: input.title,
			description: input.description,
			startDate: startDateTime,
			dueDate: dueDateTime,
			category: input.category,
			status: input.status,
			estimatedDurationMinutes: input.estimatedDurationMinutes,
			actualDurationMinutes: input.actualDurationMinutes
		});

		// Increment date based on frequency
		switch (input.frequency) {
			case 'daily':
				currentDate.setDate(currentDate.getDate() + 1);
				break;
			case 'weekly':
				currentDate.setDate(currentDate.getDate() + 7);
				break;
			case 'monthly':
				currentDate.setMonth(currentDate.getMonth() + 1);
				break;
		}
	}

	return tasks;
}

/**
 * Get German label for frequency
 */
export function getFrequencyLabel(frequency: RecurrenceFrequency): string {
	const labels: Record<RecurrenceFrequency, string> = {
		daily: 'Täglich',
		weekly: 'Wöchentlich',
		monthly: 'Monatlich'
	};
	return labels[frequency];
}
