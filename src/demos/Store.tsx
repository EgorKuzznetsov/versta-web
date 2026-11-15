import React, { useMemo, useState } from 'react';
import { useT, Bi } from '../core/i18n';
import { Icon } from '../components/Icon';
import { DemoNote } from '../components/Chrome';
import { money, cx, dp, fmtD } from '../core/format';
import { useStored, useLockBody, useDialog } from '../core/hooks';

type Shape = 'shirt' | 'dress' | 'trousers' | 'jacket' | 'shorts' | 'top' | 'robe' | 'pillow' | 'towel';
interface Color { id: string; n: Bi; hex: string }
interface Product { id: string; cat: 'women' | 'men' | 'home'; name: Bi; p: number; shape: Shape; colors: string[]; sizes: string[]; out?: string[]; isNew?: boolean; desc: Bi }

const COLORS: Record<string, Color> = {
  milk: { id: 'milk', n: { uk: 'Молочний', en: 'Milk' }, hex: '#EFEAE0' },
  sand: { id: 'sand', n: { uk: 'Пісочний', en: 'Sand' }, hex: '#D4C3A6' },
  olive: { id: 'olive', n: { uk: 'Оливковий', en: 'Olive' }, hex: '#727A5A' },
  clay: { id: 'clay', n: { uk: 'Глина', en: 'Clay' }, hex: '#A9714E' },
  ink: { id: 'ink', n: { uk: 'Чорнильний', en: 'Ink' }, hex: '#2A2C30' },
  sky: { id: 'sky', n: { uk: 'Туман', en: 'Mist' }, hex: '#AEB8BC' },
};
const P: Product[] = [
  { id: 'p1', cat: 'women', name: { uk: 'Сукня-сорочка «Ранок»', en: '“Morning” shirt dress' }, p: 3200, shape: 'dress', colors: ['milk', 'olive', 'clay'], sizes: ['XS', 'S', 'M', 'L'], out: ['XS'], isNew: true, desc: { uk: 'Вільний силует, перламутрові ґудзики, кишені у бокових швах.', en: 'Relaxed fit, mother-of-pearl buttons, side-seam pockets.' } },
  { id: 'p2', cat: 'women', name: { uk: 'Сорочка оверсайз', en: 'Oversized shirt' }, p: 2400, shape: 'shirt', colors: ['milk', 'sand', 'sky'], sizes: ['XS', 'S', 'M', 'L', 'XL'], desc: { uk: 'Подовжена спинка, опущене плече, мʼякий комір.', en: 'Longer back, dropped shoulder, soft collar.' } },
  { id: 'p3', cat: 'women', name: { uk: 'Штани палаццо', en: 'Palazzo trousers' }, p: 2600, shape: 'trousers', colors: ['sand', 'ink', 'olive'], sizes: ['XS', 'S', 'M', 'L'], out: ['L'], desc: { uk: 'Висока посадка, широка штанина, еластичний пояс ззаду.', en: 'High rise, wide leg, elastic back waistband.' } },
  { id: 'p4', cat: 'women', name: { uk: 'Топ на бретелях', en: 'Strappy top' }, p: 1400, shape: 'top', colors: ['milk', 'clay', 'ink'], sizes: ['XS', 'S', 'M', 'L'], isNew: true, desc: { uk: 'Регульовані бретелі, подвійний шар льону.', en: 'Adjustable straps, double-layered linen.' } },
  { id: 'p5', cat: 'men', name: { uk: 'Сорочка з коміром-стійкою', en: 'Band-collar shirt' }, p: 2500, shape: 'shirt', colors: ['milk', 'sky', 'olive', 'ink'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], desc: { uk: 'Класичний крій, комір-стійка, прямий низ.', en: 'Classic cut, band collar, straight hem.' } },
  { id: 'p6', cat: 'men', name: { uk: 'Жакет без підкладки', en: 'Unlined jacket' }, p: 4600, shape: 'jacket', colors: ['sand', 'ink'], sizes: ['M', 'L', 'XL'], isNew: true, desc: { uk: 'Мʼякі плечі, накладні кишені, легкий для літа.', en: 'Soft shoulders, patch pockets, light enough for summer.' } },
  { id: 'p7', cat: 'men', name: { uk: 'Шорти на зав’язках', en: 'Drawstring shorts' }, p: 1600, shape: 'shorts', colors: ['sand', 'olive', 'ink'], sizes: ['S', 'M', 'L', 'XL'], out: ['S'], desc: { uk: 'Довжина до коліна, глибокі кишені.', en: 'Knee length, deep pockets.' } },
  { id: 'p8', cat: 'men', name: { uk: 'Штани прямого крою', en: 'Straight-leg trousers' }, p: 2700, shape: 'trousers', colors: ['sand', 'ink', 'sky'], sizes: ['S', 'M', 'L', 'XL'], desc: { uk: 'Середня посадка, стрілки, замок на ґудзику.', en: 'Mid rise, pressed crease, button fly.' } },
  { id: 'p9', cat: 'home', name: { uk: 'Халат унісекс', en: 'Unisex robe' }, p: 3400, shape: 'robe', colors: ['milk', 'sand', 'sky'], sizes: ['S/M', 'L/XL'], desc: { uk: 'Пралений льон, пояс і дві кишені.', en: 'Washed linen, belt and two pockets.' } },
  { id: 'p10', cat: 'home', name: { uk: 'Наволочки, 2 шт.', en: 'Pillowcases, set of 2' }, p: 1200, shape: 'pillow', colors: ['milk', 'sand', 'olive', 'clay', 'sky'], sizes: ['50×70', '70×70'], desc: { uk: 'Конверт без ґудзиків, щільність 165 г/м².', en: 'Envelope closure, 165 g/m² weight.' } },
  { id: 'p11', cat: 'home', name: { uk: 'Рушник вафельний', en: 'Waffle towel' }, p: 800, shape: 'towel', colors: ['milk', 'clay', 'olive'], sizes: ['50×90', '70×140'], desc: { uk: 'Швидко сохне, стає мʼякшим після кожного прання.', en: 'Dries fast and softens with every wash.' } },
];
const PROMOS: Record<string, { kind: 'pct' | 'ship'; v: number; min?: number; d: Bi }> = {
  LEN10: { kind: 'pct', v: 10, d: { uk: '−10% на все', en: '−10% on everything' } },
  WELCOME15: { kind: 'pct', v: 15, min: 5000, d: { uk: '−15% від 5 000 грн', en: '−15% over €110' } },
  FREESHIP: { kind: 'ship', v: 0, d: { uk: 'Безкоштовна доставка', en: 'Free shipping' } },
};
const SHIP = { np: 90, courier: 150, free: 4000 };

