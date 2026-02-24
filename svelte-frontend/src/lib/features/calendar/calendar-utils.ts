import type { Task, TaskPriorityCategory, TaskStatus } from '$lib/features/tasks/types';

/**
 * Get Tailwind CSS classes for priority color coding
 */
export function getPriorityColor(category: TaskPriorityCategory): string {
	const colors = {
		A: 'bg-priority-a text-priority-a-foreground border-priority-a-foreground/20',
		B: 'bg-priority-b text-priority-b-foreground border-priority-b-foreground/20',
		C: 'bg-priority-c text-priority-c-foreground border-priority-c-foreground/20'
	};
	return colors[category];
}

/**
 * Get priority color as CSS variable reference
 */
export function getPriorityColorVar(category: TaskPriorityCategory): string {
	const colors = {
		A: 'var(--priority-a)',
		B: 'var(--priority-b)',
		C: 'var(--priority-c)'
	};
	return colors[category];
}

/**
 * Format date to German locale (DD.MM.YYYY)
 */
export function formatDisplayDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
}

/**
 * Format date to short German format (DD.MM.)
 */
export function formatShortDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: '2-digit'
	}).format(date);
}

/**
 * Format date to ISO string (YYYY-MM-DD) for API
 */
export function formatISODate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Get the start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
	return new Date(d.setDate(diff));
}

/**
 * Get array of 7 dates for the week containing the given date
 */
export function getWeekDates(date: Date): Date[] {
	const weekStart = getWeekStart(date);
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(weekStart);
		d.setDate(weekStart.getDate() + i);
		return d;
	});
}

/**
 * Get array of dates for month grid (including padding from prev/next month)
 */
export function getMonthDates(year: number, month: number): Date[] {
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const startDate = getWeekStart(firstDay);

	const dates: Date[] = [];
	const current = new Date(startDate);

	// Always show 6 weeks (42 days) for consistent layout
	for (let i = 0; i < 42; i++) {
		dates.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return dates;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

/**
 * Get German weekday name
 */
export function getWeekdayName(date: Date, short: boolean = false): string {
	return new Intl.DateTimeFormat('de-DE', {
		weekday: short ? 'short' : 'long'
	}).format(date);
}

/**
 * Get German month name
 */
export function getMonthName(month: number): string {
	const date = new Date(2000, month, 1);
	return new Intl.DateTimeFormat('de-DE', {
		month: 'long'
	}).format(date);
}

/**
 * Filter tasks by search query (title or description)
 */
export function filterTasksBySearch(tasks: Task[], query: string): Task[] {
	if (!query.trim()) return tasks;

	const lowerQuery = query.toLowerCase();
	return tasks.filter(
		(task) =>
			task.title.toLowerCase().includes(lowerQuery) ||
			task.description?.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Filter tasks by priorities
 */
export function filterTasksByPriorities(
	tasks: Task[],
	priorities: Set<TaskPriorityCategory>
): Task[] {
	if (priorities.size === 0 || priorities.size === 3) return tasks;
	return tasks.filter((task) => priorities.has(task.category));
}

/**
 * Filter tasks by statuses
 */
export function filterTasksByStatuses(tasks: Task[], statuses: Set<TaskStatus>): Task[] {
	if (statuses.size === 0) return tasks;
	return tasks.filter((task) => statuses.has(task.status));
}

/**
 * Extract date portion from datetime string (YYYY-MM-DDTHH:mm:ss -> YYYY-MM-DD)
 */
export function extractDatePart(datetimeStr: string): string {
	if (!datetimeStr) return '';
	return datetimeStr.split('T')[0];
}

/**
 * Extract time portion from datetime string (YYYY-MM-DDTHH:mm:ss -> HH:mm)
 */
export function extractTimePart(datetimeStr: string): string {
	if (!datetimeStr || !datetimeStr.includes('T')) return '00:00';
	const timePart = datetimeStr.split('T')[1];
	// Return HH:mm (without seconds)
	return timePart.slice(0, 5);
}

/**
 * Filter tasks by date
 */
export function filterTasksByDate(tasks: Task[], date: Date): Task[] {
	const dateStr = formatISODate(date);
	return tasks.filter((task) => {
		const taskDueDate = extractDatePart(task.dueDate);
		const taskStartDate = extractDatePart(task.startDate);
		return taskDueDate === dateStr || taskStartDate === dateStr;
	});
}

/**
 * Get tasks for a specific date range
 */
export function getTasksInRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
	const start = formatISODate(startDate);
	const end = formatISODate(endDate);

	return tasks.filter((task) => {
		const taskDateStr = task.dueDate || task.startDate;
		const taskDate = extractDatePart(taskDateStr);
		return taskDate >= start && taskDate <= end;
	});
}

/**
 * Group tasks by date category for list view
 */
export function groupTasksByDateCategory(tasks: Task[]): {
	heute: Task[];
	dieseWoche: Task[];
	naechsteWoche: Task[];
	spaeter: Task[];
	ueberfaellig: Task[];
} {
	const today = new Date();
	const todayStr = formatISODate(today);

	const weekStart = getWeekStart(today);
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekEnd.getDate() + 6);

	const nextWeekStart = new Date(weekEnd);
	nextWeekStart.setDate(nextWeekStart.getDate() + 1);
	const nextWeekEnd = new Date(nextWeekStart);
	nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

	const result = {
		heute: [] as Task[],
		dieseWoche: [] as Task[],
		naechsteWoche: [] as Task[],
		spaeter: [] as Task[],
		ueberfaellig: [] as Task[]
	};

	for (const task of tasks) {
		const taskDateStr = task.dueDate || task.startDate;
		const taskDateOnly = extractDatePart(taskDateStr);
		const taskDate = new Date(taskDateOnly);

		// Check if overdue
		if (taskDateOnly < todayStr && task.status !== 'DONE' && task.status !== 'CANCELLED') {
			result.ueberfaellig.push(task);
		}
		// Check if today
		else if (taskDateOnly === todayStr) {
			result.heute.push(task);
		}
		// Check if this week
		else if (taskDate >= weekStart && taskDate <= weekEnd) {
			result.dieseWoche.push(task);
		}
		// Check if next week
		else if (taskDate >= nextWeekStart && taskDate <= nextWeekEnd) {
			result.naechsteWoche.push(task);
		}
		// Later
		else {
			result.spaeter.push(task);
		}
	}

	return result;
}

/**
 * Get status label in German
 */
export function getStatusLabel(status: TaskStatus): string {
	const labels: Record<TaskStatus, string> = {
		OPEN: 'Offen',
		IN_PROGRESS: 'In Arbeit',
		DONE: 'Erledigt',
		CANCELLED: 'Abgebrochen'
	};
	return labels[status];
}

/**
 * Get priority label
 */
export function getPriorityLabel(category: TaskPriorityCategory): string {
	return category;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
	const result = new Date(date);
	result.setFullYear(result.getFullYear() + years);
	return result;
}
