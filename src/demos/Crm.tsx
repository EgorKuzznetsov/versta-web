import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../core/i18n';
import { Icon } from '../components/Icon';
import { DemoNote } from '../components/Chrome';
import { money, iso, dateFmt, rng, uid, cx } from '../core/format';
import { useStored, useDialog } from '../core/hooks';

type Seg = 'flat' | 'house' | 'office';
type St = 'new' | 'active' | 'inactive';
interface Client { id: string; name: string; company: string; phone: string; email: string; city: string; seg: Seg; status: St; source: string; created: string; notes: string; orders: { id: string; date: string; title: string; amount: number }[] }
type Stage = 'new' | 'contact' | 'proposal' | 'nego' | 'won' | 'lost';
interface Deal { id: string; client: string; title: string; value: number; stage: Stage; created: string }
interface Task { id: string; title: string; client?: string; due: string; done: boolean; prio: 'h' | 'n' }

const STAGES: { id: Stage; p: number; uk: string; en: string }[] = [
  { id: 'new', p: 0.1, uk: 'Нова заявка', en: 'New lead' },
  { id: 'contact', p: 0.25, uk: 'Контакт', en: 'Contacted' },
  { id: 'proposal', p: 0.5, uk: 'Пропозиція', en: 'Proposal' },
  { id: 'nego', p: 0.75, uk: 'Переговори', en: 'Negotiation' },
  { id: 'won', p: 1, uk: 'Виграно', en: 'Won' },
  { id: 'lost', p: 0, uk: 'Програно', en: 'Lost' },
];
const NAMES = ['Ковальчук Ірина', 'Мельник Андрій', 'Бондаренко Олена', 'Шевчук Тарас', 'Ткаченко Марія', 'Кравченко Олег', 'Поліщук Наталія', 'Лисенко Віктор', 'Савчук Юлія', 'Руденко Дмитро', 'Марченко Оксана', 'Гончар Богдан', 'Олійник Світлана', 'Петренко Роман', 'Кузьменко Ганна', 'Захарченко Ігор', 'Павленко Тетяна', 'Литвин Максим'];
const NAMES_EN = ['Iryna Kovalchuk', 'Andrii Melnyk', 'Olena Bondarenko', 'Taras Shevchuk', 'Mariia Tkachenko', 'Oleh Kravchenko', 'Nataliia Polishchuk', 'Viktor Lysenko', 'Yuliia Savchuk', 'Dmytro Rudenko', 'Oksana Marchenko', 'Bohdan Honchar', 'Svitlana Oliinyk', 'Roman Petrenko', 'Hanna Kuzmenko', 'Ihor Zakharchenko', 'Tetiana Pavlenko', 'Maksym Lytvyn'];
const CO = ['', 'ТОВ «Дім-Буд»', '', 'Кав’ярня «Зерно»', '', 'Студія «Лінія»', '', '', 'ФОП', 'Офіс «Каркас»', '', '', 'Пекарня «Хліб»', '', '', 'IT-офіс «Код»', '', ''];
const CO_EN = ['', 'Dim-Bud LLC', '', 'Zerno café', '', 'Liniia studio', '', '', 'Sole trader', 'Karkas office', '', '', 'Khlib bakery', '', '', 'Kod IT office', '', ''];
const CITIES = { uk: ['Київ', 'Львів', 'Ірпінь', 'Бровари', 'Буча'], en: ['Kyiv', 'Lviv', 'Irpin', 'Brovary', 'Bucha'] };
const WORK = { uk: ['Ремонт ванної', 'Ремонт кухні', 'Дизайн-проєкт', 'Ремонт під ключ', 'Електрика', 'Підлога та стеля', 'Ремонт офісу'], en: ['Bathroom renovation', 'Kitchen renovation', 'Design project', 'Full renovation', 'Electrical works', 'Floors and ceilings', 'Office renovation'] };
const SRC = ['Instagram', 'Google', 'Сайт', 'Рекомендація'];
const SRC_EN: Record<string, string> = { Instagram: 'Instagram', Google: 'Google', 'Сайт': 'Website', 'Рекомендація': 'Referral' };

