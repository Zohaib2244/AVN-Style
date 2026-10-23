import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BranchList, Heartbeat, Lattice, SpringCheck, StatusMark, fmtElapsed } from '../src/marks';
import { CodeSlots, Step, Stepper, insertDigits } from '../src/flows';

describe('marks', () => {
  it('fmtElapsed', () => {
    expect(fmtElapsed(2.34)).toBe('2.3s');
    expect(fmtElapsed(72)).toBe('1m 12.0s');
  });
  it('StatusMark carries its state and a word', () => {
    const { rerender } = render(<StatusMark state="wait" />);
    expect(screen.getByRole('img', { name: 'Waiting' })).toHaveAttribute('data-state', 'wait');
    rerender(<StatusMark state="ok" label="Backup restored" task />);
    const mark = screen.getByText('Backup restored').closest('.smark')!;
    expect(mark).toHaveAttribute('data-state', 'ok');
    expect(mark).toHaveAttribute('data-task');
  });
  it('SpringCheck is a checkbox that toggles', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SpringCheck label="Invite the team" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Invite the team' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    await user.click(box);
    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it('Lattice says what it waits for and how it ended', () => {
    const { rerender } = render(<Lattice label="Reading events" elapsed={1.2} />);
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'working');
    expect(screen.getByRole('status')).toHaveTextContent('Reading events 1.2s');
    rerender(<Lattice status="done" label="Reading events" elapsed={2.3} />);
    expect(screen.getByRole('status')).toHaveTextContent('Done in 2.3s');
  });
  it('Heartbeat shows the count and goes quiet when data stops', () => {
    const { rerender } = render(<Heartbeat tick={1} count={1204} label="Receiving events" />);
    expect(screen.getByRole('status')).toHaveTextContent('1,204');
    rerender(<Heartbeat live={false} tick={1} count={1204} label="Receiving events" />);
    expect(screen.getByRole('status')).toHaveClass('off');
  });
  it('BranchList marks the current child and picks another', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BranchList label="Related" current="b" onSelect={onSelect} items={[{ id: 'a', label: 'Level 11' }, { id: 'b', label: 'Level 12' }]} />);
    expect(screen.getByRole('option', { name: 'Level 12' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('option', { name: 'Level 11' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });
});

describe('flows', () => {
  it('insertDigits lands digits from a slot and cascades a paste', () => {
    expect(insertDigits(['', '', '', ''], '4', 0)).toEqual({ code: ['4', '', '', ''], active: 1 });
    expect(insertDigits(['4', '', '', ''], '21-7x', 1)).toEqual({ code: ['4', '2', '1', '7'], active: 3 });
    expect(insertDigits(['4', '2', '', ''], 'abc', 2)).toEqual({ code: ['4', '2', '', ''], active: 2 });
  });
  it('CodeSlots reports progress and completion', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<CodeSlots length={4} label="Pairing code" onComplete={onComplete} message="Type the code." />);
    const input = screen.getByLabelText('Pairing code');
    await user.click(input);
    await user.keyboard('42');
    expect(screen.getByRole('status')).toHaveTextContent('2 of 4 digits entered');
    await user.keyboard('17');
    expect(onComplete).toHaveBeenCalledWith('4217');
  });
  it('Stepper walks forward, keeps future steps closed, and completes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(
      <Stepper label="Pair a device" onStepChange={onStepChange} onComplete={onComplete}>
        <Step title="Install">Drop the package in.</Step>
        <Step title="Pair">Enter the code.</Step>
      </Stepper>,
    );
    expect(screen.getByRole('tab', { name: /Install/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('tab', { name: /Pair/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    expect(onStepChange).toHaveBeenCalledWith(2);
    expect(screen.getByText('Enter the code.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Install/ })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: /Complete/ }));
    expect(onComplete).toHaveBeenCalled();
    expect(screen.getByText('All set')).toBeInTheDocument();
  });
});
