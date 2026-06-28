import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Client-only SPA: ssr/prerender are off, so there is nothing to
		// prerender per route. The fallback page boots the client router for
		// dynamic routes like /read/[slug]. Netlify serves it via static/_redirects.
		adapter: adapter({ fallback: '200.html' })
	}
};

export default config;
