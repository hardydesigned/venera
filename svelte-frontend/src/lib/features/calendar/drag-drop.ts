import type { Task } from '$lib/features/tasks/types';

/**
 * Svelte action to make an element draggable
 * Usage: <div use:draggable={task}>
 */
export function draggable(node: HTMLElement, task: Task) {
	node.draggable = true;
	node.style.cursor = 'grab';

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;

		node.style.cursor = 'grabbing';
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('application/json', JSON.stringify(task));

		// Add visual feedback
		node.classList.add('opacity-50');
	}

	function handleDragEnd(e: DragEvent) {
		node.style.cursor = 'grab';
		node.classList.remove('opacity-50');
	}

	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragend', handleDragEnd);

	return {
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
		}
	};
}

/**
 * Svelte action to make an element a drop zone
 * Usage: <div use:dropzone={handleDrop}>
 */
export function dropzone(
	node: HTMLElement,
	onDrop: (task: Task, event: DragEvent) => void
) {
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;

		e.dataTransfer.dropEffect = 'move';
		node.classList.add('bg-primary/10', 'border-primary');
	}

	function handleDragLeave(e: DragEvent) {
		// Only remove highlight if we're leaving the dropzone itself, not a child
		if (e.currentTarget === node) {
			node.classList.remove('bg-primary/10', 'border-primary');
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		node.classList.remove('bg-primary/10', 'border-primary');

		const data = e.dataTransfer?.getData('application/json');
		if (!data) return;

		try {
			const task = JSON.parse(data) as Task;
			onDrop(task, e);
		} catch (err) {
			console.error('Failed to parse dropped task data', err);
		}
	}

	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('drop', handleDrop);

	return {
		destroy() {
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('drop', handleDrop);
		}
	};
}

/**
 * Svelte action for drag-to-create functionality
 * Usage: <div use:dragToCreate={handleCreate}>
 */
export function dragToCreate(
	node: HTMLElement,
	onCreate: (startY: number, endY: number, event: MouseEvent) => void
) {
	let startY: number | null = null;
	let isDragging = false;
	let selectionOverlay: HTMLElement | null = null;

	function handleMouseDown(e: MouseEvent) {
		// Only start if clicking on empty space (not on a task)
		if ((e.target as HTMLElement).closest('[draggable="true"]')) {
			return;
		}

		startY = e.clientY;
		isDragging = false;
	}

	function handleMouseMove(e: MouseEvent) {
		if (startY === null) return;

		const distance = Math.abs(e.clientY - startY);
		if (distance > 20 && !isDragging) {
			isDragging = true;

			// Create visual overlay
			selectionOverlay = document.createElement('div');
			selectionOverlay.className = 'absolute inset-x-0 bg-primary/20 border-2 border-primary border-dashed pointer-events-none z-10';
			node.appendChild(selectionOverlay);
		}

		if (isDragging && selectionOverlay) {
			const rect = node.getBoundingClientRect();
			const relativeStart = startY - rect.top;
			const relativeEnd = e.clientY - rect.top;

			const top = Math.min(relativeStart, relativeEnd);
			const height = Math.abs(relativeEnd - relativeStart);

			selectionOverlay.style.top = `${top}px`;
			selectionOverlay.style.height = `${height}px`;
		}
	}

	function handleMouseUp(e: MouseEvent) {
		if (startY === null) return;

		if (isDragging) {
			onCreate(startY, e.clientY, e);
		}

		// Cleanup
		if (selectionOverlay) {
			selectionOverlay.remove();
			selectionOverlay = null;
		}
		startY = null;
		isDragging = false;
	}

	node.addEventListener('mousedown', handleMouseDown);
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			if (selectionOverlay) {
				selectionOverlay.remove();
			}
		}
	};
}
