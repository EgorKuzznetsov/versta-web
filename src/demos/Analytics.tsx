import React, { useMemo, useRef, useState } from 'react';
import { useT, Bi } from '../core/i18n';
import { Icon } from '../components/Icon';
import { DemoNote } from '../components/Chrome';
import { LineChart, GroupBars } from './charts';
import { money, num, iso, dateFmt, rng, cx } from '../core/format';
import { useStored, useTween } from '../core/hooks';

/* ---------- demo data (deterministic, relative to today) ---------- */
const SERVICES: (Bi & { p: number; season?: number[] })[] = [
  { uk: 'Заміна мастила', en: 'Oil change', p: 1400 },
  { uk: 'Шиномонтаж', en: 'Tyre fitting', p: 900, season: [3, 10] },
  { uk: 'Комп’ютерна діагностика', en: 'Diagnostics', p: 700 },
  { uk: 'Розвал-сходження', en: 'Wheel alignment', p: 1100 },
  { uk: 'Ремонт гальм', en: 'Brake repair', p: 3200 },
  { uk: 'Заправка кондиціонера', en: 'A/C recharge', p: 1600, season: [5, 6, 7] },
  { uk: 'Ремонт ходової', en: 'Suspension repair', p: 4800 },
];
const FIRST: Bi<string[]> = {
  uk: ['Олена', 'Андрій', 'Ірина', 'Максим', 'Тетяна', 'Богдан', 'Наталія', 'Олег', 'Світлана', 'Дмитро', 'Юлія', 'Роман', 'Оксана', 'Віктор', 'Марія', 'Сергій'],
  en: ['Olena', 'Andrii', 'Iryna', 'Maksym', 'Tetiana', 'Bohdan', 'Nataliia', 'Oleh', 'Svitlana', 'Dmytro', 'Yuliia', 'Roman', 'Oksana', 'Viktor', 'Mariia', 'Serhii'],
};
const LAST = 'КБМШТЛГПСД'.split('');
const LAST_EN = 'KBMSTLHPSD'.split('');
const FIXED_PER_DAY = 5200;

interface Order { id: number; d: string; c: number; s: number; amt: number; cost: number }

function genOrders(): Order[] {
  const r = rng(20261);
  const out: Order[] = [];
  const today = new Date(); today.setHours(12, 0, 0, 0);
  let id = 18000;
  for (let back = 760; back >= 0; back--) {
    const d = new Date(today); d.setDate(d.getDate() - back);
    const wd = d.getDay();
    const trend = 1 + (760 - back) / 1600;
    const base = (wd === 0 ? 3 : wd === 6 ? 9 : 12) * trend;
    const cnt = Math.max(0, Math.round(base + (r() - 0.5) * 6));
    const m = d.getMonth();
    for (let k = 0; k < cnt; k++) {
      let s = Math.floor(r() * SERVICES.length);
      // seasonality: tyres in Apr/Nov, A/C in summer
      if (r() < 0.25) { const seas = SERVICES.findIndex((x) => x.season?.includes(m)); if (seas >= 0) s = seas; }
      const amt = Math.round((SERVICES[s].p * (0.8 + r() * 0.6)) / 10) * 10;
      out.push({ id: id++, d: iso(d), c: Math.floor(Math.pow(r(), 1.6) * 900), s, amt, cost: Math.round(amt * (0.36 + r() * 0.14)) });
    }
  }
  return out;
}

type Preset = '7' | '30' | '90' | '365' | 'custom';
const addDays = (s: string, n: number) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a: string, b: string) => Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 864e5);

