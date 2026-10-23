import { useEffect, useRef, type ReactElement } from 'react';
import { useReducedMotion } from 'motion/react';

/*
 * Pixel field (ux/references/components.md, motion.md "ambient life"): a canvas of faint pixels
 * behind a card. Twinkles at ≤ 8 % opacity, brightens under the pointer, bursts once when `burst`
 * changes. Colours are the contract roles read at runtime, so any style works. Put it inside an
 * element with class `pxhost`; only on empty states, the add-a-game card and the Verified moment.
 */

/** The computed colour of a contract role (`--text`, `--accent`, `--ok`) as seen from `el`. */
export function roleColour(el: HTMLElement, role: string): string {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  probe.style.color = `var(${role})`;
  el.appendChild(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

type Cell = { x: number; y: number; tint: number; ph: number; sp: number };

export function PixelField({ burst, gap = 8, className }: { /** Change this value to play a burst. */ burst?: number | string; gap?: number; className?: string }): ReactElement {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const burstAt = useRef(0);
  const first = useRef(true);
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = canvas.current;
    const host = cv?.parentElement;
    const ctx = cv?.getContext('2d');
    if (!cv || !host || !ctx) return undefined;
    let cells: Cell[] = [], w = 0, h = 0, pointer: { x: number; y: number } | null = null, raf = 0, cols = ['', '', ''];

    const resize = () => {
      const r = host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = [roleColour(host, '--text'), roleColour(host, '--accent'), roleColour(host, '--ok')];
      cells = [];
      const cn = Math.floor((w - 1) / gap) + 1, rn = Math.floor((h - 1) / gap) + 1, ox = (w - (cn - 1) * gap) / 2, oy = (h - (rn - 1) * gap) / 2;
      for (let y = 0; y < rn; y++) for (let x = 0; x < cn; x++) cells.push({ x: ox + x * gap, y: oy + y * gap, tint: Math.random() < 0.85 ? 0 : 1, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.8 });
    };
    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000, b = burstAt.current ? Math.min(1, (now - burstAt.current) / 650) : 1, bursting = Boolean(burstAt.current) && b < 1;
      const cx = w / 2, cy = h / 2, mr = Math.hypot(cx, cy);
      for (const c of cells) {
        let a = reduce ? 0.05 : 0.08 * (0.5 + 0.5 * Math.sin(t * c.sp * 1.4 + c.ph));
        if (pointer) { const d = Math.hypot(c.x - pointer.x, c.y - pointer.y); if (d < 90) a = Math.max(a, 0.5 * (1 - d / 90) ** 2); }
        let tint = c.tint;
        if (bursting) { const dd = Math.hypot(c.x - cx, c.y - cy) / mr, ring = 1 - Math.min(1, Math.abs(dd - b) * 6), ba = ring * (1 - b) * 0.9; if (ba > a) { a = ba; tint = 2; } }
        if (a < 0.005) continue;
        ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = cols[tint]!; ctx.fillRect(c.x - 1, c.y - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
      raf = !reduce || bursting || pointer ? requestAnimationFrame(draw) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    kickRef.current = kick;
    const onMove = (e: PointerEvent) => { const r = host.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; kick(); };
    const onLeave = () => { pointer = null; kick(); };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { resize(); kick(); }) : null;
    ro?.observe(host);
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => { resize(); kick(); }) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette', 'data-style'] });
    const onVisible = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); };
    document.addEventListener('visibilitychange', onVisible);
    resize(); kick();
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisible);
      ro?.disconnect(); mo?.disconnect();
    };
  }, [gap, reduce]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (burst === undefined) return;
    burstAt.current = performance.now();
    kickRef.current();
  }, [burst]);

  return <canvas ref={canvas} className={className ? `pxfield ${className}` : 'pxfield'} aria-hidden="true" />;
}
