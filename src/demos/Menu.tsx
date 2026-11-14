import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT, Bi } from '../core/i18n';
import { Icon } from '../components/Icon';
import { money, cx, rng, dp, fmtD } from '../core/format';
import { useStored, useDialog } from '../core/hooks';

type Tag = 'veg' | 'spicy' | 'gf';
type Kind = 'plate' | 'bowl' | 'board' | 'glass' | 'slice' | 'pasta';
interface Dish { id: string; cat: string; name: Bi; desc: Bi; p: number; g: string; tags: Tag[]; kind: Kind; c: [string, string, string]; add?: string[] }

const CATS: { id: string; n: Bi }[] = [
  { id: 'start', n: { uk: 'Закуски', en: 'Starters' } },
  { id: 'fire', n: { uk: 'З вогню', en: 'From the fire' } },
  { id: 'pasta', n: { uk: 'Паста', en: 'Pasta' } },
  { id: 'salad', n: { uk: 'Салати', en: 'Salads' } },
  { id: 'dessert', n: { uk: 'Десерти', en: 'Desserts' } },
  { id: 'drinks', n: { uk: 'Напої', en: 'Drinks' } },
];
const ADD: Record<string, { n: Bi; p: number }> = {
  cheese: { n: { uk: 'Бринза', en: 'Brynza cheese' }, p: 45 },
  egg: { n: { uk: 'Яйце пашот', en: 'Poached egg' }, p: 35 },
  chili: { n: { uk: 'Перець чилі', en: 'Chili' }, p: 15 },
  bacon: { n: { uk: 'Хрусткий бекон', en: 'Crispy bacon' }, p: 55 },
  bread: { n: { uk: 'Хліб із печі', en: 'Wood-fired bread' }, p: 40 },
  sauce: { n: { uk: 'Соус із печеного перцю', en: 'Roasted pepper sauce' }, p: 30 },
  truffle: { n: { uk: 'Трюфельна олія', en: 'Truffle oil' }, p: 60 },
  icecream: { n: { uk: 'Кулька морозива', en: 'Scoop of ice cream' }, p: 50 },
  lemon: { n: { uk: 'Лимон', en: 'Lemon' }, p: 10 },
  syrup: { n: { uk: 'Сироп', en: 'Syrup' }, p: 20 },
};
const DISHES: Dish[] = [
  { id: 'd1', cat: 'start', name: { uk: 'Печений буряк із козячим сиром', en: 'Roasted beetroot, goat cheese' }, desc: { uk: 'Буряк із жару, горіхи, мед, мікрозелень', en: 'Ember-roasted beet, walnuts, honey, microgreens' }, p: 245, g: '220 г', tags: ['veg', 'gf'], kind: 'plate', c: ['#8E2F45', '#F2EEE6', '#7A8F3A'], add: ['cheese', 'bread'] },
  { id: 'd2', cat: 'start', name: { uk: 'Хумус із печеним перцем', en: 'Hummus with roasted pepper' }, desc: { uk: 'Нут, тахіні, копчена паприка, лаваш', en: 'Chickpeas, tahini, smoked paprika, flatbread' }, p: 195, g: '250 г', tags: ['veg'], kind: 'bowl', c: ['#E2C48E', '#C8532B', '#6E8B3D'], add: ['bread', 'chili'] },
  { id: 'd3', cat: 'start', name: { uk: 'Дошка ковбас і сирів', en: 'Charcuterie & cheese board' }, desc: { uk: 'Три види ковбас, два сири, гірчиця, огірки', en: 'Three cured meats, two cheeses, mustard, pickles' }, p: 420, g: '400 г', tags: [], kind: 'board', c: ['#B5483A', '#EBCB7A', '#6E8B3D'], add: ['bread'] },
  { id: 'd4', cat: 'fire', name: { uk: 'Стейк з яловичини на вугіллі', en: 'Charcoal beef steak' }, desc: { uk: 'Мармурова яловичина, печена картопля, соус', en: 'Marbled beef, roasted potatoes, sauce' }, p: 690, g: '300 г', tags: ['gf'], kind: 'plate', c: ['#6B3424', '#E3B65C', '#5F7F2E'], add: ['sauce', 'egg', 'truffle'] },
  { id: 'd5', cat: 'fire', name: { uk: 'Курча на грилі з часником', en: 'Grilled chicken, garlic' }, desc: { uk: 'Половина курчати, часникова олія, лимон', en: 'Half chicken, garlic oil, lemon' }, p: 385, g: '450 г', tags: ['gf'], kind: 'plate', c: ['#C98A3B', '#F4E1A6', '#6E8B3D'], add: ['sauce', 'chili', 'lemon'] },
  { id: 'd6', cat: 'fire', name: { uk: 'Гостра свиняча шийка', en: 'Spicy pork neck' }, desc: { uk: 'Маринад із чилі, мариновані овочі', en: 'Chili marinade, pickled vegetables' }, p: 365, g: '320 г', tags: ['spicy', 'gf'], kind: 'plate', c: ['#9C3A22', '#E9A23B', '#4F6E2A'], add: ['sauce', 'bread'] },
  { id: 'd7', cat: 'fire', name: { uk: 'Печені овочі з печі', en: 'Wood-oven vegetables' }, desc: { uk: 'Цукіні, перець, баклажан, песто', en: 'Courgette, pepper, aubergine, pesto' }, p: 265, g: '300 г', tags: ['veg', 'gf'], kind: 'plate', c: ['#6E8B3D', '#C8532B', '#4B3B6B'], add: ['cheese', 'egg'] },
  { id: 'd8', cat: 'pasta', name: { uk: 'Паста з білими грибами', en: 'Porcini pasta' }, desc: { uk: 'Тальятеле, вершки, пармезан', en: 'Tagliatelle, cream, parmesan' }, p: 340, g: '320 г', tags: ['veg'], kind: 'pasta', c: ['#E8CF94', '#8A5A2B', '#6E8B3D'], add: ['truffle', 'bacon', 'cheese'] },
  { id: 'd9', cat: 'pasta', name: { uk: 'Арабʼята з чилі', en: 'Arrabbiata' }, desc: { uk: 'Пенне, томати, чилі, базилік', en: 'Penne, tomatoes, chili, basil' }, p: 275, g: '300 г', tags: ['veg', 'spicy'], kind: 'pasta', c: ['#D24E2A', '#F1C27D', '#3F7A2E'], add: ['chili', 'cheese', 'bacon'] },
  { id: 'd10', cat: 'salad', name: { uk: 'Салат із печеним гарбузом', en: 'Roasted pumpkin salad' }, desc: { uk: 'Гарбуз, рукола, гарбузове насіння, фета', en: 'Pumpkin, rocket, pumpkin seeds, feta' }, p: 235, g: '240 г', tags: ['veg', 'gf'], kind: 'bowl', c: ['#E0873A', '#5E8A2F', '#F2EEE6'], add: ['cheese', 'egg'] },
  { id: 'd11', cat: 'salad', name: { uk: 'Теплий салат із телятиною', en: 'Warm veal salad' }, desc: { uk: 'Телятина, мікс салатів, кунжут', en: 'Veal, leaf mix, sesame' }, p: 325, g: '260 г', tags: ['gf'], kind: 'bowl', c: ['#7A3E2B', '#6E9A3A', '#E9D7A0'], add: ['egg', 'sauce'] },
  { id: 'd12', cat: 'dessert', name: { uk: 'Баскський чізкейк', en: 'Basque cheesecake' }, desc: { uk: 'Карамелізована скоринка, ягідний соус', en: 'Caramelised top, berry sauce' }, p: 185, g: '150 г', tags: ['veg', 'gf'], kind: 'slice', c: ['#E9C27A', '#7A3A1E', '#A8283A'], add: ['icecream'] },
  { id: 'd13', cat: 'dessert', name: { uk: 'Печене яблуко з вогню', en: 'Fire-baked apple' }, desc: { uk: 'Мед, кориця, горіхи, крем', en: 'Honey, cinnamon, nuts, cream' }, p: 160, g: '200 г', tags: ['veg', 'gf'], kind: 'plate', c: ['#B8452E', '#E9C27A', '#F2EEE6'], add: ['icecream'] },
  { id: 'd14', cat: 'drinks', name: { uk: 'Домашній лимонад', en: 'House lemonade' }, desc: { uk: 'Лимон, імбир, мʼята', en: 'Lemon, ginger, mint' }, p: 95, g: '400 мл', tags: ['veg', 'gf'], kind: 'glass', c: ['#F1D45A', '#7FB04E', '#F7F3E3'], add: ['syrup'] },
  { id: 'd15', cat: 'drinks', name: { uk: 'Узвар із печених груш', en: 'Roasted pear uzvar' }, desc: { uk: 'Традиційний напій, теплий або холодний', en: 'Traditional drink, warm or cold' }, p: 85, g: '400 мл', tags: ['veg', 'gf'], kind: 'glass', c: ['#B9773A', '#E3B66B', '#F7F3E3'], add: ['lemon'] },
  { id: 'd16', cat: 'drinks', name: { uk: 'Фільтр-кава', en: 'Filter coffee' }, desc: { uk: 'Зерна обсмажені в Києві', en: 'Beans roasted in Kyiv' }, p: 70, g: '250 мл', tags: ['veg', 'gf'], kind: 'glass', c: ['#4A2C1C', '#C79A6B', '#F7F3E3'], add: ['syrup'] },
];

