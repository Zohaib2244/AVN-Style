import { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AccountMenu, AppShell, BarChart, BellButton, Brand, Button, PixelIcon, CommandPalette, Calendar, ConditionEditor, ConfirmDelete, Delta, Drawer, EmptyState, FilterBar,
  FunnelHeadline, FunnelResult, GameSwitcher, HeatStrip, HighlightsBar, Icon, IconButton, Insights, InsightCard, Kpi, Kpis, LoadBar, MultiSelect, NeedsALook,
  NotificationList, NutBotPanel, Page, PageHead, Panel, Pipeline, Popover, RuleBar, SearchButton, SectionLabel, SetupChecklist, ShortcutsDialog, Sidebar, SidebarNav,
  SingleSelect, Skeleton, SurvivalCurve, Tag, TabBar, Timeline, ToastProvider, TopBar, Workspace, useToast, emptyCondition, type CommandItem, type Highlight,
  type NavGroup, type NbMessage, type PlayerRule, type TimelineEvent,
} from '@avn/ui';

const GROUPS: NavGroup[] = [
  { label: 'Analyze', items: [{ id: 'overview', label: 'Overview', icon: 'grid' }, { id: 'funnels', label: 'Funnels', icon: 'funnel' }, { id: 'levels', label: 'Levels', icon: 'pad', count: 1 }, { id: 'players', label: 'Players', icon: 'users' }] },
  { label: 'Data', items: [{ id: 'exports', label: 'Exports', icon: 'down' }, { id: 'health', label: 'Data health', icon: 'pulse', live: true }] },
  { label: 'Manage', collapsible: true, defaultClosed: true, items: [{ id: 'keys', label: 'API keys', icon: 'key' }, { id: 'settings', label: 'Game settings', icon: 'sliders' }] },
];
const STARTS = [260, 232, 210, 193, 176, 160, 140, 121, 108, 96, 82, 65, 42, 39, 36, 33, 29, 19, 17, 15];
const DAU = [0, 0, 0, 1, 8, 14, 13, 8, 21, 20, 22, 14, 15, 12, 15, 37, 35, 26, 27, 16, 9, 13, 13, 24, 13];
const TL: TimelineEvent[] = [
  { session: 1, time: '19:05', name: 'level_start', params: { level: 1 } }, { session: 1, time: '19:06', name: 'level_complete', params: { level: 1 } },
  { session: 1, time: '19:06', name: 'ad_impression', params: { format: 'interstitial' } }, { session: 1, time: '19:07', name: 'level_fail', params: { level: 2 } },
  { session: 2, time: '08:19', name: 'purchase', params: { item: 'no_ads', price: 2.99 } },
];
const HL: Highlight[] = [
  { name: 'Levels', color: 'cyan', on: true, cond: { match: 'any', conditions: [{ field: 'event', param: '', op: 'contains', value: 'level' }] } },
  { name: 'Ads', color: 'gold', on: true, cond: { match: 'any', conditions: [{ field: 'event', param: '', op: 'contains', value: 'ad_' }] } },
];
const RULES: PlayerRule[] = [
  { verb: 'did', event: 'level_start', cond: { match: 'all', conditions: [{ field: 'param', param: 'level', op: 'eq', value: '12' }] }, times: 1 },
  { verb: 'didnt', event: 'level_start', cond: { match: 'all', conditions: [{ field: 'param', param: 'level', op: 'eq', value: '13' }] }, times: 1 },
];

function setStyle(name: 'avn-family' | 'nutstyle') {
  (document.getElementById('style-fonts') as HTMLLinkElement).href = `/${name}/fonts.css`;
  (document.getElementById('style-tokens') as HTMLLinkElement).href = `/${name}/tokens.css`;
  (document.getElementById('style-skin') as HTMLLinkElement).href = name === 'nutstyle' ? '/nutstyle/skin.css' : '/avn-family/flavour.css';
}

