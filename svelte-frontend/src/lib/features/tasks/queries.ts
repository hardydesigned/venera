import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import {
	fetchInboxTasks,
	fetchAllTasks,
	createTask,
	updateTask,
	deleteTask,
	batchCreateTasks
} from '$lib/api/tasks';
import type { CreateTaskInput, UpdateTaskInput } from './types';

export const inboxTasksQuery = () =>
	createQuery({
		queryKey: ['tasks', 'inbox'],
		queryFn: fetchInboxTasks
	});

export const createTaskMutation = () => {
	const queryClient = useQueryClient();
	return createMutation({
		mutationFn: (input: CreateTaskInput) => createTask(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
		}
	}, queryClient);
};

export const updateTaskMutation = () => {
	const queryClient = useQueryClient();
	return createMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
		}
	}, queryClient);
};

export const deleteTaskMutation = () => {
	const queryClient = useQueryClient();
	return createMutation({
		mutationFn: (id: string) => deleteTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
		}
	}, queryClient);
};

/**
 * Query for all tasks (calendar view)
 */
export const allTasksQuery = () =>
	createQuery({
		queryKey: ['tasks', 'all'],
		queryFn: fetchAllTasks
	});

/**
 * Mutation for creating multiple tasks at once (recurring tasks)
 */
export const batchCreateTasksMutation = () => {
	const queryClient = useQueryClient();
	return createMutation(
		{
			mutationFn: (inputs: CreateTaskInput[]) => batchCreateTasks(inputs),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['tasks'] });
			}
		},
		queryClient
	);
};
