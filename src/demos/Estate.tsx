import React, { useMemo, useRef, useState } from 'react';
import { useT, Bi } from '../core/i18n';
import { Icon } from '../components/Icon';
import { DemoNote } from '../components/Chrome';
import { num, iso, dateFmt, cx } from '../core/format';
import { useStored, useLockBody, useDialog } from '../core/hooks';

interface Flat { id: string; complex: Bi; district: Bi; rooms: number; area: number; floor: number; floors: number; year: number; usd: number; type: 'new' | 'resale'; feat: Bi<string[]>; facade: [string, string]; plan: number }

const D = (uk: string, en: string): Bi => ({ uk, en });
const FLATS: Flat[] = [
  { id: 'k1', complex: D('Липки Парк', 'Lypky Park'), district: D('Печерськ', 'Pechersk'), rooms: 2, area: 64, floor: 7, floors: 16, year: 2023, usd: 142000, type: 'new', feat: { uk: ['Тераса', 'Підземний паркінг'], en: ['Terrace', 'Underground parking'] }, facade: ['#C9B9A3', '#8C7A64'], plan: 2 },
  { id: 'k2', complex: D('Річковий', 'Richkovyi'), district: D('Оболонь', 'Obolon'), rooms: 1, area: 41, floor: 12, floors: 24, year: 2022, usd: 68000, type: 'new', feat: { uk: ['Вид на Дніпро', 'Укриття'], en: ['River view', 'Shelter'] }, facade: ['#B8C3C9', '#6E7E88'], plan: 1 },
  { id: 'k3', complex: D('Старий Поділ', 'Staryi Podil'), district: D('Поділ', 'Podil'), rooms: 3, area: 92, floor: 3, floors: 5, year: 1912, usd: 185000, type: 'resale', feat: { uk: ['Високі стелі', 'Історичний будинок'], en: ['High ceilings', 'Historic building'] }, facade: ['#D8C2A4', '#A6866A'], plan: 3 },
  { id: 'k4', complex: D('Голосіїв Сад', 'Holosiiv Sad'), district: D('Голосіїв', 'Holosiiv'), rooms: 2, area: 58, floor: 5, floors: 10, year: 2021, usd: 89000, type: 'new', feat: { uk: ['Біля парку', 'Комора'], en: ['Next to park', 'Storage room'] }, facade: ['#C3CBB8', '#7D8A6A'], plan: 2 },
  { id: 'k5', complex: D('Лівий Берег', 'Livyi Bereh'), district: D('Дарниця', 'Darnytsia'), rooms: 1, area: 36, floor: 9, floors: 18, year: 2019, usd: 48000, type: 'resale', feat: { uk: ['Метро 5 хв', 'Ремонт'], en: ['Metro 5 min', 'Renovated'] }, facade: ['#D1CCC4', '#8E877C'], plan: 1 },
  { id: 'k6', complex: D('Арсенал Хаус', 'Arsenal House'), district: D('Печерськ', 'Pechersk'), rooms: 4, area: 138, floor: 11, floors: 14, year: 2024, usd: 320000, type: 'new', feat: { uk: ['Дві ванні', 'Панорамні вікна'], en: ['Two bathrooms', 'Floor-to-ceiling windows'] }, facade: ['#BFC4C6', '#5F676C'], plan: 4 },
  { id: 'k7', complex: D('Сирець Сіті', 'Syrets City'), district: D('Шевченківський', 'Shevchenkivskyi'), rooms: 2, area: 67, floor: 14, floors: 25, year: 2020, usd: 98000, type: 'resale', feat: { uk: ['Гардеробна', 'Консʼєрж'], en: ['Walk-in closet', 'Concierge'] }, facade: ['#C7BDB0', '#857563'], plan: 2 },
  { id: 'k8', complex: D('Оболонь Резиденс', 'Obolon Residence'), district: D('Оболонь', 'Obolon'), rooms: 3, area: 84, floor: 6, floors: 12, year: 2024, usd: 129000, type: 'new', feat: { uk: ['Два балкони', 'Дитячий майданчик'], en: ['Two balconies', 'Playground'] }, facade: ['#B5BFB8', '#6B7A70'], plan: 3 },
  { id: 'k9', complex: D('Позняки Плаза', 'Pozniaky Plaza'), district: D('Дарниця', 'Darnytsia'), rooms: 3, area: 78, floor: 17, floors: 25, year: 2018, usd: 87000, type: 'resale', feat: { uk: ['Кухня-вітальня', 'Паркінг'], en: ['Open-plan kitchen', 'Parking'] }, facade: ['#CFC6BA', '#918470'], plan: 3 },
  { id: 'k10', complex: D('Тиха Гавань', 'Tykha Havan'), district: D('Голосіїв', 'Holosiiv'), rooms: 1, area: 44, floor: 2, floors: 9, year: 2023, usd: 61000, type: 'new', feat: { uk: ['Власний дворик', 'Укриття'], en: ['Private patio', 'Shelter'] }, facade: ['#D3C9B5', '#9A8A6C'], plan: 1 },
  { id: 'k11', complex: D('Липки Парк', 'Lypky Park'), district: D('Печерськ', 'Pechersk'), rooms: 3, area: 104, floor: 13, floors: 16, year: 2023, usd: 238000, type: 'new', feat: { uk: ['Тераса', 'Майстер-спальня'], en: ['Terrace', 'Master suite'] }, facade: ['#C9B9A3', '#8C7A64'], plan: 3 },
  { id: 'k12', complex: D('Подільські Ворота', 'Podilski Vorota'), district: D('Поділ', 'Podil'), rooms: 2, area: 71, floor: 8, floors: 20, year: 2022, usd: 118000, type: 'new', feat: { uk: ['Вид на Лавру', 'Смарт-дім'], en: ['Lavra view', 'Smart home'] }, facade: ['#BEB8AE', '#746C60'], plan: 2 },
];
const DISTRICTS = Array.from(new Set(FLATS.map((f) => f.district.uk)));

