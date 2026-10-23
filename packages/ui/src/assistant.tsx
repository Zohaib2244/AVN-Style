import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cx } from './cx';
import { Icon, type IconName } from './icons';
import { BranchList, StatusMark, fmtElapsed } from './marks';
import { Button, Tag, type StatusKind } from './primitives';

/* ───────── Message model ───────── */

export type AnswerBlock =
  | { type: 'table'; title: string; columns: string[]; rows: ReactNode[][]; links?: Array<{ label: string; onClick: () => void }> }
  | { type: 'checklist'; title: string; rows: Array<{ title: string; detail: string; kind: StatusKind; tag: string; time?: string }>; links?: Array<{ label: string; onClick: () => void }> }
  | { type: 'chart'; title: string; chart: ReactNode; links?: Array<{ label: string; onClick: () => void }> }
  | { type: 'custom'; title: string; node: ReactNode }
  | { type: 'proposal'; title: string; preview?: ReactNode; confirmLabel: string; declineLabel?: string; onConfirm: () => void; onDecline?: () => void };

export type ToolStatus = 'idle' | 'running' | 'done' | 'error';
export type ToolCall = {
  name: string;
  args: string;
  /** Kept for compatibility: `done: true` means status 'done'. */
  done?: boolean;
  status?: ToolStatus;
  /** How long this tool usually takes; sets the pace of the chip's fill. */
  expectedMs?: number;
  /** Time it took, when the app knows it. */
  ms?: number;
  icon?: IconName;
  onRetry?: () => void;
};
export type Pin = { title: string; value: string; sub: string };

export type NbMessage =
  | { role: 'user'; text: string }
  | { role: 'bot'; tools: ToolCall[]; text?: ReactNode; blocks?: AnswerBlock[]; scope?: string; pin?: Pin; done: boolean; /** seconds spent, when the app knows */ thought?: number };

export type ContextChip = { id: string; label: string; /** the game chip can't be left out */ fixed?: boolean; off?: boolean };
export type SlashCommand = { name: string; description: string; run?: () => void };

const toolStatus = (t: ToolCall): ToolStatus => t.status ?? (t.done ? 'done' : 'running');

/* ───────── Call chip ───────── */

