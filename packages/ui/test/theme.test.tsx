import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ThemeSwitch, applyTheme, readTheme, themeInitScript, type Theme } from '../src/theme';

beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });

describe('theme', () => {
  it('day and night set data-theme and are remembered; system clears both', () => {
    applyTheme('night');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(readTheme()).toBe('night');
    applyTheme('day');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(readTheme()).toBe('system');
  });
  it('ignores a junk saved value', () => {
    localStorage.setItem('avn-theme', 'purple');
    expect(readTheme()).toBe('system');
  });
  it('the pre-paint script applies the saved theme', () => {
    localStorage.setItem('avn-theme', 'day');
    new Function(themeInitScript)();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
  it('the segmented switch marks the active option and changes it', async () => {
    const user = userEvent.setup();
    function Host() { const [t, set] = useState<Theme>('system'); return <ThemeSwitch theme={t} onChange={set} />; }
    render(<Host />);
    expect(screen.getByRole('button', { name: /System/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /Night/ }));
    expect(screen.getByRole('button', { name: /Night/ })).toHaveAttribute('aria-pressed', 'true');
  });
  it('the icon button steps day → night → system and says what it will do', async () => {
    const user = userEvent.setup();
    function Host() { const [t, set] = useState<Theme>('day'); return <ThemeSwitch variant="button" theme={t} onChange={set} />; }
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Theme: Day. Switch to Night' }));
    expect(screen.getByRole('button', { name: 'Theme: Night. Switch to System' })).toBeInTheDocument();
  });
});