const EUR = 0.92;
const priceOf = (usd: number, l: 'uk' | 'en') => (l === 'uk' ? usd : Math.round((usd * EUR) / 100) * 100);
const C = (v: number, l: 'uk' | 'en') => (l === 'uk' ? '$ ' + num(v, 'uk') : '€' + num(v, 'en'));

function Facade({ f, view }: { f: Flat; view: number }) {
  const [a, b] = f.facade;
  if (view === 2) return <Plan rooms={f.rooms} area={f.area} />;
  if (view === 1) {
    return (
      <svg viewBox="0 0 400 260" className="es-img" aria-hidden="true">
        <rect width="400" height="260" fill="#EFEBE4" />
        <path d="M0 0 L120 60 L120 200 L0 260Z" fill="#E3DDD3" />
        <path d="M400 0 L280 60 L280 200 L400 260Z" fill="#DDD6CA" />
        <path d="M0 260 L120 200 L280 200 L400 260Z" fill={b} opacity="0.55" />
        <rect x="150" y="80" width="100" height="90" fill="#FBFAF7" stroke="#C9C2B6" />
        <path d="M150 125 H250 M200 80 V170" stroke="#C9C2B6" />
        <rect x="160" y="182" width="80" height="12" fill={a} />
        <rect x="300" y="150" width="60" height="40" fill={a} transform="skewY(14)" />
        <circle cx="70" cy="120" r="16" fill="#7D8A6A" /><rect x="66" y="130" width="8" height="40" fill="#8C7A64" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 260" className="es-img" aria-hidden="true">
      <rect width="400" height="260" fill="#E7ECEE" />
      <rect y="214" width="400" height="46" fill="#D8DCD6" />
      <rect x="90" y={260 - Math.min(230, 60 + f.floors * 7)} width="220" height={Math.min(230, 60 + f.floors * 7) - 46} fill={a} />
      {Array.from({ length: Math.min(28, f.floors) }).map((_, r) => Array.from({ length: 5 }).map((_, c) => {
        const y = 214 - 12 - r * 7.4; const hl = f.floors - 1 - r === f.floor - 1 && c === 2;
        return y > 260 - Math.min(230, 60 + f.floors * 7) + 6 ? <rect key={r + '-' + c} x={104 + c * 40} y={y} width="30" height="4.5" fill={hl ? '#C08A3E' : b} opacity={hl ? 1 : 0.55} /> : null;
      }))}
      <circle cx="40" cy="196" r="22" fill="#8C9A78" /><circle cx="360" cy="200" r="18" fill="#8C9A78" />
    </svg>
  );
}

function Plan({ rooms, area }: { rooms: number; area: number }) {
  const { lang } = useT();
  const L = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const labels = [L('Кухня-вітальня', 'Kitchen-living'), L('Спальня', 'Bedroom'), L('Спальня 2', 'Bedroom 2'), L('Кабінет', 'Study')];
  const cells = rooms === 1 ? [[20, 20, 230, 220, 0], [250, 20, 130, 130, 1]] : rooms === 2 ? [[20, 20, 200, 220, 0], [220, 20, 160, 120, 1], [220, 140, 160, 100, 2]] : rooms === 3 ? [[20, 20, 180, 140, 0], [200, 20, 180, 110, 1], [200, 130, 180, 110, 2], [20, 160, 100, 80, 3]] : [[20, 20, 180, 130, 0], [200, 20, 180, 110, 1], [200, 130, 180, 110, 2], [20, 150, 180, 90, 3]];
  return (
    <svg viewBox="0 0 400 260" className="es-img es-plan" aria-hidden="true">
      <rect width="400" height="260" fill="#F7F6F2" />
      <defs><pattern id={'g' + rooms + '-' + area} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#E3E1DA" strokeWidth="0.6" /></pattern></defs>
      <rect width="400" height="260" fill={`url(#g${rooms}-${area})`} />
      {cells.map(([x, y, w, h, li], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill="none" stroke="#1D2630" strokeWidth="3" />
          <text x={x + 10} y={y + 20} fontSize="11" fill="#1D2630" fontFamily="var(--mono)">{labels[li]}</text>
          <path d={`M${x + w / 2 - 14} ${y + h} a14 14 0 0 1 14 -14`} fill="none" stroke="#C08A3E" strokeWidth="1.2" />
        </g>
      ))}
      <text x="380" y="250" textAnchor="end" fontSize="12" fill="#1D2630" fontFamily="var(--mono)">{area} {lang === 'uk' ? 'м²' : 'm²'}</text>
    </svg>
  );
}

export default function Estate() {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const maxAll = priceOf(Math.max(...FLATS.map((f) => f.usd)), lang);
  const minAll = priceOf(Math.min(...FLATS.map((f) => f.usd)), lang);
  const [pr, setPr] = useState<[number, number]>([minAll, maxAll]);
  const [ar, setAr] = useState<[number, number]>([30, 140]);
  const [rooms, setRooms] = useState<number[]>([]);
  const [dist, setDist] = useState('');
  const [type, setType] = useState<'' | 'new' | 'resale'>('');
  const [sort, setSort] = useState<'price' | 'priceD' | 'area' | 'm2'>('price');
  const [onlyFav, setOnlyFav] = useState(false);
  const [fav, setFav] = useStored<string[]>('demo.estate.fav', []);
  const [cmp, setCmp] = useStored<string[]>('demo.estate.cmp', []);
  const [open, setOpen] = useState<string | null>(null);
  const [showCmp, setShowCmp] = useState(false);
  const [toast, setToast] = useState('');
  const [fOpen, setFOpen] = useState(false);
  useLockBody(!!open || showCmp || fOpen);
  const cmpRef = useDialog(showCmp, () => setShowCmp(false));
  const fRef = useDialog(fOpen, () => setFOpen(false));

  const list = useMemo(() => {
    const l = FLATS.filter((f) => {
      const p = priceOf(f.usd, lang);
      return p >= pr[0] && p <= pr[1] && f.area >= ar[0] && f.area <= ar[1] && (!rooms.length || rooms.includes(Math.min(4, f.rooms))) && (!dist || f.district.uk === dist) && (!type || f.type === type) && (!onlyFav || fav.includes(f.id));
    });
    return l.sort((a, b) => (sort === 'price' ? a.usd - b.usd : sort === 'priceD' ? b.usd - a.usd : sort === 'area' ? b.area - a.area : a.usd / a.area - b.usd / b.area));
  }, [pr, ar, rooms, dist, type, sort, onlyFav, fav, lang]);

  const toggleCmp = (id: string) => {
    if (cmp.includes(id)) { setCmp(cmp.filter((x) => x !== id)); return; }
    if (cmp.length >= 3) { setToast(T('Можна порівняти до трьох квартир', 'You can compare up to three flats')); setTimeout(() => setToast(''), 2000); return; }
    setCmp([...cmp, id]);
  };
  const toggleFav = (id: string) => setFav(fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id]);
  const flat = open ? FLATS.find((f) => f.id === open)! : null;
  const step = lang === 'uk' ? 5000 : 5000;

  const Filters = (
    <div className="es-filters">
      <Range label={T('Ціна', 'Price')} min={minAll} max={maxAll} step={step} v={pr} set={setPr} fmt={(v) => C(v, lang)} />
      <Range label={T('Площа, м²', 'Area, m²')} min={30} max={140} step={1} v={ar} set={setAr} fmt={(v) => String(v)} />
      <div className="es-f"><span>{T('Кімнати', 'Rooms')}</span>
        <div className="es-rooms">{[1, 2, 3, 4].map((r) => <button key={r} type="button" aria-pressed={rooms.includes(r)} className={cx(rooms.includes(r) && 'on')} onClick={() => setRooms(rooms.includes(r) ? rooms.filter((x) => x !== r) : [...rooms, r])}>{r === 4 ? '4+' : r}</button>)}</div>
      </div>
      <label className="es-f"><span>{T('Район', 'District')}</span>
        <select value={dist} onChange={(e) => setDist(e.target.value)}><option value="">{T('Усі райони', 'All districts')}</option>{DISTRICTS.map((d) => <option key={d} value={d}>{L(FLATS.find((f) => f.district.uk === d)!.district)}</option>)}</select>
      </label>
      <div className="es-f"><span>{T('Тип', 'Type')}</span>
        <div className="es-seg">{([['', T('Усі', 'All')], ['new', T('Новобудова', 'New build')], ['resale', T('Вторинне', 'Resale')]] as const).map(([k, l]) => <button key={k} type="button" className={cx(type === k && 'on')} onClick={() => setType(k)}>{l}</button>)}</div>
      </div>
      <button type="button" className="es-link" onClick={() => { setPr([minAll, maxAll]); setAr([30, 140]); setRooms([]); setDist(''); setType(''); }}>{T('Скинути', 'Reset')}</button>
    </div>
  );

  return (
    <div className="es">
      <header className="es-top">
        <div className="es-logo"><b>{T('КВАРТАЛ', 'KVARTAL')}</b><span>{T('агентство нерухомості', 'real estate agency')}</span></div>
        <div className="es-top-r">
          <button type="button" className={cx('es-chip', onlyFav && 'on')} onClick={() => setOnlyFav(!onlyFav)}><Icon n="heart" s={16} /> {T('Обране', 'Saved')} {fav.length > 0 && <em>{fav.length}</em>}</button>
          <button type="button" className="es-chip es-fbtn" onClick={() => setFOpen(true)}><Icon n="filter" s={16} /> {T('Фільтри', 'Filters')}</button>
        </div>
      </header>
      <section className="es-hero">
        <h1>{T('Квартири в Києві, які легко порівняти', 'Kyiv apartments that are easy to compare')}</h1>
        <p>{T('Демо-платформа: обʼєкти, ціни та фото вигадані. Ціни в доларах, як прийнято на ринку.', 'Demo platform: listings, prices and photos are fictional.')}</p>
      </section>
      <div className="es-body">
        <aside className="es-side">{Filters}</aside>
        <div className="es-main">
          <div className="es-bar">
            <span>{list.length} {T('обʼєктів', 'listings')}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label={T('Сортування', 'Sort')}>
              <option value="price">{T('Дешевші спершу', 'Price: low to high')}</option><option value="priceD">{T('Дорожчі спершу', 'Price: high to low')}</option>
              <option value="area">{T('Більша площа', 'Largest first')}</option><option value="m2">{T('Ціна за м²', 'Price per m²')}</option>
            </select>
          </div>
          <div className="es-grid">
            {list.map((f) => (
              <article key={f.id} className="es-card">
                <Gallery f={f} onOpen={() => setOpen(f.id)} />
                <button type="button" className={cx('es-heart', fav.includes(f.id) && 'on')} aria-pressed={fav.includes(f.id)} aria-label={T('В обране', 'Save')} onClick={() => toggleFav(f.id)}><Icon n="heart" s={18} /></button>
                <button type="button" className="es-card-b" onClick={() => setOpen(f.id)}>
                  <span className="es-price">{C(priceOf(f.usd, lang), lang)}</span>
                  <span className="es-m2">{C(Math.round(priceOf(f.usd, lang) / f.area), lang)} / {T('м²', 'm²')}</span>
                  <span className="es-t">{f.rooms}-{T('кімн.', 'bed')} · {f.area} {T('м²', 'm²')} · {f.floor}/{f.floors} {T('пов.', 'fl.')}</span>
                  <span className="es-loc"><Icon n="pin" s={14} /> {L(f.complex)}, {L(f.district)}</span>
                </button>
                <label className="es-cmp"><input type="checkbox" checked={cmp.includes(f.id)} onChange={() => toggleCmp(f.id)} /><span className="es-box"><Icon n="check" s={12} /></span>{T('Порівняти', 'Compare')}</label>
              </article>
            ))}
            {!list.length && <p className="es-empty">{T('Немає обʼєктів під ці умови. Розширте діапазон.', 'No listings match. Try widening the range.')}</p>}
          </div>
        </div>
      </div>

      {cmp.length > 0 && (
        <div className="es-cbar">
          <span>{T('Порівняння', 'Compare')}: {cmp.length}/3</span>
          <div>{cmp.map((id) => <button key={id} type="button" onClick={() => toggleCmp(id)}>{L(FLATS.find((f) => f.id === id)!.complex)} <Icon n="close" s={12} /></button>)}</div>
          <button type="button" className="es-btn" disabled={cmp.length < 2} onClick={() => setShowCmp(true)}><Icon n="compare" s={16} /> {T('Порівняти', 'Compare')}</button>
        </div>
      )}

      {showCmp && (
        <div className="es-modal" role="dialog" aria-modal="true" ref={cmpRef} tabIndex={-1} aria-label={T('Порівняння квартир', 'Apartment comparison')}>
          <button type="button" className="es-scrim" aria-label="close" onClick={() => setShowCmp(false)} />
          <div className="es-modal-in wide">
            <div className="es-modal-h"><h2>{T('Порівняння квартир', 'Apartment comparison')}</h2><button type="button" onClick={() => setShowCmp(false)} aria-label="close"><Icon n="close" /></button></div>
            <div className="es-ctable">
              <table>
                <thead><tr><th />{cmp.map((id) => { const f = FLATS.find((x) => x.id === id)!; return <th key={id}><Facade f={f} view={0} /><b>{L(f.complex)}</b></th>; })}</tr></thead>
                <tbody>
                  {([
                    [T('Ціна', 'Price'), (f: Flat) => C(priceOf(f.usd, lang), lang), (f: Flat) => -f.usd],
                    [T('За м²', 'Per m²'), (f: Flat) => C(Math.round(priceOf(f.usd, lang) / f.area), lang), (f: Flat) => -f.usd / f.area],
                    [T('Площа', 'Area'), (f: Flat) => f.area + ' ' + T('м²', 'm²'), (f: Flat) => f.area],
                    [T('Кімнати', 'Rooms'), (f: Flat) => String(f.rooms), (f: Flat) => f.rooms],
                    [T('Поверх', 'Floor'), (f: Flat) => `${f.floor} / ${f.floors}`, null],
                    [T('Рік', 'Year'), (f: Flat) => String(f.year), (f: Flat) => f.year],
                    [T('Район', 'District'), (f: Flat) => L(f.district), null],
                    [T('Тип', 'Type'), (f: Flat) => (f.type === 'new' ? T('Новобудова', 'New build') : T('Вторинне', 'Resale')), null],
                    [T('Особливості', 'Features'), (f: Flat) => L(f.feat).join(', '), null],
                  ] as [string, (f: Flat) => string, ((f: Flat) => number) | null][]).map(([lbl, fn, score]) => {
                    const fs = cmp.map((id) => FLATS.find((x) => x.id === id)!);
                    const best = score ? Math.max(...fs.map(score)) : null;
                    return <tr key={lbl}><th>{lbl}</th>{fs.map((f) => <td key={f.id} className={cx(score && score(f) === best && 'best')}>{fn(f)}</td>)}</tr>;
                  })}
                </tbody>
              </table>
            </div>
            <p className="es-hint">{T('Найкраще значення в рядку підсвічено.', 'The best value in each row is highlighted.')}</p>
          </div>
        </div>
      )}

      {fOpen && (
        <div className="es-modal sheet" role="dialog" aria-modal="true" ref={fRef} tabIndex={-1} aria-label={T('Фільтри', 'Filters')}>
          <button type="button" className="es-scrim" aria-label="close" onClick={() => setFOpen(false)} />
          <div className="es-modal-in"><div className="es-modal-h"><h2>{T('Фільтри', 'Filters')}</h2><button type="button" onClick={() => setFOpen(false)} aria-label="close"><Icon n="close" /></button></div>{Filters}
            <button type="button" className="es-btn wide" onClick={() => setFOpen(false)}>{T('Показати', 'Show')} {list.length}</button></div>
        </div>
      )}

      {flat && <Detail f={flat} fav={fav.includes(flat.id)} onFav={() => toggleFav(flat.id)} onClose={() => setOpen(null)} />}
      {toast && <div className="es-toast" role="status">{toast}</div>}
      <DemoNote className="es-note" />
    </div>
  );
}