const CHIP_WORD: Record<ToolStatus, string> = { idle: 'queued', running: 'running', done: 'done', error: 'failed' };
const fmtMs = (ms: number) => (ms < 10000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`);

/**
 * One tool call: icon, name, input, timer. Fills left to right while running (holding at 90 % until
 * it ends), washes Verified when done, shakes and offers Retry when it fails.
 */
export function ToolCallChip({ name, args, status = 'running', expectedMs = 2500, ms, icon = 'tool', onRetry, timer = true }: {
  name: string; args?: string; status?: ToolStatus; expectedMs?: number; ms?: number; icon?: IconName; onRetry?: () => void; timer?: boolean;
}): ReactElement {
  const [t, setT] = useState(ms ?? 0);
  const glyph = status === 'done' ? 'check' : status === 'error' ? 'retry' : 'tool';
  const prev = useRef(glyph);
  const was = prev.current;
  useEffect(() => { prev.current = glyph; }, [glyph]);
  useEffect(() => {
    if (status !== 'running') return undefined;
    const t0 = performance.now();
    const id = setInterval(() => setT(performance.now() - t0), 100);
    return () => { clearInterval(id); setT(performance.now() - t0); };
  }, [status]);
  const shown = ms ?? t;
  const state = (g: string) => (g === glyph ? 'in' : g === was && was !== glyph ? 'out' : undefined);
  const gTool = state('tool'), gCheck = state('check'), gRetry = state('retry');
  const spoken = `${name} ${args ?? ''}, ${CHIP_WORD[status]}${status === 'done' && shown ? ` in ${fmtMs(shown)}` : status === 'error' && shown ? ` after ${fmtMs(shown)}` : ''}`;
  return (
    <span className="callchip" role="status" aria-busy={status === 'running' || undefined} data-status={status} style={{ ['--expect' as string]: `${expectedMs}ms` }}>
      <span className="cc-fill" aria-hidden="true" />
      <span className="cc-slot" aria-hidden="true">
        <span className={cx('cc-g', gTool)}><Icon name={icon} /></span>
        <span className={cx('cc-g', gCheck)}><Icon name="check" /></span>
        <span className={cx('cc-g', gRetry)}><Icon name="refresh" /></span>
      </span>
      <span className="cc-name" aria-hidden="true">{name}</span>
      {args ? <span className="cc-arg" aria-hidden="true" title={args}>{args}</span> : null}
      {timer ? <span className="cc-t" aria-hidden="true">{status === 'idle' ? '—' : fmtMs(shown)}</span> : null}
      {status === 'error' && onRetry ? <button type="button" className="cc-retry" aria-label={`Retry ${name}`} onClick={onRetry} /> : null}
      <span className="visually-hidden">{spoken}</span>
    </span>
  );
}

/* ───────── Thought line ───────── */

/**
 * "Thinking…" with a shimmer and a running timer; settles to "Thought for 2.3 s" with the steps
 * (tool calls) folded under it as a branch list. Click the line to open or close the steps.
 */
export function ThoughtLine({ working, label = 'Thinking…', doneLabel = 'Thought for', elapsed, tools = [], steps = [], defaultOpen }: {
  working: boolean; label?: string; doneLabel?: string;
  /** Seconds spent, when the app knows; otherwise a clock runs while working. */
  elapsed?: number;
  tools?: ToolCall[];
  /** Plain text steps, shown when there are no tool calls. */
  steps?: string[];
  defaultOpen?: boolean;
}): ReactElement {
  const [t, setT] = useState(elapsed ?? 0);
  const [open, setOpen] = useState(defaultOpen ?? working);
  const hasTrace = tools.length > 0 || steps.length > 0;
  useEffect(() => { setOpen(working); }, [working]);
  useLayoutEffect(() => {
    if (elapsed != null) { setT(elapsed); return undefined; }
    if (!working) return undefined;
    const t0 = performance.now();
    setT(0);
    const id = setInterval(() => setT((performance.now() - t0) / 1000), 100);
    return () => { clearInterval(id); setT((performance.now() - t0) / 1000); };
  }, [working, elapsed]);
  const items = tools.length
    ? tools.map((tool, i) => ({ id: `${i}-${tool.name}`, node: <ToolCallChip name={tool.name} args={tool.args} status={toolStatus(tool)} expectedMs={tool.expectedMs} ms={tool.ms} icon={tool.icon} onRetry={tool.onRetry} /> }))
    : steps.map((s, i) => ({ id: `${i}`, label: s }));
  const current = tools.length ? items[Math.max(0, tools.findIndex((x) => toolStatus(x) === 'running' || toolStatus(x) === 'error'))]?.id ?? items[items.length - 1]?.id : working ? items[items.length - 1]?.id : undefined;
  const toggle = hasTrace;
  return (
    <div className="thought" data-working={working || undefined} data-open={open && hasTrace ? '' : undefined}>
      <button type="button" className="th-head" data-toggle={toggle || undefined} aria-expanded={toggle ? open : undefined} tabIndex={toggle ? 0 : -1} onClick={() => { if (toggle) setOpen((o) => !o); }}>
        <span className="th-g" aria-hidden="true"><Icon name="sparkle" /></span>
        <span className="th-l" aria-hidden="true">
          <span className={cx('th-x', working && 'on')}><span className="th-breath">{label}</span></span>
          <span className={cx('th-x', 'done', !working && 'on')}>{doneLabel}</span>
        </span>
        <span className="th-t" aria-hidden="true">{fmtElapsed(t)}</span>
        <span className={cx('th-c', hasTrace && 'on')} aria-hidden="true"><Icon name="caret" /></span>
        <span className="visually-hidden" role="status">{working ? label : `${doneLabel} ${fmtElapsed(t)}`}</span>
      </button>
      {hasTrace ? (
        <div className={cx('th-trace', open && 'open')} aria-hidden={!open}>
          <div className="th-fold"><div className="th-steps"><BranchList items={items} current={current} label="Steps" /></div></div>
        </div>
      ) : null}
    </div>
  );
}

/** Compatibility: the old "Used 2 tools" trace now renders a thought line. */
export function ToolTrace({ tools, done, elapsed }: { tools: ToolCall[]; done: boolean; elapsed?: number }): ReactElement | null {
  if (!tools.length && done) return null;
  return <ThoughtLine working={!done} tools={tools} elapsed={elapsed} doneLabel={tools.length ? `Used ${tools.length} tool${tools.length > 1 ? 's' : ''} in` : 'Thought for'} />;
}

/* ───────── Prompt bar ───────── */

export type PromptBarProps = {
  busy?: boolean;
  onSend: (text: string, picked: { context: string[]; command?: SlashCommand }) => void;
  onStop?: () => void;
  /** The "Looking at" chips: typing @ or pressing + lists them. */
  context?: ContextChip[];
  /** The app's slash commands: typing / lists them. */
  commands?: SlashCommand[];
  placeholder?: string;
  hint?: ReactNode;
  autoFocus?: boolean;
};

const ARROW = 'M12 4.5L18.5 11H14.25V19.5H9.75V11H5.5Z';
const SQUARE = 'M6 6H18V18H6Z';

/** Which menu a draft opens: `@` for context, `/` for commands, at the end of the text. */
export function parseToken(draft: string): { kind: 'at' | 'slash'; query: string; start: number } | null {
  const m = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!m) return null;
  return { kind: m[2] === '@' ? 'at' : 'slash', query: (m[3] ?? '').toLowerCase(), start: m.index + (m[1] ?? '').length };
}

export function PromptBar({ busy, onSend, onStop, context = [], commands = [], placeholder = 'Ask about what you’re looking at…', hint, autoFocus }: PromptBarProps): ReactElement {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [draft, setDraft] = useState('');
  const [plus, setPlus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [cmd, setCmd] = useState<SlashCommand | undefined>();
  const [glow, setGlow] = useState({ y: 0, h: 34 });

  const token = dismissed ? null : parseToken(draft);
  const open: 'at' | 'slash' | null = plus ? 'at' : token?.kind ?? null;
  const query = plus ? '' : token?.query ?? '';
  const list = useMemo(() => {
    if (open === 'at') return context.filter((c) => !c.fixed && c.label.toLowerCase().includes(query)).map((c) => ({ key: c.id, name: c.label, desc: picked.includes(c.id) ? 'Added' : 'Add to the question', icon: 'at' as IconName, chip: c }));
    if (open === 'slash') return commands.filter((c) => c.name.replace(/^\//, '').toLowerCase().startsWith(query)).map((c) => ({ key: c.name, name: c.name, desc: c.description, icon: 'slash' as IconName, cmd: c }));
    return [];
  }, [open, query, context, commands, picked]);
  const cursor = Math.min(active, Math.max(0, list.length - 1));
  const canSend = draft.trim().length > 0 || picked.length > 0 || !!cmd;
  const armed = busy || canSend;

  useLayoutEffect(() => {
    const row = rowRefs.current[cursor];
    if (row) setGlow({ y: row.offsetTop, h: row.offsetHeight });
  }, [open, cursor, list]);
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 22 * 5)}px`;
  }, [draft]);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  const focus = () => inputRef.current?.focus({ preventScroll: true });
  const pick = (row: (typeof list)[number]) => {
    const head = token ? draft.slice(0, token.start) : draft;
    if ('chip' in row && row.chip) { setPicked((p) => (p.includes(row.chip.id) ? p : [...p, row.chip.id])); setDraft(head); }
    else if ('cmd' in row && row.cmd) { setCmd(row.cmd); setDraft(head); }
    setPlus(false); setDismissed(false); focus();
  };
  const send = () => {
    if (!canSend || busy) return;
    onSend(draft.trim(), { context: picked, command: cmd });
    setDraft(''); setPicked([]); setCmd(undefined); setDismissed(false); setPlus(false); focus();
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && list.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setActive((cursor + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length); return; }
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') { e.preventDefault(); pick(list[cursor]!); return; }
    }
    if (e.key === 'Escape') { if (open) { e.preventDefault(); setDismissed(true); setPlus(false); } return; }
    if (e.key === 'Backspace' && !draft && (cmd || picked.length)) { e.preventDefault(); if (cmd) setCmd(undefined); else setPicked((p) => p.slice(0, -1)); return; }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
  };
  const pickedChips = picked.map((id) => context.find((c) => c.id === id)).filter(Boolean) as ContextChip[];

  return (
    <div className="pbar">
      {open ? (
        <div className="pbar-menu" role="listbox" aria-label={open === 'at' ? 'Add context' : 'Commands'}>
          <i className={cx('pbar-glow', list.length > 0 && 'on')} aria-hidden="true" style={{ ['--y' as string]: `${glow.y}px`, ['--h' as string]: `${glow.h}px` }} />
          {list.map((row, i) => (
            <button key={row.key} ref={(el) => { rowRefs.current[i] = el; }} type="button" role="option" aria-selected={i === cursor} className="pbar-opt" onMouseDown={(e) => e.preventDefault()} onPointerEnter={() => setActive(i)} onClick={() => pick(row)}>
              <Icon name={row.icon} />
              <span className={cx('pbar-name', open === 'slash' && 'mono')}>{row.name}</span>
              <span className="pbar-desc">{row.desc}</span>
            </button>
          ))}
          {list.length === 0 ? <div className="pbar-empty">{open === 'at' ? 'Nothing else to add.' : `No command matches “/${query}”.`}</div> : null}
        </div>
      ) : null}
      <div className={cx('pbar-field', busy && 'busy')} onClick={focus}>
        {pickedChips.length || cmd ? (
          <div className="pbar-chips">
            {cmd ? <span className="tok verb">{cmd.name}</span> : null}
            {pickedChips.map((c) => <span key={c.id} className="ctxchip">@{c.label}<button type="button" aria-label={`Remove ${c.label}`} onClick={() => setPicked((p) => p.filter((x) => x !== c.id))}>×</button></span>)}
          </div>
        ) : null}
        <textarea
          ref={inputRef}
          className="pbar-in"
          rows={1}
          value={draft}
          placeholder={placeholder}
          aria-label="Message NutBot"
          onChange={(e) => { setDraft(e.target.value); setDismissed(false); setPlus(false); setActive(0); }}
          onKeyDown={onKey}
        />
        <div className="pbar-row">
          <button type="button" className={cx('pbar-tool', plus && 'on')} aria-label="Add context" aria-expanded={plus} onMouseDown={(e) => e.preventDefault()} onClick={() => { setPlus((v) => !v); setActive(0); focus(); }}><Icon name="plus" /></button>
          {commands.length ? <button type="button" className="pbar-pick" aria-label="Commands" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft((d) => (d.endsWith('/') ? d : `${d}${d && !d.endsWith(' ') ? ' ' : ''}/`)); setDismissed(false); focus(); }}><Icon name="slash" /><span>Commands</span></button> : null}
          <span className="pbar-sp" />
          <button type="button" className={cx('pbar-send', busy && 'busy')} disabled={!armed} aria-label={busy ? 'Stop' : 'Send'} data-armed={armed || undefined} onMouseDown={(e) => e.preventDefault()} onClick={() => { if (busy) onStop?.(); else send(); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              {reduce ? <path d={busy ? SQUARE : ARROW} /> : (
                <motion.path initial={false} animate={{ d: busy ? SQUARE : ARROW }} transition={{ duration: 0.24, ease: [0.77, 0, 0.175, 1] }} />
              )}
            </svg>
          </button>
        </div>
      </div>
      {hint ? <div className="pbar-hint">{hint}</div> : null}
    </div>
  );
}

