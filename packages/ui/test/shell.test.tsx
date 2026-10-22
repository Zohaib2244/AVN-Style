import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountMenu, AppShell, CommandPalette, SidebarNav, Sidebar, TabBar, TopBar, filterCommands, scoreCommand, type CommandItem, type NavGroup } from '../src/shell';

const groups: NavGroup[] = [
  { label: 'Analyze', items: [{ id: 'overview', label: 'Overview', icon: 'grid' }, { id: 'levels', label: 'Levels', icon: 'pad', count: 1 }] },
  { label: 'Data', items: [{ id: 'health', label: 'Data health', icon: 'pulse', live: true }] },
  { label: 'Manage', collapsible: true, defaultClosed: true, items: [{ id: 'keys', label: 'API keys', icon: 'key' }] },
];

describe('SidebarNav', () => {
  it('marks the active item and selects on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SidebarNav groups={groups} active="overview" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: /Overview/ })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: /Levels/ }));
    expect(onSelect).toHaveBeenCalledWith('levels');
  });
  it('shows a count only where something needs a look, and a live dot', () => {
    render(<SidebarNav groups={groups} active={null} onSelect={() => {}} />);
    expect(within(screen.getByRole('button', { name: /Levels/ })).getByText('1')).toBeInTheDocument();
    expect(document.querySelector('.live')).not.toBeNull();
  });
  it('a collapsible group starts closed and opens on click', async () => {
    const user = userEvent.setup();
    render(<SidebarNav groups={groups} active="overview" onSelect={() => {}} />);
    const header = screen.getByRole('button', { name: /Manage/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
  it('selecting an item inside a closed group opens it', () => {
    const { rerender } = render(<SidebarNav groups={groups} active="overview" onSelect={() => {}} />);
    rerender(<SidebarNav groups={groups} active="keys" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Manage/ })).toHaveAttribute('aria-expanded', 'true');
  });
  it('the highlight pill follows the active item', () => {
    const { rerender } = render(<SidebarNav groups={groups} active="overview" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Overview/ }).querySelector('.nav-ind')).not.toBeNull();
    rerender(<SidebarNav groups={groups} active="levels" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Levels/ }).querySelector('.nav-ind')).not.toBeNull();
    expect(document.querySelectorAll('.nav-ind')).toHaveLength(1);
  });
});

describe('AccountMenu', () => {
  it('holds the admin pages and closes after a choice', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AccountMenu name="Work" role="Local admin" initial="Z" onSelect={onSelect} items={[{ id: 'team', label: 'Team', icon: 'team' }, { id: 'settings', label: 'Settings', icon: 'sliders' }]} />);
    expect(screen.queryByRole('menu')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Work/ }));
    await user.click(screen.getByRole('menuitem', { name: /Settings/ }));
    expect(onSelect).toHaveBeenCalledWith('settings');
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('TopBar', () => {
  it('breadcrumbs: ancestors link, the last one is bold text', async () => {
    const user = userEvent.setup();
    const home = vi.fn();
    render(<TopBar crumbs={[{ label: 'Games', onClick: home }, { label: 'Nut Sort Puzzle' }, { label: 'Levels' }]} />);
    await user.click(screen.getByRole('button', { name: 'Games' }));
    expect(home).toHaveBeenCalled();
    expect(screen.getByText('Levels').tagName).toBe('B');
  });
});

describe('TabBar', () => {
  it('has the main pages plus More', async () => {
    const user = userEvent.setup();
    const onMore = vi.fn(), onSelect = vi.fn();
    render(<TabBar items={groups[0]!.items} active="overview" onSelect={onSelect} moreItems onMore={onMore} />);
    expect(screen.getByRole('button', { name: /Overview/ })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: /More/ }));
    expect(onMore).toHaveBeenCalled();
  });
});

describe('AppShell', () => {
  it('provides the size container the responsive rules measure', () => {
    render(<AppShell sidebar={<Sidebar><i /></Sidebar>}><p>page</p></AppShell>);
    expect(document.querySelector('.app-root > .app')).not.toBeNull();
    expect(document.querySelector('.app')).toHaveAttribute('data-density', 'compact');
  });
});

const items: CommandItem[] = [
  { id: 'p1', group: 'Pages', label: 'Overview', icon: 'grid', run: vi.fn() },
  { id: 'p2', group: 'Pages', label: 'Event dictionary', icon: 'book', hint: 'data', run: vi.fn() },
  { id: 'a1', group: 'Actions', label: 'Export data', icon: 'down', hint: 'zip', run: vi.fn() },
];

describe('command palette', () => {
  it('scores prefix > contains > hint > letters in order', () => {
    expect(scoreCommand({ label: 'Export data' }, 'exp')).toBe(4);
    expect(scoreCommand({ label: 'Export data' }, 'data')).toBe(3);
    expect(scoreCommand({ label: 'Export data', hint: 'zip' }, 'zip')).toBe(2);
    expect(scoreCommand({ label: 'Export data' }, 'edt')).toBe(1);
    expect(scoreCommand({ label: 'Export data' }, 'xyz')).toBe(0);
  });
  it('filters and orders by score', () => {
    // "Export data" contains the word (3); "Event dictionary" only has it as a hint (2)
    expect(filterCommands(items, 'data').map((x) => x.id)).toEqual(['a1', 'p2']);
    expect(filterCommands(items, '').length).toBe(3);
  });
  function Host({ onAsk }: { onAsk?: (t: string) => void }) {
    const [open, setOpen] = useState(true);
    return <CommandPalette open={open} onClose={() => setOpen(false)} items={items} onAsk={onAsk} />;
  }
  it('arrow keys move, Enter runs and closes', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await waitFor(() => expect(screen.getByLabelText(/Search pages/)).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(items[1]!.run).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('typed text offers "Ask NutBot" first', async () => {
    const user = userEvent.setup();
    const onAsk = vi.fn();
    render(<Host onAsk={onAsk} />);
    await user.type(screen.getByLabelText(/Search pages/), 'why did level 12 drop');
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Ask NutBot');
    await user.keyboard('{Enter}');
    expect(onAsk).toHaveBeenCalledWith('why did level 12 drop');
  });
  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.type(screen.getByLabelText(/Search pages/), 'zzzz');
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });
});