function Range({ label, min, max, step, v, set, fmt }: { label: string; min: number; max: number; step: number; v: [number, number]; set: (v: [number, number]) => void; fmt: (n: number) => string }) {
  const pct = (x: number) => ((x - min) / (max - min)) * 100;
  return (
    <div className="es-f">
      <span>{label} <b>{fmt(v[0])} - {fmt(v[1])}</b></span>
      <div className="es-range" style={{ ['--a' as any]: pct(v[0]) + '%', ['--b' as any]: pct(v[1]) + '%' }}>
        <input type="range" min={min} max={max} step={step} value={v[0]} aria-label={label + ' min'} onChange={(e) => set([Math.min(+e.target.value, v[1]), v[1]])} />
        <input type="range" min={min} max={max} step={step} value={v[1]} aria-label={label + ' max'} onChange={(e) => set([v[0], Math.max(+e.target.value, v[0])])} />
      </div>
    </div>
  );
}

function Gallery({ f, onOpen, big }: { f: Flat; onOpen?: () => void; big?: boolean }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const go = (n: number) => { const el = ref.current; if (!el) return; const k = (n + 3) % 3; el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' }); setI(k); };
  return (
    <div className={cx('es-gal', big && 'big')}>
      <div className="es-gal-s" ref={ref} onScroll={(e) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); }}>
        {[0, 1, 2].map((v) => <div key={v} className="es-gal-i" onClick={onOpen}><Facade f={f} view={v} /></div>)}
      </div>
      <button type="button" className="es-gal-b l" aria-label="prev" onClick={() => go(i - 1)}><Icon n="chevL" s={16} /></button>
      <button type="button" className="es-gal-b r" aria-label="next" onClick={() => go(i + 1)}><Icon n="chevR" s={16} /></button>
      <div className="es-gal-d">{[0, 1, 2].map((v) => <i key={v} className={cx(i === v && 'on')} />)}</div>
    </div>
  );
}

