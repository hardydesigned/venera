import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'venera_theme';

function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadTheme(): Theme {
	if (typeof window === 'undefined') return 'system';
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	} catch {
		// ignore
	}
	return 'system';
}

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	const resolved = theme === 'system' ? getSystemTheme() : theme;
	document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export const themeStore = writable<Theme>(loadTheme());

export function setTheme(theme: Theme) {
	themeStore.set(theme);
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// ignore
		}
		applyTheme(theme);
	}
}

export function getEffectiveTheme(): 'light' | 'dark' {
	const t = loadTheme();
	return t === 'system' ? getSystemTheme() : t;
}

/** Im Browser: Theme anwenden und auf Änderungen reagieren. In +layout.svelte onMount aufrufen. */
export function initThemeSync() {
	if (typeof window === 'undefined') return;
	const stored = loadTheme();
	themeStore.set(stored);
	let currentTheme: Theme = stored;
	applyTheme(stored);
	themeStore.subscribe((theme) => {
		currentTheme = theme;
		applyTheme(theme);
	});
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (currentTheme === 'system') applyTheme('system');
	});
}
