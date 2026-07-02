<script>
	import "../app.css";
	import { onMount } from "svelte";
	import { onNavigate } from "$app/navigation";
	import FloatingSidebar from "$lib/components/FloatingSidebar.svelte";
	import LoreModal from "$lib/components/LoreModal.svelte";
	import { loreEntry, closeLore } from "$lib/stores/lorePanel.js";

	let { children } = $props();

	// Canvas used for the wispy-fire route transition.
	let canvas;

	// ── Fire transition ──────────────────────────────────────────────────────
	const COVER = 540; // ms — fire sweeps bottom→top to cover the old page
	const REVEAL = 700; // ms — fire sweeps top→bottom to clear the ash

	const reduce = () =>
		typeof window !== "undefined" &&
		window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

	let particles = [];
	let animFrame = null;

	function cancel() {
		if (animFrame !== null) {
			cancelAnimationFrame(animFrame);
			animFrame = null;
		}
	}

	// Multi-frequency sine noise for the organic fire front edge.
	function edgeNoise(x, t) {
		return (
			Math.sin(x * 0.009 + t * 2.1) * 22 +
			Math.sin(x * 0.022 + t * 3.7 + 1.2) *
				12 +
			Math.sin(x * 0.052 + t * 6.4 + 2.5) *
				6 +
			Math.sin(x * 0.097 + t * 9.9 + 0.8) *
				3
		);
	}

	// Array of {x,y} points along the fire front with organic noise applied.
	function buildFront(W, baseY, t) {
		const front = [];
		for (let x = -4; x <= W + 4; x += 4) {
			front.push({
				x,
				y: baseY + edgeNoise(x, t),
			});
		}
		return front;
	}

	// Draw the dark char fill from the fire front downward to the bottom.
	function drawChar(ctx, H, front) {
		ctx.beginPath();
		ctx.moveTo(front[0].x, H + 4);
		for (const p of front) ctx.lineTo(p.x, p.y);
		ctx.lineTo(
			front[front.length - 1].x,
			H + 4
		);
		ctx.closePath();
		ctx.fillStyle = "#0d0905";
		ctx.fill();
	}

	// Four translucent glow layers straddle the fire front on the char side,
	// giving the impression of heat radiating from burning paper.
	function drawGlow(ctx, H, front) {
		const passes = [
			{ dy: -34, c: "rgba(255,210,80,0.055)" },
			{ dy: -18, c: "rgba(255,140,30,0.095)" },
			{ dy: -6, c: "rgba(255,80,10,0.072)" },
			{ dy: 6, c: "rgba(160,25,5,0.042)" },
		];
		for (const { dy, c } of passes) {
			ctx.beginPath();
			ctx.moveTo(front[0].x, H + 4);
			for (const p of front)
				ctx.lineTo(p.x, p.y + dy);
			ctx.lineTo(
				front[front.length - 1].x,
				H + 4
			);
			ctx.closePath();
			ctx.fillStyle = c;
			ctx.fill();
		}
	}

	// Spawn wispy particles + ash particles along the fire front.
	function spawn(front) {
		for (const { x, y } of front) {
			if (Math.random() > 0.065) continue;
			const wispy = Math.random() < 0.22;
			particles.push({
				x: x + (Math.random() - 0.5) * 6,
				y,
				vx: (Math.random() - 0.5) * 0.9,
				vy: -(
					wispy
						? Math.random() * 3.8 + 1.2
						: Math.random() * 1.6 + 0.5
				),
				life: 1.0,
				decay: wispy
					? Math.random() * 0.01 + 0.007
					: Math.random() * 0.022 + 0.016,
				size: wispy
					? Math.random() * 1.1 + 0.3
					: Math.random() * 1.8 + 0.7,
				wispy,
				ash: false,
			});
		}
		// Ash particles: large, slow-rising, gray
		for (const { x, y } of front) {
			if (Math.random() > 0.02) continue;
			particles.push({
				x: x + (Math.random() - 0.5) * 14,
				y,
				vx: (Math.random() - 0.5) * 0.4,
				vy: -(Math.random() * 0.2 + 0.15),
				life: 1.0,
				decay: Math.random() * 0.003 + 0.003,
				size: Math.random() * 5 + 4,
				wispy: false,
				ash: true,
			});
		}
	}

	function tick() {
		for (
			let i = particles.length - 1;
			i >= 0;
			i--
		) {
			const p = particles[i];
			p.x +=
				p.vx + (Math.random() - 0.5) * 0.14;
			p.y += p.vy;
			p.life -= p.decay;
			if (p.life <= 0) particles.splice(i, 1);
		}
	}

	function paintParticles(ctx) {
		// Fire + wispy particles
		for (const p of particles) {
			if (p.ash) continue;
			const a =
				p.life * (p.wispy ? 0.5 : 0.82);
			ctx.beginPath();
			ctx.arc(
				p.x,
				p.y,
				p.size * (0.35 + p.life * 0.65),
				0,
				Math.PI * 2
			);
			ctx.fillStyle = `rgba(255,${Math.round(160 + p.life * 95)},${Math.round(p.life * 65)},${a.toFixed(3)})`;
			ctx.fill();
		}
		// Ash particles — gray, slow, large
		for (const p of particles) {
			if (!p.ash) continue;
			const a = p.life * 0.38;
			ctx.beginPath();
			ctx.arc(
				p.x,
				p.y,
				p.size * (0.5 + p.life * 0.5),
				0,
				Math.PI * 2
			);
			ctx.fillStyle = `rgba(60,50,40,${a.toFixed(3)})`;
			ctx.fill();
		}
	}

	// Brief micro-shake: 3 oscillations over ~durationMs.
	function screenShake(el, durationMs) {
		const offsets = [
			[-2, 1], [2, -1], [-1, 2], [1, -2], [0, 0],
		];
		let i = 0;
		const step = durationMs / offsets.length;
		function next() {
			if (i >= offsets.length) {
				el.style.transform = "";
				return;
			}
			const [dx, dy] = offsets[i++];
			el.style.transform = `translate(${dx}px,${dy}px)`;
			setTimeout(next, step);
		}
		next();
	}

	// Radial warm afterglow centered on the viewport.
	function drawAfterglow(ctx, W, H) {
		const grad = ctx.createRadialGradient(
			W / 2, H / 2, 0,
			W / 2, H / 2, Math.max(W, H) * 0.65
		);
		grad.addColorStop(0, "rgba(180,83,9,0.09)");
		grad.addColorStop(1, "rgba(180,83,9,0)");
		ctx.clearRect(0, 0, W, H);
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, W, H);
	}

	// Fade the canvas element's CSS opacity from 1 → 0 over durationMs.
	function fadeCanvasOut(el, durationMs) {
		const start = performance.now();
		function step(now) {
			const t = Math.min((now - start) / durationMs, 1);
			el.style.opacity = String(1 - t);
			if (t < 1) {
				requestAnimationFrame(step);
			} else {
				el.style.opacity = "";
				el.getContext("2d")?.clearRect(0, 0, el.width, el.height);
			}
		}
		requestAnimationFrame(step);
	}

	onMount(() => {
		const splash = document.getElementById('vankh-splash');
		if (!splash) return;

		const prefersReduced = reduce();

		if (prefersReduced || sessionStorage.getItem('vankh:splashed')) {
			// Already splashed this session or reduced motion — dismiss quickly
			setTimeout(() => splash.classList.add('dismissed'), 120);
			return;
		}

		// First-time splash: run ember particles on the splash canvas for 700ms,
		// then sweep-dismiss and mark session.
		const splashCanvas = document.getElementById('splash-canvas');
		let splashRaf = null;
		let splashParticles = [];

		if (splashCanvas) {
			const W = (splashCanvas.width = window.innerWidth);
			const H = (splashCanvas.height = window.innerHeight);
			const ctx = splashCanvas.getContext('2d');
			const startTs = performance.now();

			function splashLoop(now) {
				const elapsed = now - startTs;
				ctx.clearRect(0, 0, W, H);

				// Spawn embers from center-bottom area
				if (Math.random() < 0.55) {
					const sx = W / 2 + (Math.random() - 0.5) * W * 0.35;
					const sy = H * 0.7 + Math.random() * H * 0.2;
					splashParticles.push({
						x: sx,
						y: sy,
						vx: (Math.random() - 0.5) * 1.2,
						vy: -(Math.random() * 2.2 + 0.8),
						life: 1,
						decay: Math.random() * 0.012 + 0.008,
						size: Math.random() * 2.2 + 0.8,
					});
				}

				// Tick + paint
				for (let i = splashParticles.length - 1; i >= 0; i--) {
					const p = splashParticles[i];
					p.x += p.vx + (Math.random() - 0.5) * 0.2;
					p.y += p.vy;
					p.life -= p.decay;
					if (p.life <= 0) { splashParticles.splice(i, 1); continue; }
					const a = p.life * 0.75;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size * (0.4 + p.life * 0.6), 0, Math.PI * 2);
					ctx.fillStyle = `rgba(255,${Math.round(160 + p.life * 95)},${Math.round(p.life * 60)},${a.toFixed(3)})`;
					ctx.fill();
				}

				if (elapsed < 700) {
					splashRaf = requestAnimationFrame(splashLoop);
				} else {
					cancelAnimationFrame(splashRaf);
					splashRaf = null;
					ctx.clearRect(0, 0, W, H);
					// Dismiss with opacity fade
					splash.classList.add('dismissed');
					sessionStorage.setItem('vankh:splashed', '1');
				}
			}

			splashRaf = requestAnimationFrame(splashLoop);
		} else {
			// No canvas — fall back to quick dismiss
			setTimeout(() => {
				splash.classList.add('dismissed');
				sessionStorage.setItem('vankh:splashed', '1');
			}, 700);
		}
	});

	onNavigate((navigation) => {
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		if (animFrame !== null) return;
		if (reduce() || !canvas) return;
		cancel();
		particles = [];

		const W = (canvas.width = window.innerWidth);
		const H = (canvas.height =
			window.innerHeight);
		const ctx = canvas.getContext("2d");
		const start = performance.now();

		return new Promise((resolve) => {
			let done = false;

			// Cover: fire front rises from the bottom, char fills behind it.
			function coverFrame(now) {
				const elapsed = now - start;
				const ct = Math.min(
					elapsed / COVER,
					1
				);
				// burnY descends from H (bottom) to -35 (off-screen top)
				const burnY = H - (H + 35) * ct;
				const t = elapsed * 0.001;

				ctx.clearRect(0, 0, W, H);
				const front = buildFront(W, burnY, t);
				drawChar(ctx, H, front);
				drawGlow(ctx, H, front);
				spawn(front);
				tick();
				paintParticles(ctx);

				if (!done && ct >= 1) {
					done = true;
					// Screen shake at peak
					screenShake(canvas, 80);
					resolve(); // SvelteKit swaps the DOM now — it's hidden under full char
					navigation.complete.then(startReveal);
				} else if (!done) {
					animFrame =
						requestAnimationFrame(coverFrame);
				}
			}

			// Reveal: fire front descends from the top, clearing the char to show the new page.
			function startReveal() {
				const rs = performance.now();
				function revealFrame(now) {
					const rt = Math.min(
						(now - rs) / REVEAL,
						1
					);
					// revealY rises from -35 (top) down to H (bottom)
					const revealY =
						(H + 35) * rt - 35;
					const t = now * 0.001;

					ctx.clearRect(0, 0, W, H);
					const front = buildFront(
						W,
						revealY,
						t
					);
					drawChar(ctx, H, front);
					drawGlow(ctx, H, front);
					// Existing particles from the cover phase drift up and fade — no new spawns.
					tick();
					paintParticles(ctx);

					if (rt < 1) {
						animFrame =
							requestAnimationFrame(
								revealFrame
							);
					} else {
						// Afterglow: radial warm blush, then fade canvas out
						drawAfterglow(ctx, W, H);
						fadeCanvasOut(canvas, 200);
						animFrame = null;
					}
				}
				animFrame =
					requestAnimationFrame(revealFrame);
			}

			animFrame =
				requestAnimationFrame(coverFrame);
		});
	});
</script>

<!-- Fire canvas sits on top of everything; transparent when idle. -->
<canvas
	bind:this={canvas}
	style="position:fixed;top:0;left:0;z-index:60;pointer-events:none;"
	aria-hidden="true"
></canvas>

<FloatingSidebar />

<div class="gallery min-h-screen">
	<div
		class="embers"
		aria-hidden="true"
	></div>

	<main>
		{@render children()}
	</main>
</div>

<LoreModal entry={$loreEntry} onclose={closeLore} />
