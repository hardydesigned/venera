import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { fetchInboxTasks, createTask, updateTask, deleteTask } from '$lib/api/tasks';
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
			queryClient.invalidateQueries({ queryKey: ['tasks', 'inbox'] });
		}
	}, queryClient);
};

export const updateTaskMutation = () => {
	const queryClient = useQueryClient();
	return createMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks', 'inbox'] });
		}
	}, queryClient);
};

export const deleteTaskMutation = () => {
	const queryClient = useQueryClient();
	return createMutation({
		mutationFn: (id: string) => deleteTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks', 'inbox'] });
		}
	}, queryClient);
};
