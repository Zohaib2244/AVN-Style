import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameCard, Pipeline, SetupChecklist, type GameSummary, type SetupStep } from '../src/cards';
import { Button, Count, EmptyState, Kpi, Segmented, Sparkline, Tag } from '../src/primitives';
import { Definition } from '../src/overlays';
import { Block, NutBotPanel, ToolTrace, type NbMessage } from '../src/assistant';

describe('primitives', () => {
  it('Tag maps kind, dot and outline to classes', () => {
    render(<Tag kind="done" dot outline>Done · to confirm</Tag>);
    expect(screen.getByText('Done · to confirm')).toHaveClass('tag', 'done', 'dot', 'o');
  });
  it('Count kinds', () => {
    render(<Count n={3} kind="warn" />);
    expect(screen.getByText('3')).toHaveClass('cnt', 'warn');
  });
  it('a loading Button is disabled, busy, and says what is happening', async () => {
    const { rerender } = render(<Button icon="down">Export data</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Export data');
    rerender(<Button icon="down" loading loadingLabel="Preparing…">Export data</Button>);
    const b = screen.getByRole('button');
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute('aria-busy', 'true');
    expect(b).toHaveTextContent('Preparing…');
    expect(b.querySelector('.spinner')).not.toBeNull();
  });
  it('Segmented marks the current option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented label="Time zone" value="local" onChange={onChange} options={[{ value: 'local', label: 'Local' }, { value: 'utc', label: 'UTC' }]} />);
    expect(screen.getByRole('radio', { name: 'Local' })).toHaveAttribute('aria-checked', 'true');
    expect(document.querySelector('.seg.rubber .seg-thumb')).not.toBeNull();
    await user.click(screen.getByRole('radio', { name: 'UTC' }));
    expect(onChange).toHaveBeenCalledWith('utc');
  });
  it('Segmented moves with the arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented label="Density" value="comfort" onChange={onChange} options={[{ value: 'comfort', label: 'Roomy' }, { value: 'compact', label: 'Compact' }]} />);
    screen.getByRole('radio', { name: 'Roomy' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('compact');
  });
  it('Kpi: label, number, context, unit, optional sparkline', () => {
    const { container } = render(<Kpi label="Stickiness" value={5.9} decimals={1} unit="%" context="avg DAU ÷ MAU" spark={[1, 2, 3]} />);
    expect(screen.getByText('Stickiness')).toBeInTheDocument();
    expect(screen.getByText('5.9')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('avg DAU ÷ MAU')).toBeInTheDocument();
    expect(container.querySelector('svg.spark')).not.toBeNull();
  });
  it('Sparkline needs at least two points', () => {
    const { container } = render(<Sparkline data={[3]} />);
    expect(container.querySelector('svg')).toBeNull();
  });
  it('EmptyState: art, title, sentence, action', () => {
    render(<EmptyState title="No players match" art={<i data-testid="art" />} action={<Button>Clear rules</Button>}>Loosen a rule or switch AND to OR.</EmptyState>);
    expect(screen.getByTestId('art')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No players match' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear rules' })).toBeInTheDocument();
  });
});

describe('Definition', () => {
  it('explains a term on keyboard focus', async () => {
    const user = userEvent.setup();
    render(<Definition term="Stickiness" source="From the AVN events standard">Average daily players divided by monthly players.</Definition>);
    await user.tab();
    expect(await screen.findAllByText(/Average daily players divided/)).not.toHaveLength(0);
  });
});

const game: GameSummary = { id: 'zr', name: 'Zombie Rush', packageName: 'com.zombie.pixel.flow.game', initials: 'ZO', android: 216874, ios: 0, dauToday: 14, dauYesterday: 197, events: 216874, lastEvent: 'Oct 23, 2026, 12:47 AM', live: true };

