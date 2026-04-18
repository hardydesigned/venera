
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(protected)" | "/" | "/auth" | "/auth/callback" | "/(protected)/calendar" | "/(protected)/calendar/woche" | "/forgot-password" | "/(protected)/inbox" | "/login" | "/(protected)/projects" | "/register" | "/reset-password";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/(protected)": Record<string, never>;
			"/": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/(protected)/calendar": Record<string, never>;
			"/(protected)/calendar/woche": Record<string, never>;
			"/forgot-password": Record<string, never>;
			"/(protected)/inbox": Record<string, never>;
			"/login": Record<string, never>;
			"/(protected)/projects": Record<string, never>;
			"/register": Record<string, never>;
			"/reset-password": Record<string, never>
		};
		Pathname(): "/" | "/auth/callback" | "/calendar" | "/calendar/woche" | "/forgot-password" | "/inbox" | "/login" | "/projects" | "/register" | "/reset-password";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/background.png" | "/favicon.ico" | "/robots.txt" | string & {};
	}
}