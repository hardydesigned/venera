export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriorityCategory = 'A' | 'B' | 'C';

export interface Task {
	id: string;
	title: string;
	description: string;
	startDate: string;
	dueDate: string;
	category: TaskPriorityCategory;
	status: TaskStatus;
}

export interface CreateTaskInput {
	title: string;
	description: string;
	startDate: string;
	dueDate: string;
	category: TaskPriorityCategory;
	status: TaskStatus;
}
