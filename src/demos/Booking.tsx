import React, { useMemo, useState } from 'react';
import { useT, Bi } from '../core/i18n';
import { Icon } from '../components/Icon';
import { DemoNote } from '../components/Chrome';
import { money, iso, dateFmt, rng, cx } from '../core/format';
import { useStored, useDialog } from '../core/hooks';

/* ---------- data ---------- */
const SVC: (Bi & { id: string; min: number; p: number; d: Bi })[] = [
  { id: 'cut', uk: 'Чоловіча стрижка', en: 'Men’s haircut', min: 45, p: 600, d: { uk: 'Консультація, миття, стрижка, укладка', en: 'Consultation, wash, cut, styling' } },
  { id: 'combo', uk: 'Стрижка + борода', en: 'Haircut + beard', min: 75, p: 950, d: { uk: 'Повний догляд за одне відвідування', en: 'The full routine in one visit' } },
  { id: 'beard', uk: 'Моделювання бороди', en: 'Beard shaping', min: 30, p: 400, d: { uk: 'Форма, контур, гарячий рушник', en: 'Shape, line-up, hot towel' } },
  { id: 'shave', uk: 'Королівське гоління', en: 'Royal shave', min: 45, p: 700, d: { uk: 'Небезпечна бритва, компреси, догляд', en: 'Straight razor, compresses, care' } },
  { id: 'kid', uk: 'Дитяча стрижка', en: 'Kids’ haircut', min: 30, p: 450, d: { uk: 'Для хлопців до 12 років', en: 'For boys up to 12' } },
  { id: 'grey', uk: 'Камуфляж сивини', en: 'Grey blending', min: 30, p: 550, d: { uk: 'Природний відтінок без ефекту фарби', en: 'Natural tone, no dyed look' } },
];
const PROS: { id: string; name: Bi; role: Bi; k: number; svc: string[]; hue: string }[] = [
  { id: 'andrii', name: { uk: 'Андрій', en: 'Andrii' }, role: { uk: 'Топ-барбер · 9 років', en: 'Top barber · 9 yrs' }, k: 1.25, svc: ['cut', 'combo', 'beard', 'shave', 'grey'], hue: '#2F5D46' },
  { id: 'taras', name: { uk: 'Тарас', en: 'Taras' }, role: { uk: 'Барбер · 5 років', en: 'Barber · 5 yrs' }, k: 1, svc: ['cut', 'combo', 'beard', 'kid', 'grey'], hue: '#8A5A2B' },
  { id: 'marko', name: { uk: 'Марко', en: 'Marko' }, role: { uk: 'Барбер · 4 роки', en: 'Barber · 4 yrs' }, k: 1, svc: ['cut', 'combo', 'beard', 'shave', 'kid'], hue: '#5B4A7A' },
  { id: 'illia', name: { uk: 'Ілля', en: 'Illia' }, role: { uk: 'Молодший барбер', en: 'Junior barber' }, k: 0.85, svc: ['cut', 'beard', 'kid'], hue: '#3F6E8C' },
];
const OPEN = 10 * 60, CLOSE = 20 * 60, STEP = 30;
const CLIENTS = { uk: ['Олег', 'Влад', 'Денис', 'Артем', 'Ігор', 'Павло', 'Микола', 'Остап', 'Євген', 'Назар'], en: ['Oleh', 'Vlad', 'Denys', 'Artem', 'Ihor', 'Pavlo', 'Mykola', 'Ostap', 'Yevhen', 'Nazar'] };

interface Bk { id: string; svc: string; pro: string; date: string; start: number; name: string; phone: string; note: string; status: 'active' | 'cancelled'; seeded?: boolean; client?: number }

const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const svcOf = (id: string) => SVC.find((s) => s.id === id)!;
const proOf = (id: string) => PROS.find((p) => p.id === id)!;
const priceOf = (s: string, p: string) => Math.round((svcOf(s).p * proOf(p).k) / 10) * 10;
const isClosed = (d: Date) => d.getDay() === 1; // Mondays off