function Demo() {
  const { toast } = useToast();
  const [page, setPage] = useState('overview');
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(false);
  const [palette, setPalette] = useState(false);
  const [keys, setKeys] = useState(false);
  const [del, setDel] = useState(false);
  const [nb, setNb] = useState(false);
  const [filters, setFilters] = useState(false);
  const [bell, setBell] = useState(false);
  const [density, setDensity] = useState<'compact' | 'comfort'>('compact');
  const [msgs, setMsgs] = useState<NbMessage[]>([]);
  const [tree, setTree] = useState(RULES[0]!.cond);
  const [env, setEnv] = useState<Record<string, string[]>>({ 'App version': ['0.1.3'] });
  const [hideDev, setHideDev] = useState(true);
  const filterBtn = useRef<HTMLElement | null>(null);
  const bellBtn = useRef<HTMLButtonElement>(null);
  const items = useMemo<CommandItem[]>(() => [
    ...GROUPS.flatMap((g) => g.items.map((i) => ({ id: i.id, group: 'Pages', label: i.label, icon: i.icon, hint: g.label, run: () => setPage(i.id) }))),
    { id: 'export', group: 'Actions', label: 'Export data', icon: 'down' as const, hint: 'zip', run: () => toast({ kind: 'ok', title: 'Export ready', message: 'nut-sort.zip' }) },
  ], [toast]);

  const ask = (text: string) => {
    setNb(true);
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'bot', done: false, tools: [{ name: 'get_level_progress', args: 'levels 1–20', done: false }] }]);
    setTimeout(() => setMsgs((m) => m.map((x, i) => (i === m.length - 1 && x.role === 'bot' ? {
      ...x, done: true, tools: x.tools.map((t) => ({ ...t, done: true })), text: <p>Players stop most at <b>level 12</b> (35.4% never start the next).</p>, scope: 'Same filters as the page · last 30 days',
      blocks: [{ type: 'proposal', title: 'Save this funnel?', confirmLabel: 'Save funnel', onConfirm: () => toast({ kind: 'ok', title: 'Funnel saved', action: { label: 'Undo' } }) }],
      pin: { title: 'Biggest drop', value: 'Level 12', sub: '35% stop there' },
    } : x))), 700);
  };

  const sidebar = (
    <Sidebar>
      <Brand name="AVN Analytics" mark={<PixelIcon name="analytics" size={28} status="live" />} onClick={() => setPage('overview')} />
      <GameSwitcher icon="NS" name="Nut Sort Puzzle" packageName="com.avn.nutsort" />
      <SidebarNav groups={GROUPS} active={page} onSelect={setPage} />
      <AccountMenu name="Work" role="Local admin" initial="Z" items={[{ id: 'team', label: 'Team', icon: 'team' }, { id: 'settings', label: 'Settings', icon: 'sliders' }]} onSelect={(id) => toast({ kind: 'info', title: `Opened ${id}` })} />
    </Sidebar>
  );

  return (
    <AppShell sidebar={sidebar} density={density} tabbar={<TabBar items={GROUPS[0]!.items} active={page} onSelect={setPage} moreItems />}>
      <Workspace>
        <TopBar
          crumbs={[{ label: 'Games', onClick: () => setPage('overview') }, { label: 'Nut Sort Puzzle' }, { label: page }]}
          tools={<>
            <SearchButton onClick={() => setPalette(true)} />
            <IconButton icon="refresh" label="Refresh" />
            <BellButton ref={bellBtn} onClick={() => setBell((b) => !b)} />
            <Button size="sm" icon="bot" onClick={() => setNb((o) => !o)}>NutBot</Button>
          </>}
        />
        <Page pageKey={page}>
          <PageHead title={page === 'overview' ? 'Nut Sort Puzzle' : page[0]!.toUpperCase() + page.slice(1)} description="Android · com.avn.nutsort · v1.4.2" actions={<Button variant="primary" icon="down" onClick={() => toast({ kind: 'ok', title: 'Export ready', message: 'nut-sort.zip', action: { label: 'Download' } })}>Export data</Button>} />
          <FilterBar range="Last 30 days" dates="Sep 23, 2026 to Oct 22, 2026" onRange={() => {}} onDates={() => {}} tz="local" onTz={() => {}} filterCount={1} onFilters={(el) => { filterBtn.current = el; setFilters((f) => !f); }}
            chips={[{ key: 'v', label: 'App version: 0.1.3', onRemove: () => setEnv({}) }]} note="Editor and development data hidden" density={density} onDensity={setDensity} />
          <RuleBar rules={RULES} match="all" onToggleMatch={() => {}} onEdit={() => setEdit(true)} onRemove={() => {}} onAdd={() => setEdit(true)} onClear={() => {}} matchCount={65} total={260} />
          <SetupChecklist title="Set up Nut Sort Puzzle" steps={[
            { id: '1', title: 'Unity SDK added', detail: 'Events arriving from build 142', state: 'ok' },
            { id: '2', title: 'Event dictionary filled', detail: 'Imported 24 descriptions', state: 'done', action: <Button size="sm">Check now</Button> },
            { id: '3', title: 'First funnel saved', detail: 'Funnels show where players stop', state: 'todo' },
          ]} />
          <SectionLabel>What changed · last 7 days vs the 7 before</SectionLabel>
          <Insights>
            <InsightCard kind="worse" headline="Level 12 drop rose +10.1 pp" detail="In release 0.1.3 compared with 0.1.2" action="Compare releases" onClick={() => setDrawer(true)} />
            <InsightCard kind="better" headline="Tutorial finish rate up 4 pp" detail="89% now finish the tutorial" action="Open funnel" onClick={() => {}} />
          </Insights>
          <Kpis>
            <Kpi label="Players" value={260} context={<><span className="d up">+18%</span> vs previous 30 days</>} spark={[180, 196, 205, 214, 230, 241, 260]} />
            <Kpi label="Sessions" value={591} context="2.3 per player" spark={[500, 520, 540, 560, 591]} />
            <Kpi label="Daily active" value={13} context={<><Delta value={-35} unit="%" lessIsGood={false} goodWord="up" badWord="down" /></>} />
            <Kpi label="Stickiness" value={5.9} decimals={1} unit="%" context="avg DAU ÷ MAU" />
          </Kpis>
          <div className="split">
            <Panel title="Activity per day" subtitle="Players with at least one event"><BarChart data={DAU} labels={DAU.map((_, i) => String(i + 1))} label="Daily active players" /></Panel>
            <NeedsALook items={[{ kind: 'Drop', title: 'Level 12 loses 35%', detail: '65 started · 42 started level 13', action: 'Open', onAction: () => setDrawer(true) }]} />
          </div>
          <Panel title="Players remaining by level" subtitle="Steep steps are where players stop"><div className="pb"><SurvivalCurve starts={STARTS} label="Players remaining by level" onSelect={() => setDrawer(true)} /><HeatStrip starts={STARTS} onSelect={() => setDrawer(true)} /></div></Panel>
          <Panel title="Funnel"><FunnelHeadline percent={61.9} sentence="of players who opened the game finished level 5" started={260} finished={161} median="8m 05s" />
            <FunnelResult steps={[{ label: <span className="tok">first_open</span>, count: 260, median: '12s' }, { label: <span className="tok">tutorial_complete</span>, count: 221 }, { label: <span className="tok">level_complete</span>, count: 209 }, { label: <span className="tok">level 5</span>, count: 161 }]} onSeeWho={() => {}} /></Panel>
          <Panel title="Highlights" subtitle="Timeline of one player"><div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <HighlightsBar highlights={HL} events={TL} mode="highlight" onMode={() => {}} onToggle={() => {}} onEdit={() => {}} onAdd={() => {}} current={1} onJump={() => {}} />
            <Timeline events={TL} highlights={HL} mode="highlight" current={1} />
          </div></Panel>
          <Panel title="Pipeline"><div className="pb"><Pipeline steps={[{ label: 'SDK found', detail: '0.4 s', state: 'ok' }, { label: 'Ingest', detail: '1.1 s', state: 'ok' }, { label: 'Stored', detail: 'to confirm', state: 'done' }, { label: 'Dictionary', detail: 'waiting', state: 'wait' }]} onVerify={() => toast({ kind: 'ok', title: 'Storage verified' })} /></div></Panel>
          <Panel title="Loading, empty, errors"><div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <LoadBar text="Reading your events. The first load takes a few seconds." />
            <Skeleton width="60%" />
            <EmptyState title="No players match" action={<Button>Clear rules</Button>}>Loosen a rule or switch AND to OR.</EmptyState>
            <div className="row-wrap"><Tag kind="ok">Verified</Tag><Tag kind="done">Done</Tag><Tag kind="info">Syncing</Tag><Tag kind="new">Beta</Tag><Tag kind="warn">Warning</Tag><Tag kind="bad">Failed</Tag><Tag kind="accent">Current</Tag><Tag kind="plain">Inactive</Tag></div>
            <div className="row-wrap"><Button onClick={() => toast({ kind: 'bad', title: 'Export failed', message: 'The server stopped responding.', action: { label: 'Retry' } })}>Error toast</Button><Button onClick={() => setDel(true)} variant="danger-o">Delete…</Button><Button onClick={() => setKeys(true)}>Shortcuts</Button></div>
          </div></Panel>
        </Page>
      </Workspace>

      <Popover open={filters} onClose={() => setFilters(false)} anchor={filterBtn as React.RefObject<HTMLElement>} width={290}>
        <MultiSelect groups={[{ label: 'Environment', options: [{ value: 'production', label: 'production', count: 1468 }, { value: 'editor', label: 'editor', count: 1 }] }, { label: 'App version', options: [{ value: '0.1.3', label: '0.1.3', count: 81 }, { value: '0.1.2', label: '0.1.2', count: 87 }] }]}
          value={env} onChange={(g, v) => setEnv((e) => ({ ...e, [g]: v }))} pinned={{ label: 'Hide editor & development data', checked: hideDev, onChange: setHideDev }} onClear={() => setEnv({})} onDone={() => setFilters(false)} />
      </Popover>
      <Popover open={bell} onClose={() => setBell(false)} anchor={bellBtn as React.RefObject<HTMLElement>} width={330}><NotificationList onClose={() => setBell(false)} /></Popover>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Level 12" subtitle="Nut Sort Puzzle · 0.1.3" footer={<><Button>Compare releases</Button><Button variant="primary">Show these players</Button></>}>
        <div className="mini"><div><span>Started</span><b>65</b></div><div><span>Finished</span><b>83%</b></div></div>
        <Delta value={10.1} />
      </Drawer>
      <Drawer open={edit} onClose={() => setEdit(false)} title="Edit rule" subtitle="Filters the player list" footer={<><Button onClick={() => setEdit(false)}>Cancel</Button><Button variant="primary" onClick={() => setEdit(false)}>Apply rule</Button></>}>
        <ConditionEditor tree={tree} onChange={setTree} params={['level', 'format']} events={['level_start']} />
        <Button size="sm" onClick={() => setTree({ ...tree, conditions: [...tree.conditions, emptyCondition()] })}>Add (outside)</Button>
      </Drawer>
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={() => setDel(false)} name="Nut Sort Puzzle" title="Delete all data for Nut Sort Puzzle?" consequences={['3,235 events and every player story', '2 saved funnels', 'Both API keys']} />
      <ShortcutsDialog open={keys} onClose={() => setKeys(false)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} items={items} onAsk={ask} />
      <NutBotPanel open={nb} onClose={() => setNb(false)} messages={msgs} busy={msgs.some((m) => m.role === 'bot' && !m.done)} onSend={ask} onNew={() => setMsgs([])}
        context={[{ id: 'game', label: 'Nut Sort Puzzle', fixed: true }, { id: 'page', label: page }, { id: 'range', label: 'Last 30 days' }]} onToggleContext={() => {}} suggestions={['Where do players drop off most?']} face={<Icon name="bot" />} />
    </AppShell>
  );
}

function Root() {
  const [style, setS] = useState<'avn-family' | 'nutstyle'>('avn-family');
  return (
    <ToastProvider>
      <div style={{ display: 'flex', gap: 8, padding: 12 }} id="demo-controls">
        <Button size="sm" onClick={() => { setS('avn-family'); setStyle('avn-family'); }} aria-pressed={style === 'avn-family'}>AVN Family</Button>
        <Button size="sm" onClick={() => { setS('nutstyle'); setStyle('nutstyle'); }} aria-pressed={style === 'nutstyle'}>Nutstyle</Button>
        <Button size="sm" onClick={() => document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light')}>Toggle theme</Button>
      </div>
      <div style={{ padding: '0 12px 24px' }}><Demo /></div>
    </ToastProvider>
  );
}

// Calendar is exported for apps; referenced here so the demo build covers it.
void Calendar; void SingleSelect;

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>);