/* ───────── Blocks ───────── */

function Links({ links }: { links?: Array<{ label: string; onClick: () => void }> }): ReactElement | null {
  if (!links?.length) return null;
  return <div className="nb-bf">{links.map((l) => <Button key={l.label} size="sm" onClick={l.onClick}>{l.label}</Button>)}</div>;
}

const MARK_OF: Partial<Record<StatusKind, 'ok' | 'done' | 'bad' | 'wait' | 'todo'>> = { ok: 'ok', done: 'done', bad: 'bad', info: 'wait', warn: 'done', plain: 'todo' };

/** Renders one answer block with the app's own components; proposals confirm before anything changes. */
export function Block({ block }: { block: AnswerBlock }): ReactElement {
  const [decided, setDecided] = useState<'yes' | 'no' | null>(null);
  switch (block.type) {
    case 'table':
      return (
        <div className="nb-blk">
          <span className="eyebrow">{block.title}</span>
          <div className="t-wrap"><table className="t"><thead><tr>{block.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{block.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
          <Links links={block.links} />
        </div>
      );
    case 'checklist':
      return (
        <div className="nb-blk">
          <span className="eyebrow">{block.title}</span>
          {block.rows.map((r, i) => (
            <div className="nb-ck" key={i}>
              <StatusMark state={MARK_OF[r.kind] ?? 'todo'} />
              <span>{r.time ? <time>{r.time} </time> : null}<b>{r.title}</b><span className="s">{r.detail}</span></span>
              <Tag kind={r.kind}>{r.tag}</Tag>
            </div>
          ))}
          <Links links={block.links} />
        </div>
      );
    case 'chart':
      return <div className="nb-blk"><span className="eyebrow">{block.title}</span>{block.chart}<Links links={block.links} /></div>;
    case 'custom':
      return <div className="nb-blk"><span className="eyebrow">{block.title}</span>{block.node}</div>;
    case 'proposal':
      return (
        <div className="nb-prop">
          <b><Icon name="edit" />{block.title}</b>
          {block.preview}
          {decided === null ? (
            <div className="nb-pa">
              <Button size="sm" variant="primary" onClick={() => { setDecided('yes'); block.onConfirm(); }}>{block.confirmLabel}</Button>
              <Button size="sm" onClick={() => { setDecided('no'); block.onDecline?.(); }}>{block.declineLabel ?? 'Not now'}</Button>
            </div>
          ) : decided === 'yes' ? (
            <span className="dn"><Icon name="check" /> Done. Undo is in the toast.</span>
          ) : (
            <span className="dim" style={{ fontSize: 12.5 }}>Left as it was.</span>
          )}
        </div>
      );
  }
}

/* ───────── Panel ───────── */

export type NutBotPanelProps = {
  open: boolean;
  onClose: () => void;
  messages: NbMessage[];
  busy: boolean;
  onSend: (text: string, picked?: { context: string[]; command?: SlashCommand }) => void;
  onStop?: () => void;
  onNew: () => void;
  context: ContextChip[];
  onToggleContext: (id: string) => void;
  suggestions: string[];
  commands?: SlashCommand[];
  subtitle?: string;
  onPin?: (pin: Pin) => void;
  /** The assistant's icon (the style's NutBot pixel icon). */
  face?: ReactNode;
};

/**
 * The assistant panel every AVN tool shares. The app supplies messages (built from its own tools);
 * this renders context chips, the thought line with call chips, answer blocks, proposal cards and the prompt bar.
 */
export function NutBotPanel({ open, onClose, messages, busy, onSend, onStop, onNew, context, onToggleContext, suggestions, commands, subtitle = 'Answers with this app’s tools · asks before changing anything', onPin, face }: NutBotPanelProps): ReactElement {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight }); }, [messages, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="nb"
          aria-label="NutBot"
          style={{ animation: 'none' }}
          initial={reduce ? false : { x: '100%' }}
          animate={{ x: 0 }}
          exit={reduce ? { opacity: 0 } : { x: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        >
          <div className="nb-h">
            <span className={cx('nb-face', busy && 'think')}>{face}</span>
            <span className="sp1"><b>NutBot</b><small>{subtitle}</small></span>
            <button type="button" className="icon-btn" aria-label="New conversation" title="New conversation" onClick={onNew}><Icon name="edit" /></button>
            <button type="button" className="icon-btn" aria-label="Close NutBot" onClick={onClose}><Icon name="x" /></button>
          </div>
          <div className="nb-ctx">
            <span>Looking at</span>
            {context.map((c) => (
              <span key={c.id} className={cx('ctxchip', c.off && 'off')}>
                {c.label}
                {c.fixed ? null : <button type="button" aria-label={`${c.off ? 'Use' : 'Ignore'} ${c.label}`} title={c.off ? 'Use this again' : 'Leave this out'} onClick={() => onToggleContext(c.id)}>{c.off ? '+' : '×'}</button>}
              </span>
            ))}
          </div>
          <div className="nb-list" ref={listRef} aria-live="polite">
            {messages.length ? messages.map((m, i) => (m.role === 'user' ? (
              <div className="nb-u" key={i}>{m.text}</div>
            ) : (
              <div className="nb-b" key={i}>
                <ToolTrace tools={m.tools} done={m.done} elapsed={m.thought} />
                {m.done ? (
                  <>
                    {m.text ? <div>{m.text}</div> : null}
                    {m.blocks?.map((b, j) => <Block key={j} block={b} />)}
                    {m.scope || m.pin ? (
                      <div className="nb-mf">
                        {m.scope ? <span>{m.scope}</span> : null}
                        {m.pin && onPin ? <PinButton onPin={() => onPin(m.pin as Pin)} /> : null}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            ))) : (
              <div className="nb-hello">
                <h3>Ask about this page</h3>
                <p>I use the same tools you see here, read what you’re looking at, and show answers as tables, charts and timelines. I only change things after you confirm.</p>
                <div className="nb-sug">{suggestions.map((s) => <button key={s} type="button" className="preset" onClick={() => !busy && onSend(s)}>{s}</button>)}</div>
              </div>
            )}
          </div>
          <div className="nb-in">
            <PromptBar busy={busy} onSend={onSend} onStop={onStop} context={context.filter((c) => !c.off)} commands={commands} hint="Enter to send · Shift + Enter for a new line · @ adds context · / commands · Ctrl J opens or closes" />
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function PinButton({ onPin }: { onPin: () => void }): ReactElement {
  const [pinned, setPinned] = useState(false);
  return pinned ? <span className="dn" style={{ color: 'var(--ok)' }}>Pinned</span> : <Button size="sm" variant="ghost" onClick={() => { setPinned(true); onPin(); }}>Pin to Overview</Button>;
}