function seed(lang: 'uk' | 'en') {
  const r = rng(424242);
  const now = new Date();
  const d = (back: number) => { const x = new Date(now); x.setDate(x.getDate() - back); return iso(x); };
  const clients: Client[] = NAMES.map((n, i) => {
    const nOrders = Math.floor(r() * 4);
    return {
      id: 'c' + i, name: lang === 'uk' ? n : NAMES_EN[i], company: lang === 'uk' ? CO[i] : CO_EN[i], phone: `+380 00 ${String(100 + i * 37).slice(0, 3)} ${String(10 + i).padStart(2, '0')} ${String(30 + i * 3).slice(0, 2)}`,
      email: `client${i + 1}@example.com`, city: CITIES[lang][i % 5], seg: (['flat', 'house', 'office'] as Seg[])[i % 3 === 2 && CO[i] ? 2 : Math.floor(r() * 2)],
      status: (['active', 'new', 'active', 'inactive'] as St[])[Math.floor(r() * 4)], source: SRC[Math.floor(r() * 4)], created: d(20 + Math.floor(r() * 400)), notes: '',
      orders: Array.from({ length: nOrders }, (_, k) => ({ id: 'Z-' + (2100 + i * 5 + k), date: d(30 + Math.floor(r() * 360)), title: WORK[lang][Math.floor(r() * 7)], amount: Math.round((15000 + r() * 220000) / 500) * 500 })).sort((a, b) => b.date.localeCompare(a.date)),
    };
  });
  const deals: Deal[] = Array.from({ length: 16 }, (_, i) => ({
    id: 'D' + i, client: 'c' + Math.floor(r() * clients.length), title: WORK[lang][Math.floor(r() * 7)], value: Math.round((20000 + r() * 280000) / 1000) * 1000,
    stage: STAGES[Math.min(5, Math.floor(r() * 6))].id, created: d(Math.floor(r() * 60)),
  }));
  const tasks: Task[] = [
    { id: 't1', title: lang === 'uk' ? 'Передзвонити щодо кошторису' : 'Call back about the estimate', client: 'c1', due: d(1), done: false, prio: 'h' },
    { id: 't2', title: lang === 'uk' ? 'Надіслати дизайн-проєкт' : 'Send the design project', client: 'c4', due: d(0), done: false, prio: 'h' },
    { id: 't3', title: lang === 'uk' ? 'Замір у квартирі' : 'On-site measurement', client: 'c7', due: d(0), done: false, prio: 'n' },
    { id: 't4', title: lang === 'uk' ? 'Узгодити матеріали з клієнтом' : 'Agree materials with client', client: 'c2', due: d(-2), done: false, prio: 'n' },
    { id: 't5', title: lang === 'uk' ? 'Підписати договір' : 'Sign the contract', client: 'c9', due: d(-4), done: false, prio: 'h' },
    { id: 't6', title: lang === 'uk' ? 'Фото обʼєкта для портфоліо' : 'Photos of the site for portfolio', due: d(3), done: true, prio: 'n' },
  ];
  return { clients, deals, tasks };
}