function Detail({ f, fav, onFav, onClose }: { f: Flat; fav: boolean; onFav: () => void; onClose: () => void }) {
  const { lang, L } = useT();
  const T = (uk: string, en: string) => (lang === 'uk' ? uk : en);
  const price = priceOf(f.usd, lang);
  const dlg = useDialog(true, onClose);
  const [down, setDown] = useState(30);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(15);
  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12, n = years * 12;
  const pay = r ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n;
  const days = Array.from({ length: 10 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; }).filter((d) => d.getDay() !== 0);
  const [viewings, setViewings] = useStored<{ id: string; flat: string; date: string; time: string; name: string }[]>('demo.estate.viewings', []);
  const [vd, setVd] = useState(iso(days[0]));
  const [vt, setVt] = useState('');
  const [vn, setVn] = useState('');
  const [vp, setVp] = useState('');
  const [err, setErr] = useState(false);
  const mine = viewings.find((v) => v.flat === f.id);
  return (
    <div className="es-modal" role="dialog" aria-modal="true" aria-label={L(f.complex)} ref={dlg} tabIndex={-1}>
      <button type="button" className="es-scrim" aria-label="close" onClick={onClose} />
      <div className="es-modal-in detail">
        <div className="es-modal-h"><h2>{L(f.complex)} · {f.rooms}-{T('кімнатна', 'bedroom')}</h2>
          <div><button type="button" className={cx('es-ic', fav && 'on')} aria-pressed={fav} onClick={onFav} aria-label="♡"><Icon n="heart" /></button><button type="button" className="es-ic" onClick={onClose} aria-label="close"><Icon n="close" /></button></div>
        </div>
        <Gallery f={f} big />
        <div className="es-det">
          <div className="es-det-l">
            <p className="es-price big">{C(price, lang)}</p>
            <dl className="es-specs">
              <div><dt>{T('Площа', 'Area')}</dt><dd>{f.area} {T('м²', 'm²')}</dd></div>
              <div><dt>{T('Поверх', 'Floor')}</dt><dd>{f.floor} / {f.floors}</dd></div>
              <div><dt>{T('Рік', 'Year')}</dt><dd>{f.year}</dd></div>
              <div><dt>{T('Район', 'District')}</dt><dd>{L(f.district)}</dd></div>
            </dl>
            <ul className="es-feat">{L(f.feat).map((x) => <li key={x}><Icon n="check" s={14} />{x}</li>)}</ul>

            <section className="es-mort">
              <h3>{T('Іпотечний калькулятор', 'Mortgage calculator')}</h3>
              <label><span>{T('Перший внесок', 'Down payment')} <b>{down}% · {C(Math.round(price * down / 100), lang)}</b></span><input type="range" min={10} max={70} value={down} onChange={(e) => setDown(+e.target.value)} style={{ ['--v' as any]: ((down - 10) / 60) * 100 + '%' }} /></label>
              <label><span>{T('Ставка', 'Interest rate')} <b>{rate}%</b></span><input type="range" min={3} max={20} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} style={{ ['--v' as any]: ((rate - 3) / 17) * 100 + '%' }} /></label>
              <label><span>{T('Строк', 'Term')} <b>{years} {T('р.', 'yrs')}</b></span><input type="range" min={5} max={25} value={years} onChange={(e) => setYears(+e.target.value)} style={{ ['--v' as any]: ((years - 5) / 20) * 100 + '%' }} /></label>
              <div className="es-mort-r">
                <div><span>{T('Щомісячний платіж', 'Monthly payment')}</span><b>{C(Math.round(pay), lang)}</b></div>
                <div><span>{T('Сума кредиту', 'Loan amount')}</span><b>{C(Math.round(loan), lang)}</b></div>
                <div><span>{T('Переплата', 'Total interest')}</span><b>{C(Math.round(pay * n - loan), lang)}</b></div>
              </div>
              <p className="es-disc"><Icon n="info" s={14} /> {T('Розрахунок орієнтовний і не є пропозицією банку. Реальні умови залежать від банку, програми та вашої кредитної історії.', 'This is an indicative estimate, not a bank offer. Actual terms depend on the lender, programme and your credit history.')}</p>
            </section>
          </div>

          <section className="es-view">
            <h3>{T('Записатися на перегляд', 'Book a viewing')}</h3>
            {mine ? (
              <div className="es-ok">
                <Icon n="check" s={24} />
                <p><b>{T('Запит збережено', 'Request saved')}</b><br />{dateFmt(mine.date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}, {mine.time}</p>
                <p className="es-hint">{T('У демо запит нікуди не надсилається - він зберігається лише у вашому браузері.', 'In the demo the request is not sent anywhere - it is stored only in your browser.')}</p>
                <button type="button" className="es-btn ghost" onClick={() => setViewings(viewings.filter((v) => v.flat !== f.id))}>{T('Скасувати', 'Cancel')}</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (!vt || !vn.trim() || vp.replace(/\D/g, '').length < 9) { setErr(true); return; } setViewings([...viewings, { id: String(Date.now()), flat: f.id, date: vd, time: vt, name: vn }]); }}>
                <div className="es-days">{days.slice(0, 7).map((d) => <button key={iso(d)} type="button" className={cx(vd === iso(d) && 'on')} onClick={() => setVd(iso(d))}><small>{dateFmt(d, lang, { weekday: 'short' })}</small><b>{d.getDate()}</b></button>)}</div>
                <div className={cx('es-times', err && !vt && 'err')}>{['10:00', '11:30', '13:00', '15:00', '16:30', '18:00'].map((t) => <button key={t} type="button" className={cx(vt === t && 'on')} onClick={() => setVt(t)}>{t}</button>)}</div>
                <label className={cx(err && !vn.trim() && 'err')}><span>{T('Імʼя', 'Name')}</span><input value={vn} onChange={(e) => setVn(e.target.value)} /></label>
                <label className={cx(err && vp.replace(/\D/g, '').length < 9 && 'err')}><span>{T('Телефон', 'Phone')}</span><input value={vp} inputMode="tel" placeholder="+380 00 000 00 00" onChange={(e) => setVp(e.target.value)} /></label>
                <button type="submit" className="es-btn wide">{T('Записатися', 'Request viewing')}</button>
                <p className="es-hint">{T('Демо: дані не надсилаються й не зберігаються на сервері.', 'Demo: data is neither sent nor stored on a server.')}</p>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