export function Garment({ shape, hex, bg = '#E6E0D6', view = 0 }: { shape: Shape; hex: string; bg?: string; view?: number }) {
  const dark = shade(hex, -0.18);
  const paths: Record<Shape, string> = {
    shirt: 'M70 40 L100 28 Q110 38 120 28 L150 40 L170 80 L152 88 L150 70 L150 170 L70 170 L70 70 L68 88 L50 80 Z',
    dress: 'M84 34 L100 28 Q110 38 120 28 L136 34 L142 70 L162 176 L58 176 L78 70 Z',
    trousers: 'M76 34 L144 34 L150 176 L118 176 L110 84 L102 176 L70 176 Z',
    jacket: 'M70 38 L96 28 L110 60 L124 28 L150 38 L172 84 L154 92 L152 74 L152 172 L68 172 L68 74 L66 92 L48 84 Z',
    shorts: 'M74 60 L146 60 L154 136 L118 140 L110 96 L102 140 L66 136 Z',
    top: 'M86 44 L92 28 M134 44 L128 28 M84 44 Q110 54 136 44 L140 150 L80 150 Z',
    robe: 'M66 36 L96 28 L110 90 L124 28 L154 36 L176 96 L156 102 L152 82 L156 178 L64 178 L68 82 L64 102 L44 96 Z',
    pillow: 'M44 64 Q110 54 176 64 Q182 110 176 156 Q110 166 44 156 Q38 110 44 64 Z',
    towel: 'M66 40 L154 40 L154 176 L66 176 Z',
  };
  if (view === 1) {
    // fabric close-up
    return (
      <svg viewBox="0 0 220 220" className="st-g" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <rect width="220" height="220" fill={hex} />
        {Array.from({ length: 44 }).map((_, i) => <line key={'h' + i} x1="0" x2="220" y1={i * 5} y2={i * 5 + 2} stroke={dark} strokeOpacity="0.25" />)}
        {Array.from({ length: 44 }).map((_, i) => <line key={'v' + i} y1="0" y2="220" x1={i * 5} x2={i * 5 + 1} stroke="#fff" strokeOpacity="0.12" />)}
        <path d="M0 150 Q60 120 120 160 T220 140 L220 220 L0 220Z" fill={dark} opacity="0.25" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 220" className="st-g" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="220" height="220" fill={view === 2 ? shade(bg, -0.12) : bg} />
      {view === 2 && <rect x="0" y="170" width="220" height="50" fill={shade(bg, -0.2)} />}
      <g transform={view === 2 ? 'translate(18 6) scale(.84)' : ''}>
        <path d={paths[shape]} fill={hex} stroke={dark} strokeWidth="1.2" strokeLinejoin="round" />
        {(shape === 'shirt' || shape === 'dress') && <path d="M110 40 L110 160" stroke={dark} strokeWidth="1" strokeDasharray="1 9" />}
        {shape === 'towel' && Array.from({ length: 12 }).map((_, i) => <line key={i} x1="66" x2="154" y1={52 + i * 10} y2={52 + i * 10} stroke={dark} strokeOpacity="0.3" />)}
        {shape === 'pillow' && <path d="M60 110 L160 110" stroke={dark} strokeOpacity="0.3" />}
      </g>
    </svg>
  );
}
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (k < 0 ? c * k : (255 - c) * k))));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

