import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Icon, type IconName } from './icons';
import { IconButton } from './shell';

/** Day and night are the two looks every palette has. "system" follows the device and is the default. */
export type Theme = 'system' | 'day' | 'night';

export const THEME_KEY = 'avn-theme';
const ATTR: Record<Theme, 'light' | 'dark' | null> = { system: null, day: 'light', night: 'dark' };
const OPTIONS: Array<{ value: Theme; label: string; icon: IconName }> = [
  { value: 'day', label: 'Day', icon: 'sun' },
  { value: 'night', label: 'Night', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];

export function readTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'day' || v === 'night' ? v : 'system';
  } catch { return 'system'; }
}

/** Sets `data-theme` on <html>, remembers the choice, and fades colours for a moment (not under reduced motion). */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  const attr = ATTR[theme];
  const fade = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (fade) { root.classList.add('theme-switching'); window.setTimeout(() => root.classList.remove('theme-switching'), 300); }
  if (attr) root.setAttribute('data-theme', attr); else root.removeAttribute('data-theme');
  try { if (theme === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, theme); } catch { /* private mode */ }
}

/**
 * Put this in a blocking <script> in <head> so the saved theme is on <html> before the first paint (no flash of the wrong one):
 * `<script>${themeInitScript}</script>`
 */
export const themeInitScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='day')document.documentElement.setAttribute('data-theme','light');else if(t==='night')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, set] = useState<Theme>(readTheme);
  const change = useCallback((t: Theme) => { applyTheme(t); set(t); }, []);
  useEffect(() => { applyTheme(theme); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [theme, change];
}

/**
 * `seg` (Day / Night / System, with icons) belongs in settings or the account menu.
 * `button` is one icon button in the top bar that steps Day → Night → System.
 */
export function ThemeSwitch({ theme, onChange, variant = 'seg' }: { theme: Theme; onChange: (t: Theme) => void; variant?: 'seg' | 'button' }): ReactElement {
  if (variant === 'button') {
    const i = OPTIONS.findIndex((o) => o.value === theme);
    const next = OPTIONS[(i + 1) % OPTIONS.length]!;
    const cur = OPTIONS[i]!;
    return <IconButton icon={cur.icon} label={`Theme: ${cur.label}. Switch to ${next.label}`} onClick={() => onChange(next.value)} />;
  }
  return (
    <div className="seg theme-seg" role="group" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button key={o.value} type="button" className={o.value === theme ? 'on' : undefined} aria-pressed={o.value === theme} onClick={() => onChange(o.value)}>
          <Icon name={o.icon} size={14} /> {o.label}
        </button>
      ))}
    </div>
  );
}
