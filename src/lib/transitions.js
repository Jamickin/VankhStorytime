// Content-arrival transition. `ember` is a gentle warm rise/bloom used for
// page turns in the reader, so the next page seems to surface from the ash.
// (Route-level "burning paper" lives in +layout.svelte as a full-screen veil.)

import { cubicOut } from "svelte/easing";

const reduce = () =>
	typeof window !== "undefined" &&
	window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;

export function ember(
	node,
	{
		duration = 700,
		y = 14,
		delay = 0,
	} = {}
) {
	if (reduce())
		return { duration: 0 };
	return {
		duration,
		delay,
		easing: cubicOut,
		css: (t) => {
			const inv = 1 - t;
			return `
				opacity: ${t};
				filter: blur(${inv * 6}px) brightness(${1 + inv * 0.8})
					drop-shadow(0 0 ${inv * 16}px rgba(255, 150, 60, ${inv * 0.45}));
				transform: translateY(${inv * y}px) scale(${0.99 + t * 0.01});
			`;
		},
	};
}
