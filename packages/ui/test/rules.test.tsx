import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConditionEditor, HighlightsBar, MAX_DEPTH, RuleBar, RuleSentence, conditionError, getNode, matchIndices, matchesEvent, stepMatch, updateNode,
  type ConditionGroup, type EventLike, type Highlight, type PlayerRule,
} from '../src/rules';

const ev = (name: string, params: EventLike['params'] = {}): EventLike => ({ name, params });
const group = (match: 'all' | 'any', ...conditions: ConditionGroup['conditions']): ConditionGroup => ({ match, conditions });
const param = (p: string, op: 'eq' | 'gte' | 'exists' | 'missing' | 'contains', value = '') => ({ field: 'param' as const, param: p, op, value });
const named = (op: 'eq' | 'contains', value: string) => ({ field: 'event' as const, param: '', op, value });

describe('matchesEvent', () => {
  it('compares names case-insensitively and numbers numerically', () => {
    expect(matchesEvent(ev('Level_Complete', { level: 12 }), group('all', named('eq', 'level_complete'), param('level', 'gte', '10')))).toBe(true);
    expect(matchesEvent(ev('level_complete', { level: 9 }), group('all', param('level', 'gte', '10')))).toBe(false);
    expect(matchesEvent(ev('x', { level: '12' }), group('all', param('level', 'eq', '12')))).toBe(true);
  });
  it('AND needs all, OR needs any, an empty group matches nothing', () => {
    const e = ev('ad_impression', { format: 'rewarded' });
    expect(matchesEvent(e, group('all', named('contains', 'ad_'), param('format', 'eq', 'interstitial')))).toBe(false);
    expect(matchesEvent(e, group('any', named('contains', 'ad_'), param('format', 'eq', 'interstitial')))).toBe(true);
    expect(matchesEvent(e, group('all'))).toBe(false);
  });
  it('exists and missing look at the parameter only', () => {
    expect(matchesEvent(ev('x', { price: 2.99 }), group('all', param('price', 'exists')))).toBe(true);
    expect(matchesEvent(ev('x'), group('all', param('price', 'missing')))).toBe(true);
    expect(matchesEvent(ev('x'), group('all', param('price', 'eq', '1')))).toBe(false);
  });
  it('nested groups work', () => {
    const tree = group('all', named('contains', 'level'), group('any', param('level', 'eq', '3'), param('level', 'eq', '4')));
    expect(matchesEvent(ev('level_start', { level: 4 }), tree)).toBe(true);
    expect(matchesEvent(ev('level_start', { level: 5 }), tree)).toBe(false);
  });
});

describe('conditionError (first problem in plain words)', () => {
  it('flags a missing parameter, value or number', () => {
    expect(conditionError(group('all', param('', 'eq', '1')))).toBe('Choose a parameter.');
    expect(conditionError(group('all', param('level', 'eq', '')))).toBe('Fill in a value.');
    expect(conditionError(group('all', param('level', 'gte', 'abc')))).toBe('Compare with a number.');
  });
  it('exists / missing need no value', () => {
    expect(conditionError(group('all', param('level', 'exists')))).toBe('');
  });
  it('an empty nested group is a problem, an empty root is not', () => {
    expect(conditionError(group('all'))).toBe('');
    expect(conditionError(group('all', group('any')))).toMatch(/empty/);
  });
  it('limits depth', () => {
    let g: ConditionGroup = group('all', param('a', 'exists'));
    for (let i = 0; i < MAX_DEPTH + 1; i++) g = group('all', g);
    expect(conditionError(g)).toMatch(/levels of groups/);
  });
});

describe('updateNode / getNode (immutable paths)', () => {
  const tree = group('all', param('a', 'eq', '1'), group('any', param('b', 'eq', '2'), param('c', 'eq', '3')));
  it('updates a nested condition without mutating', () => {
    const next = updateNode(tree, '1.0', (n) => ({ ...(n as typeof tree.conditions[0] & object), value: '9' }) as never);
    expect((getNode(next, '1.0') as { value: string }).value).toBe('9');
    expect((getNode(tree, '1.0') as { value: string }).value).toBe('2');
  });
  it('removes by returning null', () => {
    const next = updateNode(tree, '1.1', () => null);
    expect((getNode(next, '1') as ConditionGroup).conditions).toHaveLength(1);
  });
  it('updates the root', () => {
    expect(updateNode(tree, '', (n) => ({ ...(n as ConditionGroup), match: 'any' }) as never).match).toBe('any');
  });
});

describe('highlights', () => {
  const hs: Highlight[] = [
    { name: 'Levels', color: 'cyan', on: true, cond: group('any', named('contains', 'level')) },
    { name: 'Ads', color: 'gold', on: false, cond: group('any', named('contains', 'ad_')) },
  ];
  const events = [ev('session_start'), ev('level_start'), ev('ad_impression'), ev('level_complete')];
  it('only enabled, valid highlights match', () => {
    expect(matchIndices(events, hs)).toEqual([1, 3]);
    expect(matchIndices(events, [{ ...hs[1]!, on: true }])).toEqual([2]);
    expect(matchIndices(events, [{ ...hs[0]!, cond: group('any', named('contains', '')) }])).toEqual([]);
  });
  it('stepMatch wraps around in both directions', () => {
    const idx = [1, 3, 7];
    expect(stepMatch(idx, -1, 1)).toBe(1);
    expect(stepMatch(idx, 1, 1)).toBe(3);
    expect(stepMatch(idx, 7, 1)).toBe(1);
    expect(stepMatch(idx, 1, -1)).toBe(7);
    expect(stepMatch(idx, 5, 1)).toBe(7);
    expect(stepMatch(idx, 5, -1)).toBe(3);
    expect(stepMatch([], 0, 1)).toBe(-1);
  });
  it('the bar shows counts, toggles, and jumps between matches', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn(), onJump = vi.fn();
    render(<HighlightsBar highlights={hs} events={events} mode="highlight" onMode={() => {}} onToggle={onToggle} onEdit={() => {}} onAdd={() => {}} current={-1} onJump={onJump} />);
    expect(screen.getByText('2 of 4 events')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show Ads' }));
    expect(onToggle).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole('button', { name: /Next/ }));
    expect(onJump).toHaveBeenCalledWith(1);
  });
});

