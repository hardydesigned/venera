export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriorityCategory = 'A' | 'B' | 'C';

export interface Task {
	id: string;
	title: string;
	description: string;
	startDate: string | null;
	dueDate: string | null;
	category: TaskPriorityCategory;
	status: TaskStatus;
	estimatedDurationMinutes: number | null;
	actualDurationMinutes: number | null;
}

export interface CreateTaskInput {
	title: string;
	description: string;
	startDate: string | null;
	dueDate: string | null;
	category: TaskPriorityCategory;
	status: TaskStatus;
	estimatedDurationMinutes: number | null;
	actualDurationMinutes: number | null;
}

export interface UpdateTaskInput {
	title: string;
	description: string;
	startDate: string | null;
	dueDate: string | null;
	category: TaskPriorityCategory;
	status: TaskStatus;
	estimatedDurationMinutes: number | null;
	actualDurationMinutes: number | null;
}
