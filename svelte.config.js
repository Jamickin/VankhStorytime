import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Client-only SPA: data lives in localStorage, so there is nothing to
		// prerender per route. The fallback page boots the client router for
		// dynamic routes like /story/[id].
		adapter: adapter({ fallback: '200.html' })
	}
};

export default config;
