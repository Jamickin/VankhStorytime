// Pure client-side SPA. State lives in localStorage, so disable SSR and
// per-route prerendering; the static adapter's fallback page boots the router.
export const ssr = false;
export const prerender = false;