export default function Analytics() {
  const { lang, L } = useT();
  const orders = useMemo(genOrders, []);
  const today = iso(new Date());
  const [preset, setPreset] = useStored<Preset>('demo.analytics.preset', '30');
  const [range, setRange] = useStored('demo.analytics.range', { from: addDays(today, -29), to: today });
  const [compare, setCompare] = useStored('demo.analytics.compare', true);
  const [q, setQ] = useState('');
  const top = useRef<HTMLDivElement>(null);
  const secs = { charts: useRef<HTMLDivElement>(null), services: useRef<HTMLDivElement>(null), orders: useRef<HTMLDivElement>(null) };

  const from = preset === 'custom' ? range.from : addDays(today, -(+preset - 1));
  const to = preset === 'custom' ? range.to : today;
  const len = Math.max(1, diffDays(from, to) + 1);
  const pFrom = addDays(from, -len), pTo = addDays(from, -1);

  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const name = (c: number) => lang === 'uk' ? `${FIRST.uk[c % 16]} ${LAST[(c >> 4) % 10]}.` : `${FIRST.en[c % 16]} ${LAST_EN[(c >> 4) % 10]}.`;

  const data = useMemo(() => {
    const inR = (o: Order, a: string, b: string) => o.d >= a && o.d <= b;
    const cur = orders.filter((o) => inR(o, from, to));
    const prev = orders.filter((o) => inR(o, pFrom, pTo));
    const kpi = (list: Order[], days: number) => {
      const rev = list.reduce((s, o) => s + o.amt, 0);
      const exp = list.reduce((s, o) => s + o.cost, 0) + FIXED_PER_DAY * days;
      return { rev, exp, profit: rev - exp, clients: new Set(list.map((o) => o.c)).size, avg: list.length ? rev / list.length : 0, n: list.length };
    };
    // buckets
    const mode = len <= 31 ? 'd' : len <= 120 ? 'w' : 'm';
    const bucketOf = (dStr: string, start: string) => {
      if (mode === 'd') return diffDays(start, dStr);
      if (mode === 'w') return Math.floor(diffDays(start, dStr) / 7);
      const a = new Date(start + 'T12:00:00'), b = new Date(dStr + 'T12:00:00');
      return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
    };
    const nB = bucketOf(to, from) + 1;
    const mk = () => Array.from({ length: nB }, () => 0);
    const rev = mk(), prevRev = mk(), exp = mk(), prof = mk(), bucketDays = mk();
    for (let i = 0; i < len; i++) bucketDays[bucketOf(addDays(from, i), from)]++;
    cur.forEach((o) => { const b = bucketOf(o.d, from); rev[b] += o.amt; exp[b] += o.cost; });
    exp.forEach((_, i) => { exp[i] += FIXED_PER_DAY * bucketDays[i]; prof[i] = rev[i] - exp[i]; });
    prev.forEach((o) => { const b = bucketOf(o.d, pFrom); if (b < nB) prevRev[b] += o.amt; });
    const labels = Array.from({ length: nB }, (_, i) => {
      if (mode === 'd') return dateFmt(addDays(from, i), lang, { day: 'numeric', month: 'short' });
      if (mode === 'w') return dateFmt(addDays(from, i * 7), lang, { day: 'numeric', month: 'short' });
      const d = new Date(from + 'T12:00:00'); d.setMonth(d.getMonth() + i);
      return dateFmt(d, lang, { month: 'short', year: '2-digit' });
    });
    const svc = SERVICES.map((s, i) => {
      const l = cur.filter((o) => o.s === i);
      return { i, n: l.length, rev: l.reduce((a, o) => a + o.amt, 0) };
    }).sort((a, b) => b.rev - a.rev);
    return { cur, k: kpi(cur, len), pk: kpi(prev, len), labels, rev, prevRev, exp, prof, svc, mode };
  }, [orders, from, to, pFrom, pTo, len, lang]);

  const recent = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return data.cur.slice().reverse().filter((o) => !qq || name(o.c).toLowerCase().includes(qq) || L(SERVICES[o.s]).toLowerCase().includes(qq) || String(o.id).includes(qq)).slice(0, 12);
  }, [data.cur, q, lang]);

  const M = (v: number) => money(v, lang, { decimals: false });
  // chart values are converted to the display currency first, so axis ticks are "nice" in that currency
  const k = lang === 'uk' ? 1 : 1 / 45;
  const cv = (a: number[]) => a.map((v) => v * k);
  const Md = (v: number) => (lang === 'uk' ? num(Math.round(v), 'uk') + '\u00a0грн' : '€' + num(Math.round(v), 'en'));
  const Ms = (v: number) => {
    const a = v;
    const s = Math.abs(a) >= 1e6 ? num(a / 1e6, lang, 1) + (lang === 'uk' ? ' млн' : 'M') : Math.abs(a) >= 1e3 ? num(a / 1e3, lang, 0) + (lang === 'uk' ? ' тис' : 'k') : num(a, lang);
    return lang === 'uk' ? s : '€' + s;
  };

  const exportCsv = () => {
    const head = ['order_id', 'date', 'client', 'service', 'amount_' + (lang === 'uk' ? 'uah' : 'eur'), 'cost_' + (lang === 'uk' ? 'uah' : 'eur')];
    const conv = (v: number) => (lang === 'uk' ? v : +(v / 45).toFixed(2));
    const rows = data.cur.map((o) => [o.id, o.d, name(o.c), L(SERVICES[o.s]), conv(o.amt), conv(o.cost)]);
    const csv = '﻿# DEMO DATA — ' + T('демонстраційні дані', 'demonstration data') + '\n' + [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `ledger-demo_${from}_${to}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const go = (r: React.RefObject<HTMLDivElement | null>) => r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const presets: [Preset, string][] = [['7', T('7 днів', '7 days')], ['30', T('30 днів', '30 days')], ['90', T('Квартал', 'Quarter')], ['365', T('Рік', 'Year')], ['custom', T('Свій період', 'Custom')]];
  const maxSvc = data.svc[0]?.rev || 1;
  const totalSvc = data.svc.reduce((a, s) => a + s.rev, 0) || 1;

  return (
    <div className="an">
      <aside className="an-side">
        <div className="an-logo"><span>L</span>Ledger</div>
        <nav>
          <button type="button" className="on" onClick={() => top.current?.scrollIntoView({ behavior: 'smooth' })}><Icon n="layers" s={18} /><span>{T('Огляд', 'Overview')}</span></button>
          <button type="button" onClick={() => go(secs.charts)}><Icon n="chart" s={18} /><span>{T('Графіки', 'Charts')}</span></button>
          <button type="button" onClick={() => go(secs.services)}><Icon n="tag" s={18} /><span>{T('Послуги', 'Services')}</span></button>
          <button type="button" onClick={() => go(secs.orders)}><Icon n="calendar" s={18} /><span>{T('Замовлення', 'Orders')}</span></button>
        </nav>
        <div className="an-org"><span className="an-av">{T('П', 'P')}</span><div><b>{T('СТО «Півоберта»', '“Pivoberta” car service')}</b><small>{T('3 бокси · демо', '3 bays · demo')}</small></div></div>
      </aside>

      <div className="an-main" ref={top}>
        <div className="an-head">
          <div>
            <h1>{T('Огляд бізнесу', 'Business overview')}</h1>
            <p>{dateFmt(from, lang, { day: 'numeric', month: 'long', year: 'numeric' })} — {dateFmt(to, lang, { day: 'numeric', month: 'long', year: 'numeric' })} · {len} {T('дн.', 'days')}</p>
          </div>
          <button type="button" className="an-btn an-btn-a" onClick={exportCsv}><Icon n="download" s={16} /> {T('Експорт CSV', 'Export CSV')}</button>
        </div>

        <div className="an-filters">
          <div className="an-seg" role="radiogroup" aria-label={T('Період', 'Period')}>
            {presets.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={preset === k} className={cx(preset === k && 'on')} onClick={() => { setPreset(k); if (k === 'custom') setRange({ from, to }); }}>{l}</button>)}
          </div>
          {preset === 'custom' && (
            <div className="an-dates">
              <label><span>{T('з', 'from')}</span><input type="date" value={range.from} max={range.to} min={addDays(today, -700)} onChange={(e) => e.target.value && setRange({ ...range, from: e.target.value })} /></label>
              <label><span>{T('по', 'to')}</span><input type="date" value={range.to} min={range.from} max={today} onChange={(e) => e.target.value && setRange({ ...range, to: e.target.value })} /></label>
            </div>
          )}
          <label className="an-cmp"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} /><span className="an-sw" />{T('Порівняти з попереднім періодом', 'Compare with previous period')}</label>
        </div>

        <div className="an-kpis">
          <Kpi label={T('Виручка', 'Revenue')} v={data.k.rev} p={data.pk.rev} fmt={M} cmp={compare} accent />
          <Kpi label={T('Клієнти', 'Clients')} v={data.k.clients} p={data.pk.clients} fmt={(v) => num(v, lang)} cmp={compare} />
          <Kpi label={T('Середній чек', 'Average order')} v={data.k.avg} p={data.pk.avg} fmt={M} cmp={compare} />
          <Kpi label={T('Витрати', 'Costs')} v={data.k.exp} p={data.pk.exp} fmt={M} cmp={compare} invert />
          <Kpi label={T('Прибуток', 'Profit')} v={data.k.profit} p={data.pk.profit} fmt={M} cmp={compare} sub={data.k.rev ? `${T('маржа', 'margin')} ${num((data.k.profit / data.k.rev) * 100, lang, 1)}%` : ''} />
        </div>

        <div className="an-grid" ref={secs.charts}>
          <section className="an-card an-wide">
            <header><h2>{T('Виручка', 'Revenue')}</h2>
              <div className="an-legend"><span><i className="l-a" />{T('Поточний період', 'Current period')}</span>{compare && <span><i className="l-p" />{T('Попередній', 'Previous')}</span>}</div>
            </header>
            <LineChart labels={data.labels} cur={cv(data.rev)} prev={compare ? cv(data.prevRev) : undefined} fmt={Md} fmtAxis={Ms}
              colors={{ line: '#7FE0B0', prev: '#6C7D74', grid: '#232B27', text: '#7D8A83', area: '#7FE0B0' }}
              names={[T('Виручка', 'Revenue'), T('Попередній', 'Previous')]} />
          </section>
          <section className="an-card an-wide">
            <header><h2>{T('Витрати та прибуток', 'Costs and profit')}</h2>
              <div className="an-legend"><span><i style={{ background: '#E9A86B' }} />{T('Витрати', 'Costs')}</span><span><i style={{ background: '#7FE0B0' }} />{T('Прибуток', 'Profit')}</span></div>
            </header>
            <GroupBars labels={data.labels} a={cv(data.exp)} b={cv(data.prof)} fmt={Md} fmtAxis={Ms}
              colors={{ a: '#E9A86B', b: '#7FE0B0', grid: '#232B27', text: '#7D8A83' }} names={[T('Витрати', 'Costs'), T('Прибуток', 'Profit')]} />
          </section>
          <section className="an-card" ref={secs.services}>
            <header><h2>{T('Популярні послуги', 'Top services')}</h2><span className="an-mut">{T('за виручкою', 'by revenue')}</span></header>
            <ol className="an-svc">
              {data.svc.map((s, i) => (
                <li key={s.i}>
                  <div className="an-svc-r"><span><b>{String(i + 1).padStart(2, '0')}</b>{L(SERVICES[s.i])}</span><span className="an-num">{M(s.rev)}</span></div>
                  <div className="an-bar"><i style={{ width: (s.rev / maxSvc) * 100 + '%', ['--i' as any]: i }} /></div>
                  <div className="an-svc-m"><span>{s.n} {T('замовл.', 'orders')}</span><span>{num((s.rev / totalSvc) * 100, lang, 1)}%</span></div>
                </li>
              ))}
            </ol>
          </section>
          <section className="an-card an-orders" ref={secs.orders}>
            <header><h2>{T('Останні замовлення', 'Latest orders')}</h2>
              <label className="an-search"><Icon n="search" s={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Клієнт, послуга, №', 'Client, service, #')} /></label>
            </header>
            <div className="an-table" role="table">
              <div className="an-tr an-th" role="row"><span>№</span><span>{T('Дата', 'Date')}</span><span>{T('Клієнт', 'Client')}</span><span>{T('Послуга', 'Service')}</span><span className="r">{T('Сума', 'Amount')}</span></div>
              {recent.map((o) => (
                <div className="an-tr" role="row" key={o.id}>
                  <span className="an-num an-mut">#{o.id}</span>
                  <span className="an-mut">{dateFmt(o.d, lang)}</span>
                  <span>{name(o.c)}</span>
                  <span className="an-mut">{L(SERVICES[o.s])}</span>
                  <span className="an-num r">{M(o.amt)}</span>
                </div>
              ))}
              {!recent.length && <p className="an-empty">{T('Нічого не знайдено', 'Nothing found')}</p>}
            </div>
          </section>
        </div>
        <DemoNote className="an-note" />
      </div>
    </div>
  );
}

function Kpi({ label, v, p, fmt, cmp, accent, invert, sub }: { label: string; v: number; p: number; fmt: (v: number) => string; cmp: boolean; accent?: boolean; invert?: boolean; sub?: string }) {
  const tv = useTween(v);
  const d = p ? ((v - p) / Math.abs(p)) * 100 : 0;
  const good = invert ? d <= 0 : d >= 0;
  return (
    <div className={cx('an-kpi', accent && 'acc')}>
      <span className="an-mut">{label}</span>
      <b className="an-num">{fmt(tv)}</b>
      <div className="an-kpi-f">
        {cmp && p !== 0 && <span className={cx('an-delta', good ? 'up' : 'down')}>{d >= 0 ? '▲' : '▼'} {Math.abs(d).toFixed(1)}%</span>}
        {sub && <span className="an-mut">{sub}</span>}
      </div>
    </div>
  );
}