describe('GameCard', () => {
  it('identity, platforms, today vs yesterday, freshness; one link', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<GameCard game={game} onOpen={onOpen} />);
    expect(screen.getByText('Android · 216,874')).toBeInTheDocument();
    expect(screen.getByText('+ iOS')).toHaveClass('add');
    expect(screen.getByText('Live')).toHaveClass('ok');
    expect(screen.getByText(/197 yesterday/)).toBeInTheDocument();
    expect(screen.getByText(/Last event Oct 23, 2026/)).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith('zr');
  });
  it('a quiet game says Quiet', () => {
    render(<GameCard game={{ ...game, live: false }} onOpen={() => {}} />);
    expect(screen.getByText('Quiet')).toHaveClass('plain');
  });
});

describe('SetupChecklist (Done → Verified)', () => {
  const steps: SetupStep[] = [
    { id: 'sdk', title: 'Unity SDK added', detail: 'Events arriving', state: 'ok' },
    { id: 'dict', title: 'Event dictionary filled', detail: 'Imported 24', state: 'done', action: <Button size="sm">Check now</Button> },
    { id: 'rel', title: 'Release seen', detail: 'Waiting', state: 'wait' },
    { id: 'team', title: 'Team invited', detail: 'Only you', state: 'todo' },
  ];
  it('uses a distinct tag per state and counts only verified', () => {
    render(<SetupChecklist title="Set up Nut Sort Puzzle" steps={steps} />);
    expect(screen.getByText('1 of 4 verified')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toHaveClass('ok');
    expect(screen.getByText('Done · to confirm')).toHaveClass('done');
    expect(screen.getByText('Waiting', { selector: '.tag' })).toHaveClass('info');
    expect(screen.getByText('To do')).toHaveClass('plain');
  });
  it('can be hidden and shown', async () => {
    const user = userEvent.setup();
    render(<SetupChecklist title="Set up" steps={steps} />);
    const toggle = screen.getByRole('button', { name: 'Hide steps' });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Show steps' })).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.collapse')).toHaveClass('shut');
  });
  it('disappears once every step is verified', () => {
    const { container } = render(<SetupChecklist title="Set up" steps={steps.map((s) => ({ ...s, state: 'ok' as const }))} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Pipeline', () => {
  it('Done steps offer a check; Verified do not; waiting pulses', async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn();
    render(<Pipeline steps={[{ label: 'Ingest', detail: '1.1 s', state: 'ok' }, { label: 'Stored', detail: 'to confirm', state: 'done' }, { label: 'Dictionary', detail: 'waiting', state: 'wait' }]} onVerify={onVerify} />);
    expect(document.querySelector('.ts.done')).not.toBeNull();
    expect(document.querySelector('.ts.wait')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Check now' }));
    expect(onVerify).toHaveBeenCalledWith(1);
    expect(document.querySelectorAll('.pkt')).toHaveLength(3);
  });
  it('no moving packets when not live', () => {
    render(<Pipeline live={false} steps={[{ label: 'a', detail: '', state: 'ok' }]} />);
    expect(document.querySelectorAll('.pkt')).toHaveLength(0);
  });
});

describe('NutBot', () => {
  it('ToolTrace folds to "Used 2 tools" and reopens to audit inputs', async () => {
    const user = userEvent.setup();
    render(<ToolTrace done tools={[{ name: 'get_player_story', args: 'player: u_7f3a2c', done: true }, { name: 'count_events', args: 'format = rewarded', done: true }]} />);
    const head = screen.getByRole('button', { name: /Used 2 tools/ });
    expect(head).toHaveAttribute('aria-expanded', 'false');
    await user.click(head);
    expect(head).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('get_player_story')).toBeInTheDocument();
    expect(screen.getByText('player: u_7f3a2c')).toBeInTheDocument();
  });
  it('a working trace is a thought line that says Thinking… and shows the running call chip', () => {
    render(<ToolTrace done={false} tools={[{ name: 'run_funnel', args: '', done: false }]} />);
    expect(screen.getByRole('button', { name: /Thinking/ })).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelector('.callchip[data-status="running"]')).not.toBeNull();
    expect(document.querySelector('.thought[data-working]')).not.toBeNull();
  });
  it('a proposal changes nothing until confirmed, then says Undo is in the toast', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Block block={{ type: 'proposal', title: 'Save this funnel?', confirmLabel: 'Save funnel', onConfirm }} />);
    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save funnel' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Undo is in the toast/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save funnel' })).toBeNull();
  });
  it('declining leaves things as they were', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(), onDecline = vi.fn();
    render(<Block block={{ type: 'proposal', title: 'x', confirmLabel: 'Do it', onConfirm, onDecline }} />);
    await user.click(screen.getByRole('button', { name: 'Not now' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onDecline).toHaveBeenCalled();
    expect(screen.getByText('Left as it was.')).toBeInTheDocument();
  });
  it('a checklist block shows a tag per row and a word, not only a colour', () => {
    render(<Block block={{ type: 'checklist', title: 'Privacy checklist', rows: [{ title: 'consent_requested', detail: 'UMP request sent', kind: 'ok', tag: 'Verified' }, { title: 'gdpr_applies', detail: 'never logged', kind: 'bad', tag: 'Missing' }] }} />);
    expect(screen.getByText('Verified')).toHaveClass('ok');
    expect(screen.getByText('Missing')).toHaveClass('bad');
  });
  it('a table block with link buttons', async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    render(<Block block={{ type: 'table', title: 'Last events', columns: ['Session', 'Last event'], rows: [['1', 'level_complete']], links: [{ label: 'Open timeline', onClick: open }] }} />);
    expect(screen.getByText('level_complete')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open timeline' }));
    expect(open).toHaveBeenCalled();
  });

  const messages: NbMessage[] = [
    { role: 'user', text: 'Where do players drop off most?' },
    { role: 'bot', done: true, tools: [{ name: 'get_level_progress', args: 'levels 1–20', done: true }], text: <p>Level 12.</p>, scope: 'Same filters as the page · last 30 days', pin: { title: 'Biggest drop', value: 'Level 12', sub: '35% stop there' } },
  ];
  const panel = (extra: Partial<React.ComponentProps<typeof NutBotPanel>> = {}) => (
    <NutBotPanel open onClose={() => {}} messages={[]} busy={false} onSend={() => {}} onNew={() => {}} context={[{ id: 'game', label: 'Nut Sort Puzzle', fixed: true }, { id: 'range', label: 'Last 30 days' }]} onToggleContext={() => {}} suggestions={['Where do players drop off most?']} {...extra} />
  );
  it('the empty panel offers suggestions that send', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(panel({ onSend }));
    await user.click(screen.getByRole('button', { name: 'Where do players drop off most?' }));
    expect(onSend).toHaveBeenCalledWith('Where do players drop off most?');
  });
  it('context chips: the game is fixed, others can be left out', async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    render(panel({ onToggleContext: toggle }));
    expect(screen.queryByRole('button', { name: /Ignore Nut Sort Puzzle/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Ignore Last 30 days' }));
    expect(toggle).toHaveBeenCalledWith('range');
  });
  it('Enter sends, Shift+Enter does not', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(panel({ onSend }));
    const box = screen.getByLabelText('Message NutBot');
    await user.type(box, 'hello{Shift>}{Enter}{/Shift}there');
    expect(onSend).not.toHaveBeenCalled();
    await user.type(box, '{Enter}');
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0]![0]).toContain('hello');
  });
  it('shows the answer with its scope, and pins it once', async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();
    render(panel({ messages, onPin }));
    expect(screen.getByText('Level 12.')).toBeInTheDocument();
    expect(screen.getByText('Same filters as the page · last 30 days')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pin to Overview' }));
    expect(onPin).toHaveBeenCalledWith({ title: 'Biggest drop', value: 'Level 12', sub: '35% stop there' });
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });
  it('while busy, the send button becomes Stop and stops', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(panel({ busy: true, onStop }));
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalled();
  });
  it('empty draft: Send is disabled', () => {
    render(panel());
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
  it('closed renders nothing', () => {
    render(panel({ open: false }));
    expect(screen.queryByLabelText('NutBot')).toBeNull();
  });
});