interface Line { key: string; id: string; color: string; size: string; q: number }

export default function Store() {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [view, setView] = useState<{ k: 'list' } | { k: 'product'; id: string } | { k: 'fav' } | { k: 'checkout' }>({ k: 'list' });
  const [cat, setCat] = useState<'all' | Product['cat']>('all');
  const [colorF, setColorF] = useState<string[]>([]);
  const [sizeF, setSizeF] = useState<string>('');
  const [maxP, setMaxP] = useState(5000);
  const [sort, setSort] = useState<'new' | 'asc' | 'desc'>('new');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fav, setFav] = useStored<string[]>('demo.store.fav', []);
  const [cart, setCart] = useStored<Line[]>('demo.store.cart', []);
  const [promo, setPromo] = useStored<string>('demo.store.promo', '');
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  useLockBody(cartOpen || filtersOpen);
  const filtRef = useDialog(filtersOpen, () => setFiltersOpen(false));
  const M = (v: number) => money(v, lang, { decimals: false });

  const list = useMemo(() => {
    let l = P.filter((p) => (cat === 'all' || p.cat === cat) && p.p <= maxP && (!colorF.length || p.colors.some((c) => colorF.includes(c))) && (!sizeF || p.sizes.includes(sizeF)));
    if (sort === 'asc') l = l.slice().sort((a, b) => a.p - b.p);
    if (sort === 'desc') l = l.slice().sort((a, b) => b.p - a.p);
    if (sort === 'new') l = l.slice().sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return l;
  }, [cat, colorF, sizeF, maxP, sort]);

  const toggleFav = (id: string) => setFav(fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id]);
  const add = (p: Product, color: string, size: string) => {
    const key = `${p.id}-${color}-${size}`;
    setCart(cart.some((l) => l.key === key) ? cart.map((l) => (l.key === key ? { ...l, q: l.q + 1 } : l)) : [...cart, { key, id: p.id, color, size, q: 1 }]);
    setToast(T('Додано в кошик', 'Added to bag')); setTimeout(() => setToast(''), 1600);
  };
  const totals = (shipMode: 'np' | 'courier' = 'np') => {
    // display-currency sums from rounded unit prices, so totals match line items
    const cv = (uah: number) => dp(uah, lang, true);
    const sub = cart.reduce((a, l) => a + cv(P.find((p) => p.id === l.id)!.p) * l.q, 0);
    const pr = PROMOS[promo];
    const valid = pr && (!pr.min || sub >= cv(pr.min));
    const disc = valid && pr.kind === 'pct' ? Math.round((sub * pr.v) / 100) : 0;
    const ship = sub === 0 ? 0 : (valid && pr.kind === 'ship') || sub - disc >= cv(SHIP.free) ? 0 : cv(SHIP[shipMode]);
    return { sub, disc, ship, total: sub - disc + ship, valid: !!valid, pr };
  };
  const count = cart.reduce((a, l) => a + l.q, 0);
  const allSizes = Array.from(new Set(P.flatMap((p) => p.sizes))).filter((s) => !s.includes('×'));

  const Filters = (
    <div className="st-filters">
      <div className="st-f"><span>{T('Колір', 'Colour')}</span>
        <div className="st-sw">{Object.values(COLORS).map((c) => (
          <button key={c.id} type="button" aria-pressed={colorF.includes(c.id)} title={L(c.n)} className={cx(colorF.includes(c.id) && 'on')} style={{ background: c.hex }} onClick={() => setColorF(colorF.includes(c.id) ? colorF.filter((x) => x !== c.id) : [...colorF, c.id])}><span className="sr">{L(c.n)}</span></button>
        ))}</div>
      </div>
      <div className="st-f"><span>{T('Розмір', 'Size')}</span>
        <div className="st-sizes">{allSizes.map((s) => <button key={s} type="button" className={cx(sizeF === s && 'on')} onClick={() => setSizeF(sizeF === s ? '' : s)}>{s}</button>)}</div>
      </div>
      <div className="st-f"><span>{T('Ціна до', 'Price up to')} <b>{M(maxP)}</b></span>
        <input type="range" min={800} max={5000} step={100} value={maxP} onChange={(e) => setMaxP(+e.target.value)} style={{ ['--v' as any]: ((maxP - 800) / 4200) * 100 + '%' }} aria-label={T('Ціна до', 'Price up to')} />
      </div>
      <button type="button" className="st-link" onClick={() => { setColorF([]); setSizeF(''); setMaxP(5000); }}>{T('Скинути фільтри', 'Clear filters')}</button>
    </div>
  );

  return (
    <div className="st">
      <header className="st-top">
        <button type="button" className="st-logo" onClick={() => setView({ k: 'list' })}>{T('ЛЬОН', 'LON')}</button>
        <nav className="st-cats">
          {([['all', T('Усе', 'All')], ['women', T('Жінкам', 'Women')], ['men', T('Чоловікам', 'Men')], ['home', T('Дім', 'Home')]] as const).map(([k, l]) => (
            <button key={k} type="button" className={cx(cat === k && view.k === 'list' && 'on')} onClick={() => { setCat(k); setView({ k: 'list' }); }}>{l}</button>
          ))}
        </nav>
        <div className="st-icons">
          <button type="button" aria-label={T('Обране', 'Favourites')} onClick={() => setView({ k: 'fav' })}><Icon n="heart" s={20} />{fav.length > 0 && <em>{fav.length}</em>}</button>
          <button type="button" aria-label={T('Кошик', 'Bag')} onClick={() => setCartOpen(true)}><Icon n="bag" s={20} />{count > 0 && <em>{count}</em>}</button>
        </div>
      </header>

      {view.k === 'list' && (
        <div className="st-list">
          <div className="st-hero">
            <h1>{T('Льон, який живе довше за сезон', 'Linen that outlives the season')}</h1>
            <p>{T('Шиємо невеликими партіями з європейського льону. Демо-магазин: товари, ціни й наявність вигадані.', 'Made in small batches from European linen. Demo store: products, prices and stock are fictional.')}</p>
          </div>
          <div className="st-bar">
            <span>{list.length} {T('товарів', 'items')}</span>
            <button type="button" className="st-fbtn" onClick={() => setFiltersOpen(true)}><Icon n="filter" s={16} /> {T('Фільтри', 'Filters')}{(colorF.length || sizeF || maxP < 5000) ? ' •' : ''}</button>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label={T('Сортування', 'Sort')}>
              <option value="new">{T('Спершу новинки', 'New in first')}</option><option value="asc">{T('Дешевші', 'Price: low to high')}</option><option value="desc">{T('Дорожчі', 'Price: high to low')}</option>
            </select>
          </div>
          <div className="st-layout">
            <aside className="st-side">{Filters}</aside>
            <div className="st-grid">
              {list.map((p) => <Card key={p.id} p={p} fav={fav.includes(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => setView({ k: 'product', id: p.id })} />)}
              {!list.length && <p className="st-empty">{T('Під ці фільтри нічого немає.', 'Nothing matches these filters.')}</p>}
            </div>
          </div>
        </div>
      )}

      {view.k === 'fav' && (
        <div className="st-list">
          <div className="st-hero"><h1>{T('Обране', 'Favourites')}</h1></div>
          <div className="st-grid wide">
            {fav.length === 0 && <p className="st-empty">{T('Натисніть ♡ на товарі, щоб зберегти його тут.', 'Tap ♡ on a product to save it here.')}</p>}
            {P.filter((p) => fav.includes(p.id)).map((p) => <Card key={p.id} p={p} fav onFav={() => toggleFav(p.id)} onOpen={() => setView({ k: 'product', id: p.id })} />)}
          </div>
        </div>
      )}

      {view.k === 'product' && <ProductPage p={P.find((x) => x.id === view.id)!} fav={fav.includes(view.id)} onFav={() => toggleFav(view.id)} onAdd={add} onBack={() => setView({ k: 'list' })} />}

      {view.k === 'checkout' && <Checkout cart={cart} totals={totals} onDone={() => { setCart([]); setPromo(''); }} onBack={() => { setView({ k: 'list' }); setCartOpen(true); }} onHome={() => setView({ k: 'list' })} />}

      {filtersOpen && (
        <div className="st-sheet" role="dialog" aria-modal="true" ref={filtRef} tabIndex={-1} aria-label={T('Фільтри', 'Filters')}>
          <button type="button" className="st-scrim" aria-label="close" onClick={() => setFiltersOpen(false)} />
          <div className="st-sheet-in"><div className="st-sheet-h"><b>{T('Фільтри', 'Filters')}</b><button type="button" onClick={() => setFiltersOpen(false)} aria-label="close"><Icon n="close" /></button></div>{Filters}
            <button type="button" className="st-btn" onClick={() => setFiltersOpen(false)}>{T('Показати', 'Show')} {list.length}</button></div>
        </div>
      )}

      {cartOpen && (
        <CartDrawer cart={cart} setCart={setCart} promo={promo} setPromo={setPromo} totals={totals()} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setView({ k: 'checkout' }); }} />
      )}
      {toast && <div className="st-toast" role="status">{toast}</div>}
      <DemoNote className="st-note" />
    </div>
  );
}