describe('RuleBar', () => {
  const rule = (verb: PlayerRule['verb'], event: string, c: ConditionGroup, times = 1): PlayerRule => ({ verb, event, cond: c, times });
  const base = { match: 'all' as const, onToggleMatch: () => {}, onEdit: () => {}, onRemove: () => {}, onAdd: () => {}, onClear: () => {}, total: 260 };
  it('reads a rule as a sentence', () => {
    render(<RuleSentence rule={rule('did', 'level_start', group('all', param('level', 'eq', '12')), 3)} />);
    expect(screen.getByText('did')).toBeInTheDocument();
    expect(screen.getByText('level_start')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3×')).toBeInTheDocument();
  });
  it('"didn’t do" is its own token kind', () => {
    render(<RuleSentence rule={rule('didnt', 'purchase', group('all'))} />);
    expect(screen.getByText('didn’t do')).toHaveClass('not');
  });
  it('empty: shows everyone, presets and Add rule', async () => {
    const user = userEvent.setup();
    const onPreset = vi.fn();
    render(<RuleBar {...base} rules={[]} matchCount={260} presets={[{ id: 'lvl10', label: 'Reached level 10' }]} onPreset={onPreset} />);
    expect(screen.getByText('All 260 players')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reached level 10' }));
    expect(onPreset).toHaveBeenCalledWith('lvl10');
  });
  it('with rules: match count, AND/OR button, edit, remove, clear', async () => {
    const user = userEvent.setup();
    const h = { toggle: vi.fn(), edit: vi.fn(), remove: vi.fn(), clear: vi.fn() };
    render(<RuleBar {...base} rules={[rule('did', 'level_start', group('all')), rule('didnt', 'purchase', group('all'))]} matchCount={65} onToggleMatch={h.toggle} onEdit={h.edit} onRemove={h.remove} onClear={h.clear} />);
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('players match every rule')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'AND' }));
    expect(h.toggle).toHaveBeenCalled();
    await user.click(screen.getAllByRole('button', { name: 'Edit rule' })[1]!);
    expect(h.edit).toHaveBeenCalledWith(1);
    await user.click(screen.getAllByRole('button', { name: 'Remove rule' })[0]!);
    expect(h.remove).toHaveBeenCalledWith(0);
    await user.click(screen.getByRole('button', { name: 'Clear rules' }));
    expect(h.clear).toHaveBeenCalled();
  });
});

describe('ConditionEditor', () => {
  function Host({ initial }: { initial: ConditionGroup }) {
    const [t, setT] = useState(initial);
    return <><ConditionEditor tree={t} onChange={setT} params={['level']} events={['level_start']} /><output data-testid="json">{JSON.stringify(t)}</output></>;
  }
  const read = () => JSON.parse(screen.getByTestId('json').textContent ?? '{}') as ConditionGroup;
  it('adds a condition and a group, and removes a condition', async () => {
    const user = userEvent.setup();
    render(<Host initial={group('all', param('level', 'eq', '1'))} />);
    await user.click(screen.getByRole('button', { name: '+ Condition' }));
    expect(read().conditions).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: '+ Group' }));
    expect(read().conditions).toHaveLength(3);
    await user.click(screen.getAllByRole('button', { name: 'Remove condition' })[0]!);
    expect(read().conditions).toHaveLength(2);
  });
  it('switches the group between all and any', async () => {
    const user = userEvent.setup();
    render(<Host initial={group('all', param('level', 'eq', '1'))} />);
    await user.click(screen.getByRole('button', { name: 'any (OR)' }));
    expect(read().match).toBe('any');
  });
  it('typing a value updates the tree; switching to event name resets the operator', async () => {
    const user = userEvent.setup();
    render(<Host initial={group('all', param('level', 'eq', ''))} />);
    await user.type(screen.getByLabelText('Value'), '12');
    expect((read().conditions[0] as { value: string }).value).toBe('12');
    await user.selectOptions(screen.getByLabelText('Field'), 'event');
    expect((read().conditions[0] as { op: string; field: string }).field).toBe('event');
    expect((read().conditions[0] as { op: string }).op).toBe('contains');
  });
  it('does not offer + Group at the maximum depth', () => {
    let g: ConditionGroup = group('all', param('a', 'exists'));
    for (let i = 0; i < MAX_DEPTH - 1; i++) g = group('all', g);
    render(<Host initial={g} />);
    expect(screen.getAllByRole('button', { name: '+ Group' }).length).toBe(MAX_DEPTH - 1);
  });
});