/** deterministic "already booked" appointments to make the calendar realistic */
function seeded(date: string, pro: string): Bk[] {
  const r = rng([...(date + pro)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const out: Bk[] = [];
  let t = OPEN + Math.floor(r() * 3) * STEP;
  while (t < CLOSE - 30) {
    if (r() < 0.5) {
      const s = proOf(pro).svc[Math.floor(r() * proOf(pro).svc.length)];
      const dur = svcOf(s).min;
      if (t + dur > CLOSE) break;
      out.push({ id: `s-${date}-${pro}-${t}`, svc: s, pro, date, start: t, name: '', phone: '', note: '', status: 'active', seeded: true, client: Math.floor(r() * 10) });
      t += Math.ceil(dur / STEP) * STEP;
    } else t += STEP * (1 + Math.floor(r() * 2));
  }
  return out;
}

export default function Booking() {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [tab, setTab] = useState<'book' | 'mine' | 'admin'>('book');
  const [mine, setMine] = useStored<Bk[]>('demo.booking.list', []);
  const [step, setStep] = useState(0);
  const [svc, setSvc] = useState<string | null>(null);
  const [pro, setPro] = useState<string | null>(null); // 'any' allowed
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ start: number; pro: string } | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', note: '', remind: true });
  const [err, setErr] = useState(false);
  const [done, setDone] = useState<Bk | null>(null);
  const [resched, setResched] = useState<string | null>(null);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d; }), []);
  const all = (d: string, p: string) => [...seeded(d, p), ...mine.filter((b) => b.date === d && b.pro === p && b.status === 'active' && b.id !== resched)];

  const slotsFor = (d: string) => {
    if (!svc) return [];
    const dur = svcOf(svc).min;
    const pros = pro && pro !== 'any' ? [pro] : PROS.filter((p) => p.svc.includes(svc)).map((p) => p.id);
    const now = new Date(); const isToday = d === iso(now); const nowMin = now.getHours() * 60 + now.getMinutes();
    const out: { start: number; pro: string | null }[] = [];
    for (let t = OPEN; t + dur <= CLOSE; t += STEP) {
      if (isToday && t <= nowMin + 30) { out.push({ start: t, pro: null }); continue; }
      const free = pros.find((p) => all(d, p).every((b) => t + dur <= b.start || t >= b.start + svcOf(b.svc).min));
      out.push({ start: t, pro: free || null });
    }
    return out;
  };

  const freeCount = (d: Date) => (isClosed(d) || !svc ? 0 : slotsFor(iso(d)).filter((s) => s.pro).length);

  const reset = () => { setStep(0); setSvc(null); setPro(null); setDate(null); setSlot(null); setDone(null); setResched(null); setForm({ name: '', phone: '', note: '', remind: true }); };
  const confirm = () => {
    if (resched) {
      const upd = mine.map((b) => (b.id === resched ? { ...b, date: date!, start: slot!.start, pro: slot!.pro } : b));
      setMine(upd); setDone(upd.find((b) => b.id === resched)!); setResched(null); setStep(4); return;
    }
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 9) { setErr(true); return; }
    const b: Bk = { id: 'GR-' + Math.floor(1000 + Math.random() * 9000), svc: svc!, pro: slot!.pro, date: date!, start: slot!.start, name: form.name, phone: form.phone, note: form.note, status: 'active' };
    setMine([b, ...mine]); setDone(b); setStep(4);
  };
  const startResched = (b: Bk) => { setTab('book'); setResched(b.id); setSvc(b.svc); setPro(b.pro); setDate(null); setSlot(null); setDone(null); setStep(2); };
  const cancel = (id: string) => setMine(mine.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));

  const price = svc && (slot?.pro || (pro && pro !== 'any' ? pro : null)) ? priceOf(svc, slot?.pro || pro!) : svc ? svcOf(svc).p : 0;
  const steps = [T('Послуга', 'Service'), T('Майстер', 'Barber'), T('Дата і час', 'Date & time'), T('Ваші дані', 'Your details')];
  const canNext = [!!svc, !!pro, !!slot, true][step];

  return (
    <div className="bk">
      <header className="bk-top">
        <h1 className="bk-brand"><i>{T('Гребінь', 'Hrebin')}</i><span>{T('барбершоп · Поділ', 'barbershop · Podil')}</span></h1>
        <nav className="bk-tabs" role="tablist">
          {([['book', T('Запис', 'Book')], ['mine', T('Мої записи', 'My bookings') + (mine.filter((b) => b.status === 'active').length ? ` · ${mine.filter((b) => b.status === 'active').length}` : '')], ['admin', T('Адміністратор', 'Admin')]] as const).map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={cx(tab === k && 'on')} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>
      </header>

      {tab === 'book' && (
        <div className="bk-flow">
          {step < 4 && (
            <ol className="bk-steps">
              {steps.map((s, i) => (
                <li key={s} className={cx(i === step && 'on', i < step && 'done')}>
                  <button type="button" disabled={i > step || (resched != null && i < 2)} onClick={() => setStep(i)}><span>{i < step ? <Icon n="check" s={12} /> : i + 1}</span>{s}</button>
                </li>
              ))}
            </ol>
          )}
          <div className="bk-body">
            <div className="bk-main">
              {resched && step < 4 && <p className="bk-info"><Icon n="refresh" s={14} /> {T('Перенесення запису', 'Rescheduling')} {resched}</p>}
              {step === 0 && (
                <div className="bk-list">
                  {SVC.map((s) => (
                    <button key={s.id} type="button" className={cx('bk-svc', svc === s.id && 'on')} onClick={() => { setSvc(s.id); if (pro && pro !== 'any' && !proOf(pro).svc.includes(s.id)) setPro(null); setSlot(null); setStep(1); }}>
                      <span className="bk-svc-t">{L(s)}</span>
                      <span className="bk-svc-d">{L(s.d)}</span>
                      <span className="bk-svc-m"><Icon n="clock" s={14} /> {s.min} {T('хв', 'min')}</span>
                      <span className="bk-svc-p">{T('від', 'from')} {money(Math.round(s.p * 0.85 / 10) * 10, lang)}</span>
                    </button>
                  ))}
                </div>
              )}
              {step === 1 && svc && (
                <div className="bk-pros">
                  <button type="button" className={cx('bk-pro', pro === 'any' && 'on')} onClick={() => { setPro('any'); setSlot(null); setStep(2); }}>
                    <span className="bk-av bk-av-any"><Icon n="users" s={22} /></span>
                    <span className="bk-pro-n">{T('Будь-який майстер', 'Any barber')}</span>
                    <span className="bk-pro-r">{T('Найближчий вільний час', 'Earliest available time')}</span>
                  </button>
                  {PROS.map((p) => {
                    const ok = p.svc.includes(svc);
                    return (
                      <button key={p.id} type="button" disabled={!ok} className={cx('bk-pro', pro === p.id && 'on')} onClick={() => { setPro(p.id); setSlot(null); setStep(2); }}>
                        <span className="bk-av" style={{ background: p.hue }}>{L(p.name)[0]}</span>
                        <span className="bk-pro-n">{L(p.name)}</span>
                        <span className="bk-pro-r">{L(p.role)}</span>
                        <span className="bk-pro-p">{ok ? money(priceOf(svc, p.id), lang) : T('не виконує', 'n/a')}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {step === 2 && svc && (
                <div className="bk-when">
                  <div className="bk-days" role="listbox" aria-label={T('Дата', 'Date')}>
                    {days.map((d) => {
                      const k = iso(d); const closed = isClosed(d); const fc = freeCount(d);
                      return (
                        <button key={k} type="button" role="option" aria-selected={date === k} disabled={closed || fc === 0} className={cx('bk-day', date === k && 'on')} onClick={() => { setDate(k); setSlot(null); }}>
                          <span className="bk-day-w">{dateFmt(d, lang, { weekday: 'short' })}</span>
                          <span className="bk-day-n">{d.getDate()}</span>
                          <span className="bk-day-f">{closed ? T('вихідний', 'closed') : fc ? `${fc} ${T('вільн.', 'free')}` : T('зайнято', 'full')}</span>
                        </button>
                      );
                    })}
                  </div>
                  {date ? (
                    <div className="bk-slots">
                      {(['m', 'a', 'e'] as const).map((part) => {
                        const list = slotsFor(date).filter((s) => (part === 'm' ? s.start < 13 * 60 : part === 'a' ? s.start >= 13 * 60 && s.start < 17 * 60 : s.start >= 17 * 60));
                        if (!list.length) return null;
                        return (
                          <div key={part} className="bk-part">
                            <span className="bk-part-l">{part === 'm' ? T('Ранок', 'Morning') : part === 'a' ? T('День', 'Afternoon') : T('Вечір', 'Evening')}</span>
                            <div>
                              {list.map((s) => (
                                <button key={s.start} type="button" disabled={!s.pro} className={cx('bk-slot', slot?.start === s.start && 'on')} onClick={() => setSlot({ start: s.start, pro: s.pro! })}>{hm(s.start)}</button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="bk-hint">{T('Оберіть дату, щоб побачити вільний час', 'Pick a date to see available times')}</p>}
                </div>
              )}
              {step === 3 && (
                <form className="bk-form" onSubmit={(e) => { e.preventDefault(); confirm(); }}>
                  <label className={cx(err && !form.name.trim() && 'err')}><span>{T('Ім’я', 'Name')} *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" /></label>
                  <label className={cx(err && form.phone.replace(/\D/g, '').length < 9 && 'err')}><span>{T('Телефон', 'Phone')} *</span><input value={form.phone} inputMode="tel" placeholder="+380 00 000 00 00" onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" /></label>
                  <label><span>{T('Побажання', 'Notes')}</span><textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
                  <label className="bk-chk"><input type="checkbox" checked={form.remind} onChange={(e) => setForm({ ...form, remind: e.target.checked })} />{T('Нагадати за 2 години (у демо - не надсилається)', 'Remind me 2 hours before (not sent in demo)')}</label>
                  <p className="bk-privacy"><Icon n="lock" s={14} /> {T('Демо: дані залишаються тільки у вашому браузері й нікуди не надсилаються.', 'Demo: your data stays in your browser and is never sent anywhere.')}</p>
                </form>
              )}
              {step === 4 && done && (
                <div className="bk-done">
                  <div className="bk-done-ic"><Icon n="check" s={34} /></div>
                  <h2>{T('Ви записані', 'You’re booked')}</h2>
                  <p className="bk-code">{done.id}</p>
                  <dl>
                    <div><dt>{T('Послуга', 'Service')}</dt><dd>{L(svcOf(done.svc))}</dd></div>
                    <div><dt>{T('Майстер', 'Barber')}</dt><dd>{L(proOf(done.pro).name)}</dd></div>
                    <div><dt>{T('Коли', 'When')}</dt><dd>{dateFmt(done.date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}, {hm(done.start)}</dd></div>
                    <div><dt>{T('Вартість', 'Price')}</dt><dd>{money(priceOf(done.svc, done.pro), lang)}</dd></div>
                  </dl>
                  <div className="bk-done-act">
                    <button type="button" className="bk-btn" onClick={() => startResched(done)}>{T('Перенести', 'Reschedule')}</button>
                    <button type="button" className="bk-btn ghost" onClick={() => { cancel(done.id); reset(); setTab('mine'); }}>{T('Скасувати', 'Cancel')}</button>
                    <button type="button" className="bk-btn ghost" onClick={reset}>{T('Новий запис', 'New booking')}</button>
                  </div>
                </div>
              )}
            </div>
            {step < 4 && (
              <aside className="bk-sum">
                <h3>{T('Ваш запис', 'Your booking')}</h3>
                <dl>
                  <div><dt>{T('Послуга', 'Service')}</dt><dd>{svc ? L(svcOf(svc)) : '-'}</dd></div>
                  <div><dt>{T('Майстер', 'Barber')}</dt><dd>{slot ? L(proOf(slot.pro).name) : pro === 'any' ? T('Будь-який', 'Any') : pro ? L(proOf(pro).name) : '-'}</dd></div>
                  <div><dt>{T('Дата', 'Date')}</dt><dd>{date ? dateFmt(date, lang, { weekday: 'short', day: 'numeric', month: 'short' }) : '-'}{slot ? `, ${hm(slot.start)}` : ''}</dd></div>
                  <div><dt>{T('Тривалість', 'Duration')}</dt><dd>{svc ? `${svcOf(svc).min} ${T('хв', 'min')}` : '-'}</dd></div>
                </dl>
                <div className="bk-total"><span>{T('До сплати в салоні', 'Pay at the shop')}</span><b>{svc ? money(price, lang) : '-'}</b></div>
                <button type="button" className="bk-btn wide" disabled={!canNext} onClick={() => (step === 3 || (resched && step === 2) ? confirm() : setStep(step + 1))}>
                  {step === 3 || (resched && step === 2) ? (resched ? T('Підтвердити перенесення', 'Confirm new time') : T('Підтвердити запис', 'Confirm booking')) : T('Далі', 'Next')}
                </button>
              </aside>
            )}
          </div>
        </div>
      )}

      {tab === 'mine' && (
        <div className="bk-mine">
          {mine.length === 0 && <p className="bk-hint">{T('У вас ще немає записів у цьому демо.', 'You have no bookings in this demo yet.')}</p>}
          {mine.map((b) => (
            <article key={b.id} className={cx('bk-item', b.status === 'cancelled' && 'off')}>
              <div className="bk-item-d"><b>{new Date(b.date + 'T12:00').getDate()}</b><span>{dateFmt(b.date, lang, { month: 'short' })}</span></div>
              <div className="bk-item-c">
                <h4>{L(svcOf(b.svc))} · {hm(b.start)}</h4>
                <p>{L(proOf(b.pro).name)} · {money(priceOf(b.svc, b.pro), lang)} · {b.id}</p>
                {b.status === 'cancelled' && <span className="bk-tag">{T('Скасовано', 'Cancelled')}</span>}
              </div>
              {b.status === 'active' && (
                <div className="bk-item-a">
                  <button type="button" className="bk-btn sm" onClick={() => startResched(b)}>{T('Перенести', 'Reschedule')}</button>
                  <button type="button" className="bk-btn sm ghost" onClick={() => cancel(b.id)}>{T('Скасувати', 'Cancel')}</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === 'admin' && <Admin mine={mine} />}
      <DemoNote className="bk-note" />
    </div>
  );
}

function Admin({ mine }: { mine: Bk[] }) {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [off, setOff] = useState(0);
  const [only, setOnly] = useState<string>('all');
  const [sel, setSel] = useState<Bk | null>(null);
  const [day, setDay] = useState(0);
  const popRef = useDialog(!!sel, () => setSel(null));
  const start = useMemo(() => { const d = new Date(); d.setHours(12, 0, 0, 0); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd + off * 7); return d; }, [off]);
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  const pros = only === 'all' ? PROS : PROS.filter((p) => p.id === only);
  const items = (d: string) => pros.flatMap((p) => [...seeded(d, p.id), ...mine.filter((b) => b.date === d && b.pro === p.id && b.status === 'active')]);
  const H = 44; const top = (m: number) => ((m - OPEN) / 60) * H;
  const load = week.map((d) => (isClosed(d) ? 0 : items(iso(d)).reduce((a, b) => a + svcOf(b.svc).min, 0)));
  const cap = pros.length * (CLOSE - OPEN);
  return (
    <div className="bk-adm">
      <div className="bk-adm-bar">
        <div className="bk-adm-nav">
          <button type="button" aria-label="prev" onClick={() => setOff(off - 1)}><Icon n="chevL" s={18} /></button>
          <b>{dateFmt(week[0], lang, { day: 'numeric', month: 'short' })} - {dateFmt(week[6], lang, { day: 'numeric', month: 'short' })}</b>
          <button type="button" aria-label="next" onClick={() => setOff(off + 1)}><Icon n="chevR" s={18} /></button>
          {off !== 0 && <button type="button" className="bk-btn sm ghost" onClick={() => setOff(0)}>{T('Сьогодні', 'Today')}</button>}
        </div>
        <div className="bk-adm-f">
          <button type="button" className={cx(only === 'all' && 'on')} onClick={() => setOnly('all')}>{T('Усі', 'All')}</button>
          {PROS.map((p) => <button key={p.id} type="button" className={cx(only === p.id && 'on')} onClick={() => setOnly(p.id)}><i style={{ background: p.hue }} />{L(p.name)}</button>)}
        </div>
      </div>
      <div className="bk-adm-days">
        {week.map((d, i) => <button key={i} type="button" className={cx(day === i && 'on')} onClick={() => setDay(i)}>{dateFmt(d, lang, { weekday: 'short' })} {d.getDate()}</button>)}
      </div>
      <div className="bk-cal" style={{ ['--h' as any]: H + 'px' }}>
        <div className="bk-cal-t">
          <div className="bk-cal-hd" />
          {Array.from({ length: (CLOSE - OPEN) / 60 }, (_, i) => <div key={i} className="bk-cal-hr" style={{ height: H }}>{hm(OPEN + i * 60)}</div>)}
        </div>
        {week.map((d, i) => {
          const k = iso(d); const closed = isClosed(d); const today = k === iso(new Date());
          return (
            <div key={k} className={cx('bk-cal-c', today && 'today', i === day && 'act')}>
              <div className="bk-cal-hd">
                <span>{dateFmt(d, lang, { weekday: 'short' })} <b>{d.getDate()}</b></span>
                {!closed && <i className="bk-load"><i style={{ width: Math.min(100, (load[i] / cap) * 100) + '%' }} /></i>}
              </div>
              <div className="bk-cal-b" style={{ height: ((CLOSE - OPEN) / 60) * H }}>
                {closed ? <span className="bk-closed">{T('Вихідний', 'Closed')}</span> : items(k).map((b) => {
                  const p = proOf(b.pro); const lane = only === 'all' ? PROS.indexOf(p) : 0; const lanes = only === 'all' ? PROS.length : 1;
                  return (
                    <button key={b.id} type="button" className={cx('bk-ev', !b.seeded && 'mine')} onClick={() => setSel(b)}
                      style={{ top: top(b.start), height: (svcOf(b.svc).min / 60) * H - 2, left: `${(lane / lanes) * 100}%`, width: `calc(${100 / lanes}% - 2px)`, background: p.hue }}>
                      <b>{hm(b.start)}</b><span>{b.seeded ? CLIENTS[lang][b.client || 0] : b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {sel && (
        <div className="bk-pop" role="dialog" aria-modal="true" onClick={() => setSel(null)} ref={popRef} tabIndex={-1} aria-label={sel ? L(svcOf(sel.svc)) : ''}>
          <div onClick={(e) => e.stopPropagation()}>
            <button type="button" className="bk-x" onClick={() => setSel(null)} aria-label="close"><Icon n="close" /></button>
            <span className="bk-tag" style={{ background: proOf(sel.pro).hue, color: '#fff' }}>{L(proOf(sel.pro).name)}</span>
            <h4>{L(svcOf(sel.svc))}</h4>
            <p>{dateFmt(sel.date, lang, { weekday: 'long', day: 'numeric', month: 'long' })} · {hm(sel.start)}–{hm(sel.start + svcOf(sel.svc).min)}</p>
            <p>{T('Клієнт', 'Client')}: {sel.seeded ? CLIENTS[lang][sel.client || 0] + ' ' + T('(демо)', '(demo)') : `${sel.name} · ${sel.phone}`}</p>
            <p>{money(priceOf(sel.svc, sel.pro), lang)}{!sel.seeded && ` · ${sel.id}`}</p>
            {sel.note && <p>“{sel.note}”</p>}
          </div>
        </div>
      )}
    </div>
  );
}
