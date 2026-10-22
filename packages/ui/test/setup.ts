import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

if (!window.matchMedia) {
  window.matchMedia = (q: string) => ({ matches: q.includes('reduce'), media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
}
if (!('ResizeObserver' in window)) {
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
}
Element.prototype.scrollIntoView = vi.fn();

// Tests run with reduced motion on (no waiting for animations); Motion warns about it in dev.
const warn = console.warn;
console.warn = (...args: unknown[]) => { if (String(args[0]).includes('Reduced Motion')) return; warn(...args); };