export default function Crm() {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const init = useMemo(() => seed(lang), [lang]); // each language keeps its own demo dataset
  const [clients, setClients] = useStored<Client[]>('demo.crm.clients.' + lang, init.clients);
  const [deals, setDeals] = useStored<Deal[]>('demo.crm.deals.' + lang, init.deals);
  const [tasks, setTasks] = useStored<Task[]>('demo.crm.tasks.' + lang, init.tasks);
  const [view, setView] = useState<'clients' | 'deals' | 'tasks'>('deals');
  const [openC, setOpenC] = useState<string | null>(null);
  const [edit, setEdit] = useState<Client | null>(null);
  const [bell, setBell] = useState(false);
  const drawerRef = useDialog(!!openC && !edit, () => setOpenC(null));
  const bellRef = useDialog(bell, () => setBell(false), { trap: false });
  const today = iso(new Date());
  const due = tasks.filter((t) => !t.done && t.due <= today);
  const cname = (id?: string) => clients.find((c) => c.id === id)?.name || '-';
  const M = (v: number) => money(v, lang, { decimals: false });

  const saveClient = (c: Client) => {
    setClients(clients.some((x) => x.id === c.id) ? clients.map((x) => (x.id === c.id ? c : x)) : [c, ...clients]);
    setEdit(null); setOpenC(c.id);
  };

  return (
    <div className="crm">
      <aside className="crm-side">
        <div className="crm-logo"><i />Pipeline</div>
        <nav>
          {([['deals', T('Угоди', 'Deals'), 'layers'], ['clients', T('Клієнти', 'Clients'), 'users'], ['tasks', T('Задачі', 'Tasks'), 'check']] as const).map(([k, l, ic]) => (
            <button key={k} type="button" className={cx(view === k && 'on')} onClick={() => setView(k)}><Icon n={ic} s={18} /><span>{l}</span>{k === 'tasks' && due.length > 0 && <em>{due.length}</em>}</button>
          ))}
        </nav>
        <p className="crm-co">{T('Студія ремонту «Кут»', '“Kut” renovation studio')}<small>{T('демо-акаунт', 'demo account')}</small></p>
      </aside>
      <div className="crm-main">
        <header className="crm-top">
          <h1>{view === 'deals' ? T('Воронка угод', 'Deal pipeline') : view === 'clients' ? T('Клієнти', 'Clients') : T('Задачі й нагадування', 'Tasks & reminders')}</h1>
          <div className="crm-top-r">
            <div className="crm-bell-w" ref={bellRef}>
              <button type="button" className="crm-ib" aria-label={T('Нагадування', 'Reminders')} aria-expanded={bell} onClick={() => setBell(!bell)}><Icon n="bell" s={18} />{due.length > 0 && <em>{due.length}</em>}</button>
              {bell && (
                <div className="crm-drop">
                  <b>{T('Потребують уваги', 'Needs attention')}</b>
                  {due.length === 0 && <p>{T('Усе виконано', 'All done')}</p>}
                  {due.map((t) => <button type="button" key={t.id} onClick={() => { setView('tasks'); setBell(false); }}><span className={cx('crm-dot', t.due < today && 'late')} />{t.title}<small>{t.due < today ? T('прострочено', 'overdue') : T('сьогодні', 'today')}</small></button>)}
                </div>
              )}
            </div>
            <button type="button" className="crm-btn" onClick={() => setEdit({ id: 'c' + uid(), name: '', company: '', phone: '', email: '', city: '', seg: 'flat', status: 'new', source: 'Сайт', created: today, notes: '', orders: [] })}><Icon n="plus" s={16} />{T('Клієнт', 'Client')}</button>
          </div>
        </header>

        {view === 'deals' && <Board deals={deals} setDeals={setDeals} clients={clients} cname={cname} M={M} onOpen={setOpenC} />}
        {view === 'clients' && <Clients clients={clients} onOpen={setOpenC} M={M} />}
        {view === 'tasks' && <Tasks tasks={tasks} setTasks={setTasks} clients={clients} cname={cname} />}
        <DemoNote className="crm-note" />
      </div>

      {openC && !edit && (() => {
        const c = clients.find((x) => x.id === openC); if (!c) return null;
        const cd = deals.filter((d) => d.client === c.id);
        const total = c.orders.reduce((a, o) => a + o.amount, 0);
        return (
          <div className="crm-drawer" role="dialog" aria-modal="true" aria-label={c.name} ref={drawerRef} tabIndex={-1}>
            <button type="button" className="crm-scrim" aria-label="close" onClick={() => setOpenC(null)} />
            <div className="crm-dr-in">
              <div className="crm-dr-h">
                <span className="crm-av">{c.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
                <div><h2>{c.name}</h2><p>{c.company || T('Приватна особа', 'Private client')} · {c.city}</p></div>
                <button type="button" className="crm-ib" onClick={() => setOpenC(null)} aria-label="close"><Icon n="close" s={18} /></button>
              </div>
              <div className="crm-dr-act">
                <button type="button" className="crm-btn" onClick={() => setEdit(c)}><Icon n="edit" s={16} />{T('Редагувати', 'Edit')}</button>
                <button type="button" className="crm-btn ghost" onClick={() => { setTasks([{ id: uid(), title: T('Звʼязатися з клієнтом', 'Contact the client'), client: c.id, due: today, done: false, prio: 'n' }, ...tasks]); setView('tasks'); setOpenC(null); }}><Icon n="bell" s={16} />{T('Нагадування', 'Reminder')}</button>
              </div>
              <dl className="crm-dl">
                <div><dt>{T('Телефон', 'Phone')}</dt><dd>{c.phone || '-'}</dd></div>
                <div><dt>Email</dt><dd>{c.email || '-'}</dd></div>
                <div><dt>{T('Сегмент', 'Segment')}</dt><dd>{segName(c.seg, lang)}</dd></div>
                <div><dt>{T('Статус', 'Status')}</dt><dd><span className={'crm-st st-' + c.status}>{stName(c.status, lang)}</span></dd></div>
                <div><dt>{T('Джерело', 'Source')}</dt><dd>{lang === 'uk' ? c.source : SRC_EN[c.source] || c.source}</dd></div>
                <div><dt>{T('Клієнт з', 'Client since')}</dt><dd>{dateFmt(c.created, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
              </dl>
              {c.notes && <p className="crm-notes">{c.notes}</p>}
              <h3>{T('Історія замовлень', 'Order history')} <span>{M(total)}</span></h3>
              {c.orders.length === 0 ? <p className="crm-mut">{T('Замовлень ще не було', 'No orders yet')}</p> : (
                <ul className="crm-hist">{c.orders.map((o) => <li key={o.id}><span className="crm-mut">{dateFmt(o.date, lang, { day: 'numeric', month: 'short', year: '2-digit' })}</span><span>{o.title}</span><b>{M(o.amount)}</b></li>)}</ul>
              )}
              <h3>{T('Угоди', 'Deals')}</h3>
              {cd.length === 0 ? <p className="crm-mut">-</p> : <ul className="crm-hist">{cd.map((d) => <li key={d.id}><span className="crm-tag">{lang === 'uk' ? STAGES.find((s) => s.id === d.stage)!.uk : STAGES.find((s) => s.id === d.stage)!.en}</span><span>{d.title}</span><b>{M(d.value)}</b></li>)}</ul>}
            </div>
          </div>
        );
      })()}

      {edit && <ClientForm c={edit} onCancel={() => setEdit(null)} onSave={saveClient} />}
    </div>
  );
}

const segName = (s: Seg, l: string) => ({ flat: ['Квартира', 'Apartment'], house: ['Будинок', 'House'], office: ['Комерція', 'Commercial'] }[s][l === 'uk' ? 0 : 1]);
const stName = (s: St, l: string) => ({ new: ['Новий', 'New'], active: ['Активний', 'Active'], inactive: ['Неактивний', 'Inactive'] }[s][l === 'uk' ? 0 : 1]);

function Clients({ clients, onOpen, M }: { clients: Client[]; onOpen: (id: string) => void; M: (v: number) => string }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<'all' | Seg>('all');
  const [st, setSt] = useState<'all' | St>('all');
  const [sort, setSort] = useState<'name' | 'total' | 'created'>('created');
  const list = clients
    .filter((c) => (seg === 'all' || c.seg === seg) && (st === 'all' || c.status === st))
    .filter((c) => { const qq = q.trim().toLowerCase(); return !qq || [c.name, c.company, c.phone, c.email, c.city].join(' ').toLowerCase().includes(qq); })
    .map((c) => ({ c, total: c.orders.reduce((a, o) => a + o.amount, 0) }))
    .sort((a, b) => (sort === 'name' ? a.c.name.localeCompare(b.c.name) : sort === 'total' ? b.total - a.total : b.c.created.localeCompare(a.c.created)));
  return (
    <div className="crm-cl">
      <div className="crm-filters">
        <label className="crm-search"><Icon n="search" s={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Імʼя, компанія, телефон…', 'Name, company, phone…')} /></label>
        <select value={seg} onChange={(e) => setSeg(e.target.value as any)} aria-label={T('Сегмент', 'Segment')}>
          <option value="all">{T('Усі сегменти', 'All segments')}</option>{(['flat', 'house', 'office'] as Seg[]).map((s) => <option key={s} value={s}>{segName(s, lang)}</option>)}
        </select>
        <select value={st} onChange={(e) => setSt(e.target.value as any)} aria-label={T('Статус', 'Status')}>
          <option value="all">{T('Усі статуси', 'All statuses')}</option>{(['new', 'active', 'inactive'] as St[]).map((s) => <option key={s} value={s}>{stName(s, lang)}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label={T('Сортування', 'Sort')}>
          <option value="created">{T('Спершу нові', 'Newest first')}</option><option value="name">{T('За імʼям', 'By name')}</option><option value="total">{T('За сумою замовлень', 'By order total')}</option>
        </select>
      </div>
      <div className="crm-table">
        <div className="crm-tr crm-th"><span>{T('Клієнт', 'Client')}</span><span>{T('Контакти', 'Contacts')}</span><span>{T('Сегмент', 'Segment')}</span><span>{T('Статус', 'Status')}</span><span className="r">{T('Замовлення', 'Orders')}</span></div>
        {list.map(({ c, total }) => (
          <button type="button" key={c.id} className="crm-tr" onClick={() => onOpen(c.id)}>
            <span className="crm-cell-n"><span className="crm-av sm">{c.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span><span><b>{c.name}</b><small>{c.company || c.city}</small></span></span>
            <span className="crm-mut"><small>{c.phone}</small><small>{c.email}</small></span>
            <span>{segName(c.seg, lang)}</span>
            <span><span className={'crm-st st-' + c.status}>{stName(c.status, lang)}</span></span>
            <span className="r"><b>{M(total)}</b><small className="crm-mut">{c.orders.length} {T('шт.', 'orders')}</small></span>
          </button>
        ))}
        {!list.length && <p className="crm-empty">{T('Нікого не знайдено', 'No clients found')}</p>}
      </div>
    </div>
  );
}

function ClientForm({ c, onSave, onCancel }: { c: Client; onSave: (c: Client) => void; onCancel: () => void }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [f, setF] = useState(c);
  const [err, setErr] = useState(false);
  const isNew = !c.name;
  const dlg = useDialog(true, onCancel);
  const set = (k: keyof Client) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="crm-modal" role="dialog" aria-modal="true" ref={dlg} tabIndex={-1} aria-label={isNew ? T('Новий клієнт', 'New client') : T('Редагування', 'Edit client')}>
      <button type="button" className="crm-scrim" aria-label="close" onClick={onCancel} />
      <form className="crm-modal-in" onSubmit={(e) => { e.preventDefault(); if (!f.name.trim() || (!f.phone.trim() && !f.email.trim())) { setErr(true); return; } onSave(f); }}>
        <h2>{isNew ? T('Новий клієнт', 'New client') : T('Редагування', 'Edit client')}</h2>
        <div className="crm-fg">
          <label className={cx(err && !f.name.trim() && 'err')}><span>{T('Імʼя *', 'Name *')}</span><input value={f.name} onChange={set('name')} autoFocus /></label>
          <label><span>{T('Компанія', 'Company')}</span><input value={f.company} onChange={set('company')} /></label>
          <label className={cx(err && !f.phone.trim() && !f.email.trim() && 'err')}><span>{T('Телефон', 'Phone')}</span><input value={f.phone} onChange={set('phone')} inputMode="tel" /></label>
          <label className={cx(err && !f.phone.trim() && !f.email.trim() && 'err')}><span>Email</span><input value={f.email} onChange={set('email')} type="email" /></label>
          <label><span>{T('Місто', 'City')}</span><input value={f.city} onChange={set('city')} /></label>
          <label><span>{T('Сегмент', 'Segment')}</span><select value={f.seg} onChange={set('seg')}>{(['flat', 'house', 'office'] as Seg[]).map((s) => <option key={s} value={s}>{segName(s, lang)}</option>)}</select></label>
          <label><span>{T('Статус', 'Status')}</span><select value={f.status} onChange={set('status')}>{(['new', 'active', 'inactive'] as St[]).map((s) => <option key={s} value={s}>{stName(s, lang)}</option>)}</select></label>
          <label><span>{T('Джерело', 'Source')}</span><select value={f.source} onChange={set('source')}>{SRC.map((s) => <option key={s} value={s}>{lang === 'uk' ? s : SRC_EN[s]}</option>)}</select></label>
          <label className="full"><span>{T('Нотатки', 'Notes')}</span><textarea rows={3} value={f.notes} onChange={set('notes')} /></label>
        </div>
        {err && <p className="crm-err">{T('Вкажіть імʼя та телефон або email', 'Enter a name and a phone or email')}</p>}
        <div className="crm-modal-f"><button type="button" className="crm-btn ghost" onClick={onCancel}>{T('Скасувати', 'Cancel')}</button><button type="submit" className="crm-btn">{T('Зберегти', 'Save')}</button></div>
      </form>
    </div>
  );
}

/* ---------- Kanban with pointer-based drag & drop (mouse, pen and touch) ---------- */
function Board({ deals, setDeals, clients, cname, M, onOpen }: { deals: Deal[]; setDeals: (d: Deal[]) => void; clients: Client[]; cname: (id?: string) => string; M: (v: number) => string; onOpen: (clientId: string) => void }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; ox: number; oy: number; w: number } | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [adding, setAdding] = useState<Stage | null>(null);
  const [nd, setNd] = useState({ title: '', client: clients[0]?.id || '', value: '' });
  const board = useRef<HTMLDivElement>(null);
  const pending = useRef<{ id: string; sx: number; sy: number; el: HTMLElement; pid: number } | null>(null);
  const edge = useRef(0);
  const moved = useRef(false); // true right after a drag, so the click that ends it doesn't open the card

  const open = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const pipe = open.reduce((a, d) => a + d.value, 0);
  const weighted = open.reduce((a, d) => a + d.value * STAGES.find((s) => s.id === d.stage)!.p, 0);
  const won = deals.filter((d) => d.stage === 'won').reduce((a, d) => a + d.value, 0);

  const colAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest('[data-col]') as HTMLElement | null)?.dataset.col as Stage | undefined;

  useEffect(() => {
    if (!drag) return;
    let raf = 0;
    const loop = () => { if (board.current && edge.current) board.current.scrollLeft += edge.current; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [!!drag]);

  const down = (e: React.PointerEvent, id: string) => {
    if ((e.target as HTMLElement).closest('select,button:not(.crm-grip)')) return;
    const isHandle = !!(e.target as HTMLElement).closest('.crm-grip');
    if (e.pointerType !== 'mouse' && !isHandle) return; // on touch, drag only from the handle so the board still scrolls
    const el = (e.currentTarget as HTMLElement);
    pending.current = { id, sx: e.clientX, sy: e.clientY, el, pid: e.pointerId };
    el.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const p = pending.current;
    if (p && !drag) {
      if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 5) return;
      const r = p.el.getBoundingClientRect();
      moved.current = true;
      setDrag({ id: p.id, x: e.clientX, y: e.clientY, ox: p.sx - r.left, oy: p.sy - r.top, w: r.width });
      return;
    }
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setOver(colAt(e.clientX, e.clientY) || null);
    const b = board.current?.getBoundingClientRect();
    edge.current = b ? (e.clientX < b.left + 50 ? -10 : e.clientX > b.right - 50 ? 10 : 0) : 0;
  };
  const up = (e: React.PointerEvent) => {
    if (drag) {
      const col = colAt(e.clientX, e.clientY);
      if (col) setDeals(deals.map((d) => (d.id === drag.id ? { ...d, stage: col } : d)));
    }
    pending.current = null; edge.current = 0; setDrag(null); setOver(null);
  };

  const dragged = drag && deals.find((d) => d.id === drag.id);
  return (
    <div className="crm-board-w">
      <div className="crm-stats">
        <div><span>{T('У роботі', 'Open pipeline')}</span><b>{M(pipe)}</b><small>{T('Угод', 'Deals')}: {open.length}</small></div>
        <div className="acc"><span>{T('Потенційна виручка', 'Weighted forecast')}</span><b>{M(weighted)}</b><small>{T('з урахуванням імовірності етапу', 'weighted by stage probability')}</small></div>
        <div><span>{T('Виграно', 'Won')}</span><b>{M(won)}</b><small>{T('Угод', 'Deals')}: {deals.filter((d) => d.stage === 'won').length}</small></div>
      </div>
      <p className="crm-hint"><Icon n="grip" s={14} /> {T('Натисніть на картку, щоб відкрити клієнта. Перетягніть - щоб змінити етап (на телефоні - за значок).', 'Click a card to open the client. Drag it to change the stage (on a phone, by the handle).')}</p>
      <div className="crm-board" ref={board}>
        {STAGES.map((s) => {
          const items = deals.filter((d) => d.stage === s.id);
          const sum = items.reduce((a, d) => a + d.value, 0);
          return (
            <section key={s.id} data-col={s.id} className={cx('crm-col', over === s.id && 'over', 'c-' + s.id)}>
              <header><b>{lang === 'uk' ? s.uk : s.en}</b><span>{items.length}</span><small>{M(sum)} · {Math.round(s.p * 100)}%</small></header>
              <div className="crm-cards">
                {items.map((d) => (
                  <article key={d.id} className={cx('crm-card', drag?.id === d.id && 'ghosted')} tabIndex={0} aria-label={`${d.title} - ${cname(d.client)}`}
                    onPointerDown={(e) => { moved.current = false; down(e, d.id); }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
                    onClick={(e) => { if (moved.current) { moved.current = false; return; } if ((e.target as HTMLElement).closest('select,.crm-grip')) return; onOpen(d.client); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onOpen(d.client); }}>
                    <div className="crm-card-h"><b>{d.title}</b><span className="crm-grip" aria-hidden="true"><Icon n="grip" s={16} /></span></div>
                    <p>{cname(d.client)}</p>
                    <div className="crm-card-f"><b>{M(d.value)}</b>
                      <select aria-label={T('Перемістити', 'Move to')} value={d.stage} onChange={(e) => setDeals(deals.map((x) => (x.id === d.id ? { ...x, stage: e.target.value as Stage } : x)))}>
                        {STAGES.map((o) => <option key={o.id} value={o.id}>{lang === 'uk' ? o.uk : o.en}</option>)}
                      </select>
                    </div>
                  </article>
                ))}
                {adding === s.id ? (
                  <form className="crm-add" onSubmit={(e) => { e.preventDefault(); if (!nd.title.trim()) return; setDeals([...deals, { id: uid(), title: nd.title, client: nd.client, value: Math.max(0, (+nd.value || 0) * (lang === 'uk' ? 1 : 45)), stage: s.id, created: iso(new Date()) }]); setAdding(null); setNd({ title: '', client: clients[0]?.id || '', value: '' }); }}>
                    <input autoFocus placeholder={T('Назва угоди', 'Deal title')} value={nd.title} onChange={(e) => setNd({ ...nd, title: e.target.value })} />
                    <select value={nd.client} onChange={(e) => setNd({ ...nd, client: e.target.value })}>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <input inputMode="numeric" placeholder={T('Сума, грн', 'Value, €')} value={nd.value} onChange={(e) => setNd({ ...nd, value: e.target.value.replace(/\D/g, '') })} />
                    <div><button type="submit" className="crm-btn sm">{T('Додати', 'Add')}</button><button type="button" className="crm-btn sm ghost" onClick={() => setAdding(null)}>{T('Скасувати', 'Cancel')}</button></div>
                  </form>
                ) : <button type="button" className="crm-addb" onClick={() => setAdding(s.id)}><Icon n="plus" s={14} /> {T('Угода', 'Deal')}</button>}
              </div>
            </section>
          );
        })}
      </div>
      {drag && dragged && (
        <div className="crm-card crm-float" style={{ width: drag.w, transform: `translate(${drag.x - drag.ox}px, ${drag.y - drag.oy}px) rotate(-2deg)` }}>
          <div className="crm-card-h"><b>{dragged.title}</b></div><p>{cname(dragged.client)}</p><div className="crm-card-f"><b>{M(dragged.value)}</b></div>
        </div>
      )}
    </div>
  );
}

function Tasks({ tasks, setTasks, clients, cname }: { tasks: Task[]; setTasks: (t: Task[]) => void; clients: Client[]; cname: (id?: string) => string }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const today = iso(new Date());
  const [f, setF] = useState({ title: '', client: '', due: today, prio: 'n' as 'n' | 'h' });
  const groups: [string, Task[]][] = [
    [T('Прострочені', 'Overdue'), tasks.filter((t) => !t.done && t.due < today)],
    [T('Сьогодні', 'Today'), tasks.filter((t) => !t.done && t.due === today)],
    [T('Заплановані', 'Upcoming'), tasks.filter((t) => !t.done && t.due > today).sort((a, b) => a.due.localeCompare(b.due))],
    [T('Виконані', 'Done'), tasks.filter((t) => t.done)],
  ];
  return (
    <div className="crm-tasks">
      <form className="crm-tform" onSubmit={(e) => { e.preventDefault(); if (!f.title.trim()) return; setTasks([{ id: uid(), title: f.title, client: f.client || undefined, due: f.due, done: false, prio: f.prio }, ...tasks]); setF({ ...f, title: '' }); }}>
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={T('Нова задача або нагадування…', 'New task or reminder…')} aria-label={T('Задача', 'Task')} />
        <select value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} aria-label={T('Клієнт', 'Client')}><option value="">{T('Без клієнта', 'No client')}</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} aria-label={T('Термін', 'Due date')} />
        <label className="crm-prio"><input type="checkbox" checked={f.prio === 'h'} onChange={(e) => setF({ ...f, prio: e.target.checked ? 'h' : 'n' })} />{T('Важливо', 'Important')}</label>
        <button type="submit" className="crm-btn"><Icon n="plus" s={16} />{T('Додати', 'Add')}</button>
      </form>
      {groups.map(([g, list]) => list.length > 0 && (
        <section key={g} className="crm-tg">
          <h3>{g} <span>{list.length}</span></h3>
          <ul>
            {list.map((t) => (
              <li key={t.id} className={cx(t.done && 'done', !t.done && t.due < today && 'late')}>
                <label className="crm-tc"><input type="checkbox" checked={t.done} onChange={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} /><span><Icon n="check" s={12} /></span></label>
                <div><b>{t.prio === 'h' && <i className="crm-hi">!</i>}{t.title}</b><small>{t.client ? cname(t.client) + ' · ' : ''}{dateFmt(t.due, lang, { day: 'numeric', month: 'short' })}</small></div>
                <button type="button" className="crm-ib" aria-label={T('Видалити', 'Delete')} onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}><Icon n="trash" s={16} /></button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