const round2 = (v: number) => Math.round(v * 100) / 100;

export function DishArt({ d, size = 120 }: { d: Dish; size?: number }) {
  const [a, b, c] = d.c;
  const r = rng(d.id.charCodeAt(1) * 97 + d.id.length);
  const dots = Array.from({ length: 9 }, () => [30 + r() * 60, 30 + r() * 60, 2 + r() * 4] as const);
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="mn-art" aria-hidden="true">
      {d.kind === 'board' ? (
        <g><rect x="10" y="22" width="100" height="76" rx="8" fill="#9A6B3E" /><rect x="14" y="26" width="92" height="68" rx="6" fill="#B98552" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={30 + i * 20} cy={48} r={9} fill={i % 2 ? b : a} />)}
          {[0, 1, 2].map((i) => <rect key={i} x={26 + i * 26} y={66} width={18} height={14} fill={b} transform={`rotate(${i * 8 - 8} ${35 + i * 26} 73)`} />)}
          <circle cx="94" cy="76" r="5" fill={c} /></g>
      ) : d.kind === 'glass' ? (
        <g><circle cx="60" cy="60" r="50" fill="#EFE3D0" /><circle cx="60" cy="60" r="34" fill={c} stroke="#D9C9AE" strokeWidth="3" /><circle cx="60" cy="60" r="28" fill={a} />
          <circle cx="50" cy="52" r="6" fill="#fff" opacity="0.35" /><circle cx="70" cy="66" r="4" fill={b} /><rect x="76" y="20" width="4" height="40" rx="2" fill={b} transform="rotate(30 78 40)" /></g>
      ) : d.kind === 'slice' ? (
        <g><circle cx="60" cy="60" r="50" fill="#F4EEE4" stroke="#E2D6C3" strokeWidth="2" /><path d="M60 60 L104 46 A46 46 0 0 1 96 88 Z" fill={a} /><path d="M60 60 L104 46 L101 40 Z" fill={b} />
          <path d="M60 60 L32 36 A36 36 0 0 0 26 72 Z" fill={a} opacity="0.95" /><path d="M32 36 L60 60 L28 32 Z" fill={b} />
          {[0, 1, 2].map((i) => <circle key={i} cx={46 + i * 9} cy={82 - i * 4} r="4" fill={c} />)}</g>
      ) : (
        <g>
          <circle cx="60" cy="60" r="52" fill={d.kind === 'bowl' ? '#E9DCC6' : '#F4EEE4'} stroke="#E2D6C3" strokeWidth="2" />
          <circle cx="60" cy="60" r={d.kind === 'bowl' ? 40 : 36} fill={d.kind === 'bowl' ? '#D7C3A3' : '#EDE4D4'} />
          {d.kind === 'pasta'
            ? Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M${36 + i * 3} ${44 + i * 5} q12 -10 24 0 t24 0`} stroke={a} strokeWidth="5" fill="none" strokeLinecap="round" />)
            : <ellipse cx="60" cy="60" rx={d.kind === 'bowl' ? 32 : 26} ry={d.kind === 'bowl' ? 30 : 20} fill={a} transform="rotate(-18 60 60)" />}
          {d.kind !== 'pasta' && <ellipse cx="54" cy="54" rx="10" ry="6" fill={b} opacity="0.85" transform="rotate(-18 60 60)" />}
          {dots.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={s} fill={i % 3 === 0 ? b : c} opacity="0.9" />)}
        </g>
      )}
    </svg>
  );
}

interface Line { key: string; id: string; add: string[]; q: number }
interface Order { no: number; at: number; lines: Line[]; total: number; mode: 'table' | 'pickup'; pay: 'waiter' | 'card' }
const STAGES = 4, STAGE_MS = 9000;

export default function Menu() {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [cat, setCat] = useState('start');
  const [q, setQ] = useState('');
  const [searchOn, setSearchOn] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState<Dish | null>(null);
  const [cart, setCart] = useStored<Line[]>('demo.menu.cart', []);
  const [sheet, setSheet] = useState<null | 'cart' | 'checkout'>(null);
  const [order, setOrder] = useStored<Order | null>('demo.menu.order', null);
  const [, tick] = useState(0);
  const [statusOpen, setStatusOpen] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!order) return; const i = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(i); }, [order]);

  const list = useMemo(() => DISHES.filter((d) => {
    const qq = q.trim().toLowerCase();
    if (qq && !(L(d.name) + ' ' + L(d.desc)).toLowerCase().includes(qq)) return false;
    return tags.every((t) => d.tags.includes(t));
  }), [q, tags, lang]);

  // all sums are in display currency, built from rounded unit prices
  const linePrice = (l: Line) => { const d = DISHES.find((x) => x.id === l.id)!; return round2((dp(d.p, lang) + l.add.reduce((a, k) => a + dp(ADD[k].p, lang), 0)) * l.q); };
  const sub = round2(cart.reduce((a, l) => a + linePrice(l), 0));
  const service = lang === 'uk' ? Math.round(sub * 0.05) : Math.round(sub * 0.05 * 10) / 10;
  const count = cart.reduce((a, l) => a + l.q, 0);
  const M = (v: number) => fmtD(v, lang);

  const addToCart = (d: Dish, add: string[], qn: number) => {
    const key = d.id + ':' + add.slice().sort().join(',');
    const ex = cart.find((l) => l.key === key);
    setCart(ex ? cart.map((l) => (l.key === key ? { ...l, q: l.q + qn } : l)) : [...cart, { key, id: d.id, add, q: qn }]);
    setOpen(null);
  };
  const setQty = (key: string, n: number) => setCart(n <= 0 ? cart.filter((l) => l.key !== key) : cart.map((l) => (l.key === key ? { ...l, q: n } : l)));

  const jump = (id: string) => {
    setCat(id);
    const el = scroller.current?.querySelector(`[data-cat="${id}"]`) as HTMLElement | null;
    if (el && scroller.current) scroller.current.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
  };
  const onScroll = () => {
    const s = scroller.current; if (!s) return;
    const secs = Array.from(s.querySelectorAll('[data-cat]')) as HTMLElement[];
    const cur = secs.filter((e) => e.offsetTop - 140 <= s.scrollTop).pop();
    if (cur && cur.dataset.cat !== cat) setCat(cur.dataset.cat!);
  };

  const stage = order ? Math.min(STAGES - 1, Math.floor((Date.now() - order.at) / STAGE_MS)) : 0;
  const stageNames = [T('Прийнято', 'Received'), T('Готується', 'Cooking'), T('Майже готово', 'Almost ready'), T('Подано', 'Served')];

  return (
    <div className="mn-wrap">
      <div className="mn-aside">
        <h2>{T('Меню, у якому зручно замовляти однією рукою', 'A menu built for one-handed ordering')}</h2>
        <p>{T('Гість сканує QR-код на столі й одразу бачить меню: фільтри, добавки, кошик і статус замовлення. На телефоні демо відкривається на весь екран.', 'Guests scan the QR code on the table and get the menu instantly: filters, add-ons, cart and order status. On a phone the demo opens full-screen.')}</p>
        <p className="mn-demo"><Icon n="info" s={14} /> {T('Демо: замовлення не надсилається в ресторан, оплата не проводиться.', 'Demo: no order reaches a kitchen, no payment is taken.')}</p>
      </div>
      <div className="mn-phone">
        <div className="mn-screen">
          <div className="mn-scroll" ref={scroller} onScroll={onScroll}>
            <header className="mn-hero">
              <div className="mn-hero-t">
                <span className="mn-table">{T('Стіл', 'Table')} 7</span>
                <button type="button" className="mn-ic" aria-label={T('Пошук', 'Search')} onClick={() => setSearchOn(!searchOn)}><Icon n={searchOn ? 'close' : 'search'} s={18} /></button>
              </div>
              <h1>{T('Полум’я', 'Polumia')}</h1>
              <p>{T('Кухня відкритого вогню · щодня 12:00–23:00', 'Open-fire kitchen · daily 12:00–23:00')}</p>
              {searchOn && <input className="mn-search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Знайти страву…', 'Find a dish…')} />}
            </header>
            <div className="mn-sticky">
              <div className="mn-cats">
                {CATS.map((c) => <button key={c.id} type="button" className={cx(cat === c.id && 'on')} onClick={() => jump(c.id)}>{L(c.n)}</button>)}
              </div>
              <div className="mn-tags">
                {([['veg', T('Вегетаріанське', 'Vegetarian'), 'leaf'], ['spicy', T('Гостре', 'Spicy'), 'flame'], ['gf', T('Без глютену', 'Gluten-free'), 'wheat']] as const).map(([k, l, ic]) => (
                  <button key={k} type="button" aria-pressed={tags.includes(k)} className={cx(tags.includes(k) && 'on')} onClick={() => setTags(tags.includes(k) ? tags.filter((x) => x !== k) : [...tags, k])}><Icon n={ic} s={14} />{l}</button>
                ))}
              </div>
            </div>
            {order && (
              <button type="button" className="mn-track" onClick={() => setStatusOpen(true)}>
                <span>{T('Замовлення', 'Order')} №{order.no}</span><b>{stageNames[stage]}</b>
                <i><i style={{ width: ((stage + 1) / STAGES) * 100 + '%' }} /></i>
              </button>
            )}
            {CATS.map((c) => {
              const items = list.filter((d) => d.cat === c.id);
              if (!items.length) return null;
              return (
                <section key={c.id} data-cat={c.id} className="mn-sec">
                  <h2>{L(c.n)}</h2>
                  {items.map((d) => (
                    <button key={d.id} type="button" className="mn-item" onClick={() => setOpen(d)}>
                      <div className="mn-item-t">
                        <h3>{L(d.name)}</h3>
                        <p>{L(d.desc)}</p>
                        <div className="mn-item-f"><b>{M(d.p)}</b><span>{d.g.replace('г', lang === 'uk' ? 'г' : 'g').replace('мл', lang === 'uk' ? 'мл' : 'ml')}</span>
                          {d.tags.map((t) => <Icon key={t} n={t === 'veg' ? 'leaf' : t === 'spicy' ? 'flame' : 'wheat'} s={13} className={'mn-t-' + t} />)}</div>
                      </div>
                      <DishArt d={d} size={96} />
                      <span className="mn-plus"><Icon n="plus" s={16} /></span>
                    </button>
                  ))}
                </section>
              );
            })}
            {!list.length && <p className="mn-empty">{T('Нічого не знайдено. Спробуйте інший запит або приберіть фільтри.', 'Nothing found. Try another search or clear filters.')}</p>}
            <div style={{ height: 96 }} />
          </div>

          {count > 0 && !sheet && !open && (
            <button type="button" className="mn-cartbar" onClick={() => setSheet('cart')}>
              <span className="mn-cnt">{count}</span><span>{T('Кошик', 'Cart')}</span><b>{M(sub)}</b>
            </button>
          )}

          {open && <DishSheet d={open} onClose={() => setOpen(null)} onAdd={addToCart} />}

          {sheet === 'cart' && (
            <Sheet onClose={() => setSheet(null)} title={T('Ваше замовлення', 'Your order')}>
              {cart.length === 0 ? <p className="mn-empty">{T('Кошик порожній', 'Your cart is empty')}</p> : (
                <>
                  <ul className="mn-lines">
                    {cart.map((l) => {
                      const d = DISHES.find((x) => x.id === l.id)!;
                      return (
                        <li key={l.key}>
                          <DishArt d={d} size={48} />
                          <div><b>{L(d.name)}</b>{l.add.length > 0 && <small>+ {l.add.map((k) => L(ADD[k].n)).join(', ')}</small>}<span>{M(linePrice(l))}</span></div>
                          <div className="mn-qty"><button type="button" aria-label="−" onClick={() => setQty(l.key, l.q - 1)}><Icon n={l.q === 1 ? 'trash' : 'minus'} s={14} /></button><span>{l.q}</span><button type="button" aria-label="+" onClick={() => setQty(l.key, l.q + 1)}><Icon n="plus" s={14} /></button></div>
                        </li>
                      );
                    })}
                  </ul>
                  <dl className="mn-tot"><div><dt>{T('Страви', 'Items')}</dt><dd>{M(sub)}</dd></div><div><dt>{T('Сервіс 5%', 'Service 5%')}</dt><dd>{M(service)}</dd></div><div className="big"><dt>{T('Разом', 'Total')}</dt><dd>{M(sub + service)}</dd></div></dl>
                  <button type="button" className="mn-btn" onClick={() => setSheet('checkout')}>{T('Оформити', 'Checkout')} · {M(sub + service)}</button>
                </>
              )}
            </Sheet>
          )}

          {sheet === 'checkout' && (
            <Checkout total={sub + service} onBack={() => setSheet('cart')} onClose={() => setSheet(null)}
              onPlace={(mode, pay) => { setOrder({ no: 100 + Math.floor(Math.random() * 900), at: Date.now(), lines: cart, total: sub + service, mode, pay }); setCart([]); setSheet(null); setStatusOpen(true); scroller.current?.scrollTo({ top: 0 }); }} />
          )}

          {order && statusOpen && !sheet && !open && <OrderStatus order={order} stage={stage} names={stageNames} onMin={() => setStatusOpen(false)} onNew={() => setOrder(null)} />}
        </div>
      </div>
    </div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const dlg = useDialog(true, onClose);
  return (
    <div className="mn-sheet" role="dialog" aria-modal="true" aria-label={title} ref={dlg} tabIndex={-1}>
      <button type="button" className="mn-scrim" aria-label="close" onClick={onClose} />
      <div className="mn-sheet-in">
        <div className="mn-grab" />
        <div className="mn-sheet-h"><h3>{title}</h3><button type="button" className="mn-ic" onClick={onClose} aria-label="close"><Icon n="close" s={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

function DishSheet({ d, onClose, onAdd }: { d: Dish; onClose: () => void; onAdd: (d: Dish, add: string[], q: number) => void }) {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [add, setAdd] = useState<string[]>([]);
  const [q, setQ] = useState(1);
  const price = round2((dp(d.p, lang) + add.reduce((a, k) => a + dp(ADD[k].p, lang), 0)) * q);
  return (
    <Sheet title={L(d.name)} onClose={onClose}>
      <div className="mn-dish-art"><DishArt d={d} size={200} /></div>
      <p className="mn-dish-d">{L(d.desc)} · {d.g.replace('г', lang === 'uk' ? 'г' : 'g').replace('мл', lang === 'uk' ? 'мл' : 'ml')}</p>
      {d.add && (
        <fieldset className="mn-add">
          <legend>{T('Додати', 'Add extras')}</legend>
          {d.add.map((k) => (
            <label key={k} className={cx(add.includes(k) && 'on')}>
              <input type="checkbox" checked={add.includes(k)} onChange={() => setAdd(add.includes(k) ? add.filter((x) => x !== k) : [...add, k])} />
              <span className="mn-box"><Icon n="check" s={12} /></span>{L(ADD[k].n)}<b>+{money(ADD[k].p, lang)}</b>
            </label>
          ))}
        </fieldset>
      )}
      <div className="mn-dish-f">
        <div className="mn-qty big"><button type="button" aria-label="−" disabled={q <= 1} onClick={() => setQ(q - 1)}><Icon n="minus" s={16} /></button><span>{q}</span><button type="button" aria-label="+" onClick={() => setQ(q + 1)}><Icon n="plus" s={16} /></button></div>
        <button type="button" className="mn-btn" onClick={() => onAdd(d, add, q)}>{T('Додати', 'Add')} · {fmtD(price, lang)}</button>
      </div>
    </Sheet>
  );
}

function Checkout({ total, onBack, onClose, onPlace }: { total: number; onBack: () => void; onClose: () => void; onPlace: (m: 'table' | 'pickup', p: 'waiter' | 'card') => void }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [mode, setMode] = useState<'table' | 'pickup'>('table');
  const [pay, setPay] = useState<'waiter' | 'card'>('waiter');
  return (
    <Sheet title={T('Оформлення', 'Checkout')} onClose={onClose}>
      <div className="mn-opts">
        <span>{T('Як подати', 'Serve')}</span>
        <div className="mn-seg">
          <button type="button" className={cx(mode === 'table' && 'on')} onClick={() => setMode('table')}>{T('До столика №7', 'To table 7')}</button>
          <button type="button" className={cx(mode === 'pickup' && 'on')} onClick={() => setMode('pickup')}>{T('З собою', 'Takeaway')}</button>
        </div>
        <span>{T('Оплата', 'Payment')}</span>
        <div className="mn-seg">
          <button type="button" className={cx(pay === 'waiter' && 'on')} onClick={() => setPay('waiter')}>{T('Офіціанту', 'Pay waiter')}</button>
          <button type="button" className={cx(pay === 'card' && 'on')} onClick={() => setPay('card')}>{T('Карткою онлайн', 'Card online')}</button>
        </div>
        {pay === 'card' && <p className="mn-warn"><Icon n="lock" s={14} /> {T('Демо: справжня оплата не проводиться, дані картки не запитуються.', 'Demo: no real payment is made and no card details are requested.')}</p>}
      </div>
      <div className="mn-dish-f">
        <button type="button" className="mn-btn ghost" onClick={onBack}>{T('Назад', 'Back')}</button>
        <button type="button" className="mn-btn" onClick={() => onPlace(mode, pay)}>{T('Замовити', 'Place order')} · {fmtD(total, lang)}</button>
      </div>
    </Sheet>
  );
}

function OrderStatus({ order, stage, names, onNew, onMin }: { order: Order; stage: number; names: string[]; onNew: () => void; onMin: () => void }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const left = Math.max(0, Math.ceil(((STAGES - 1) * STAGE_MS - (Date.now() - order.at)) / 1000));
  return (
    <div className="mn-status" role="status">
      <div className="mn-status-h"><span>{T('Замовлення', 'Order')} №{order.no}</span><button type="button" className="mn-ic" aria-label="minimise" onClick={onMin}><Icon n="chevD" s={18} /></button></div>
      <h3>{names[stage]}</h3>
      <p>{stage < STAGES - 1 ? `${T('Орієнтовно', 'About')} ${left} ${T('с — у демо час прискорено', 's — time is sped up in the demo')}` : T('Смачного! Офіціант уже біля вас.', 'Enjoy! Your waiter is on the way.')}</p>
      <ol className="mn-steps">{names.map((n, i) => <li key={n} className={cx(i <= stage && 'on')}><i />{n}</li>)}</ol>
      {stage >= STAGES - 1 && <button type="button" className="mn-btn" onClick={onNew}>{T('Нове замовлення', 'New order')}</button>}
    </div>
  );
}
