import { describe, expect, it } from 'vitest';
import { cx, fmt, niceStep, relativeTime, secs } from '../src/cx';
import { formatDelta } from '../src/primitives';

describe('helpers', () => {
  it('cx joins truthy class names only', () => {
    expect(cx('a', false, null, undefined, 'b')).toBe('a b');
  });
  it('fmt groups thousands and fixes decimals', () => {
    expect(fmt(216874)).toBe('216,874');
    expect(fmt(5.94, 1)).toBe('5.9');
  });
  it('secs reads like a person', () => {
    expect(secs(52)).toBe('52s');
    expect(secs(72)).toBe('1m 12s');
    expect(secs(61)).toBe('1m 01s');
  });
  it('relativeTime buckets', () => {
    const now = 1_000_000_000;
    expect(relativeTime(now - 10_000, now)).toBe('just now');
    expect(relativeTime(now - 2 * 60_000, now)).toBe('2 min ago');
    expect(relativeTime(now - 3 * 3_600_000, now)).toBe('3 h ago');
    expect(relativeTime(now - 2 * 86_400_000, now)).toBe('2 d ago');
  });
  it('niceStep rounds to 1, 2, 5 times a power of ten', () => {
    expect(niceStep(0.8)).toBe(1);
    expect(niceStep(13)).toBe(20);
    expect(niceStep(60)).toBe(100);
    expect(niceStep(3.2)).toBe(5);
  });
});

describe('formatDelta (the change cell)', () => {
  it('less drop is good even though the number fell', () => {
    expect(formatDelta(-20.6)).toEqual({ text: '↓ −20.6 pp · less drop', tone: 'good' });
  });
  it('more drop is bad', () => {
    expect(formatDelta(6.2)).toEqual({ text: '↑ +6.2 pp · more drop', tone: 'bad' });
  });
  it('drops trailing .0', () => {
    expect(formatDelta(1).text).toBe('↑ +1 pp · more drop');
  });
  it('under 0.5 reads unchanged and neutral', () => {
    expect(formatDelta(0.3)).toEqual({ text: '+0.3 pp · unchanged', tone: 'flat' });
    expect(formatDelta(0)).toEqual({ text: '0 pp · unchanged', tone: 'flat' });
  });
  it('can flip the meaning (more is good)', () => {
    expect(formatDelta(4, { lessIsGood: false, goodWord: 'higher', badWord: 'lower' })).toEqual({ text: '↑ +4 pp · higher', tone: 'good' });
  });
});