function Card({ p, fav, onFav, onOpen }: { p: Product; fav: boolean; onFav: () => void; onOpen: () => void }) {
  const { lang, L } = useT();
  const [c, setC] = useState(p.colors[0]);
  return (
    <article className="st-card">
      <button type="button" className="st-card-img" onClick={onOpen} aria-label={L(p.name)}>
        <Garment shape={p.shape} hex={COLORS[c].hex} />
        {p.isNew && <span className="st-new">{lang === 'uk' ? 'Новинка' : 'New'}</span>}
      </button>
      <button type="button" className={cx('st-heart', fav && 'on')} aria-pressed={fav} aria-label="♡" onClick={onFav}><Icon n="heart" s={18} /></button>
      <div className="st-card-b">
        <button type="button" onClick={onOpen} className="st-card-n">{L(p.name)}</button>
        <span>{money(p.p, lang, { decimals: false })}</span>
      </div>
      <div className="st-dots">{p.colors.map((k) => <button key={k} type="button" aria-label={L(COLORS[k].n)} className={cx(c === k && 'on')} style={{ background: COLORS[k].hex }} onClick={() => setC(k)} />)}</div>
    </article>
  );
}

function ProductPage({ p, fav, onFav, onAdd, onBack }: { p: Product; fav: boolean; onFav: () => void; onAdd: (p: Product, c: string, s: string) => void; onBack: () => void }) {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [c, setC] = useState(p.colors[0]);
  const [s, setS] = useState('');
  const [img, setImg] = useState(0);
  const [warn, setWarn] = useState(false);
  return (
    <div className="st-pp">
      <button type="button" className="st-back" onClick={onBack}><Icon n="arrowL" s={16} /> {T('До каталогу', 'Back to catalogue')}</button>
      <div className="st-pp-g">
        <div className="st-gal">
          <div className="st-gal-main" key={c + img}><Garment shape={p.shape} hex={COLORS[c].hex} view={img} /></div>
          <div className="st-gal-th">{[0, 1, 2].map((i) => <button key={i} type="button" className={cx(img === i && 'on')} onClick={() => setImg(i)} aria-label={`${i + 1}`}><Garment shape={p.shape} hex={COLORS[c].hex} view={i} /></button>)}</div>
        </div>
        <div className="st-pp-i">
          {p.isNew && <span className="st-new inline">{T('Новинка', 'New')}</span>}
          <h1>{L(p.name)}</h1>
          <p className="st-price">{money(p.p, lang, { decimals: false })}</p>
          <p>{L(p.desc)}</p>
          <div className="st-opt"><span>{T('Колір', 'Colour')}: <b>{L(COLORS[c].n)}</b></span>
            <div className="st-sw big">{p.colors.map((k) => <button key={k} type="button" aria-pressed={c === k} className={cx(c === k && 'on')} style={{ background: COLORS[k].hex }} onClick={() => setC(k)}><span className="sr">{L(COLORS[k].n)}</span></button>)}</div>
          </div>
          <div className="st-opt"><span>{T('Розмір', 'Size')}</span>
            <div className={cx('st-sizes big', warn && 'warn')}>{p.sizes.map((z) => {
              const out = p.out?.includes(z);
              return <button key={z} type="button" disabled={out} className={cx(s === z && 'on')} onClick={() => { setS(z); setWarn(false); }}>{z}{out && <small>{T('немає', 'sold out')}</small>}</button>;
            })}</div>
            {warn && <small className="st-warn">{T('Оберіть розмір', 'Choose a size')}</small>}
          </div>
          <div className="st-pp-act">
            <button type="button" className="st-btn" onClick={() => (s ? onAdd(p, c, s) : setWarn(true))}>{T('Додати в кошик', 'Add to bag')}</button>
            <button type="button" className={cx('st-btn ghost sq', fav && 'on')} aria-pressed={fav} onClick={onFav} aria-label="♡"><Icon n="heart" s={20} /></button>
          </div>
          <details className="st-acc" open><summary>{T('Склад і догляд', 'Composition & care')}</summary><p>{T('100% льон. Прання при 30°, не відбілювати, сушити розправленим.', '100% linen. Wash at 30°, no bleach, dry flat.')}</p></details>
          <details className="st-acc"><summary>{T('Доставка й повернення', 'Delivery & returns')}</summary><p>{T(`Нова пошта - ${money(SHIP.np, 'uk')}, курʼєр - ${money(SHIP.courier, 'uk')}. Безкоштовно від ${money(SHIP.free, 'uk')}. Повернення протягом 14 днів.`, `Post office - ${money(SHIP.np, 'en')}, courier - ${money(SHIP.courier, 'en')}. Free over ${money(SHIP.free, 'en', { decimals: false })}. Returns within 14 days.`)}</p></details>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, setCart, promo, setPromo, totals, onClose, onCheckout }: { cart: Line[]; setCart: (l: Line[]) => void; promo: string; setPromo: (s: string) => void; totals: ReturnType<any>; onClose: () => void; onCheckout: () => void }) {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [code, setCode] = useState(promo);
  const [msg, setMsg] = useState('');
  const M = (v: number) => money(v, lang, { decimals: false });
  const apply = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setPromo(''); setMsg(''); return; }
    if (!PROMOS[c]) { setMsg(T('Такого коду немає', 'Unknown code')); return; }
    setPromo(c); setMsg('');
  };
  const t = totals;
  const dlg = useDialog(true, onClose);
  const D = (v: number) => fmtD(v, lang, true);
  return (
    <div className="st-drawer" role="dialog" aria-modal="true" aria-label={T('Кошик', 'Bag')} ref={dlg} tabIndex={-1}>
      <button type="button" className="st-scrim" aria-label="close" onClick={onClose} />
      <div className="st-drawer-in">
        <div className="st-sheet-h"><b>{T('Кошик', 'Bag')}</b><button type="button" onClick={onClose} aria-label="close"><Icon n="close" /></button></div>
        {cart.length === 0 ? <p className="st-empty">{T('Кошик порожній', 'Your bag is empty')}</p> : (
          <>
            <ul className="st-lines">
              {cart.map((l) => {
                const p = P.find((x) => x.id === l.id)!;
                return (
                  <li key={l.key}>
                    <div className="st-line-img"><Garment shape={p.shape} hex={COLORS[l.color].hex} /></div>
                    <div className="st-line-i"><b>{L(p.name)}</b><small>{L(COLORS[l.color].n)} · {l.size}</small>
                      <div className="st-qty"><button type="button" aria-label="−" onClick={() => setCart(l.q === 1 ? cart.filter((x) => x.key !== l.key) : cart.map((x) => (x.key === l.key ? { ...x, q: x.q - 1 } : x)))}><Icon n={l.q === 1 ? 'trash' : 'minus'} s={14} /></button><span>{l.q}</span><button type="button" aria-label="+" onClick={() => setCart(cart.map((x) => (x.key === l.key ? { ...x, q: x.q + 1 } : x)))}><Icon n="plus" s={14} /></button></div>
                    </div>
                    <span className="st-line-p">{fmtD(dp(p.p, lang, true) * l.q, lang, true)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="st-promo">
              <form onSubmit={(e) => { e.preventDefault(); apply(); }}><input value={code} onChange={(e) => setCode(e.target.value)} placeholder={T('Промокод', 'Promo code')} aria-label={T('Промокод', 'Promo code')} /><button type="submit">{T('Застосувати', 'Apply')}</button></form>
              {msg && <small className="st-warn">{msg}</small>}
              {promo && t.pr && <small className={t.valid ? 'st-ok' : 'st-warn'}>{promo}: {L(t.pr.d)}{!t.valid && ' - ' + T('умова не виконана', 'condition not met')}</small>}
              <small className="st-hint">{T('Демо-коди', 'Demo codes')}: LEN10 · WELCOME15 · FREESHIP</small>
            </div>
            <dl className="st-tot">
              <div><dt>{T('Товари', 'Subtotal')}</dt><dd>{D(t.sub)}</dd></div>
              {t.disc > 0 && <div><dt>{T('Знижка', 'Discount')}</dt><dd>−{D(t.disc)}</dd></div>}
              <div><dt>{T('Доставка', 'Shipping')}</dt><dd>{t.ship ? D(t.ship) : T('безкоштовно', 'free')}</dd></div>
              <div className="big"><dt>{T('Разом', 'Total')}</dt><dd>{D(t.total)}</dd></div>
            </dl>
            {t.ship > 0 && <p className="st-hint">{T('До безкоштовної доставки', 'Free shipping in')}: {D(dp(SHIP.free, lang, true) - (t.sub - t.disc))}</p>}
            <button type="button" className="st-btn" onClick={onCheckout}>{T('Оформити замовлення', 'Checkout')}</button>
          </>
        )}
      </div>
    </div>
  );
}

function Checkout({ cart, totals, onDone, onBack, onHome }: { cart: Line[]; totals: (m: 'np' | 'courier') => any; onDone: () => void; onBack: () => void; onHome: () => void }) {
  const { lang } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: '', phone: '', email: '', ship: 'np' as 'np' | 'courier', city: '', addr: '', pay: 'cod' as 'cod' | 'card' });
  const [err, setErr] = useState<string[]>([]);
  const [no, setNo] = useState<number | null>(null);
  const [snap, setSnap] = useState<any>(null);
  const t = snap || totals(f.ship);
  const D = (v: number) => fmtD(v, lang, true);
  const M = (v: number) => money(v, lang, { decimals: false });
  const req = [['name', 'phone'], ['city', 'addr'], []][step] || [];
  const next = () => {
    const e = req.filter((k) => !(f as any)[k].trim());
    setErr(e); if (e.length) return;
    if (step === 2) { setSnap(totals(f.ship)); setNo(10000 + Math.floor(Math.random() * 89999)); onDone(); setStep(3); return; }
    setStep(step + 1);
  };
  if (!cart.length && step < 3) return <div className="st-pp"><p className="st-empty">{T('Кошик порожній', 'Your bag is empty')}</p><button type="button" className="st-btn" onClick={onHome}>{T('До каталогу', 'To catalogue')}</button></div>;
  const I = (k: keyof typeof f, label: string, extra: any = {}) => (
    <label className={cx('st-in', err.includes(k) && 'err')}><span>{label}</span><input value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...extra} /></label>
  );
  return (
    <div className="st-co">
      <ol className="st-co-steps">{[T('Контакти', 'Contact'), T('Доставка', 'Delivery'), T('Оплата', 'Payment'), T('Готово', 'Done')].map((s, i) => <li key={s} className={cx(i === step && 'on', i < step && 'done')}><span>{i + 1}</span>{s}</li>)}</ol>
      <div className="st-co-g">
        <div className="st-co-f">
          {step === 0 && (<>{I('name', T('Імʼя та прізвище *', 'Full name *'))}{I('phone', T('Телефон *', 'Phone *'), { inputMode: 'tel' })}{I('email', 'Email', { type: 'email' })}</>)}
          {step === 1 && (
            <>
              <div className="st-radio">
                {(['np', 'courier'] as const).map((k) => <label key={k} className={cx(f.ship === k && 'on')}><input type="radio" checked={f.ship === k} onChange={() => setF({ ...f, ship: k })} /><Icon n="truck" s={18} /><span>{k === 'np' ? T('У відділення пошти', 'To a post office') : T('Курʼєром додому', 'Courier to your door')}</span><b>{M(SHIP[k])}</b></label>)}
              </div>
              {I('city', T('Місто *', 'City *'))}{I('addr', f.ship === 'np' ? T('Відділення *', 'Branch *') : T('Адреса *', 'Address *'))}
            </>
          )}
          {step === 2 && (
            <>
              <div className="st-radio">
                <label className={cx(f.pay === 'cod' && 'on')}><input type="radio" checked={f.pay === 'cod'} onChange={() => setF({ ...f, pay: 'cod' })} /><span>{T('Оплата при отриманні', 'Pay on delivery')}</span></label>
                <label className={cx(f.pay === 'card' && 'on')}><input type="radio" checked={f.pay === 'card'} onChange={() => setF({ ...f, pay: 'card' })} /><span>{T('Карткою онлайн', 'Card online')}</span></label>
              </div>
              <p className="st-demo"><Icon n="lock" s={14} /> {T('Це демо: оплата не проводиться, дані картки не запитуються, замовлення нікуди не надсилається.', 'This is a demo: no payment is taken, no card details are requested and no order is sent.')}</p>
            </>
          )}
          {step === 3 && (
            <div className="st-done">
              <Icon n="check" s={36} />
              <h2>{T('Дякуємо! Демо-замовлення оформлено', 'Thank you! Demo order placed')}</h2>
              <p>№ {no} · {D(t.total)}</p>
              <p className="st-hint">{T('У реальному магазині тут буде лист-підтвердження та номер ТТН.', 'In a real store this is where the confirmation email and tracking number go.')}</p>
              <button type="button" className="st-btn" onClick={onHome}>{T('Продовжити покупки', 'Continue shopping')}</button>
            </div>
          )}
          {step < 3 && (
            <div className="st-co-act">
              <button type="button" className="st-btn ghost" onClick={() => (step === 0 ? onBack() : setStep(step - 1))}>{T('Назад', 'Back')}</button>
              <button type="button" className="st-btn" onClick={next}>{step === 2 ? T('Підтвердити замовлення', 'Place order') : T('Далі', 'Continue')}</button>
            </div>
          )}
        </div>
        {step < 3 && (
          <aside className="st-co-sum">
            <b>{T('Ваше замовлення', 'Your order')}</b>
            <dl className="st-tot">
              <div><dt>{T('Товари', 'Subtotal')} ({cart.reduce((a, l) => a + l.q, 0)})</dt><dd>{D(t.sub)}</dd></div>
              {t.disc > 0 && <div><dt>{T('Знижка', 'Discount')}</dt><dd>−{D(t.disc)}</dd></div>}
              <div><dt>{T('Доставка', 'Shipping')}</dt><dd>{t.ship ? D(t.ship) : T('безкоштовно', 'free')}</dd></div>
              <div className="big"><dt>{T('Разом', 'Total')}</dt><dd>{D(t.total)}</dd></div>
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
}
