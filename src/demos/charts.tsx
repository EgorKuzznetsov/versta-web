import React, { useEffect, useRef, useState } from 'react';

export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, e.contentRect.width)));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};

export interface LineProps {
  labels: string[];
  cur: number[];
  prev?: number[];
  h?: number;
  fmt: (v: number) => string;
  fmtAxis: (v: number) => string;
  colors: { line: string; prev: string; grid: string; text: string; area: string };
  names: [string, string];
}

export function LineChart({ labels, cur, prev, h = 260, fmt, fmtAxis, colors, names }: LineProps) {
  const [ref, w] = useSize<HTMLDivElement>();
  const [hi, setHi] = useState<number | null>(null);
  const pad = { l: 52, r: 12, t: 14, b: 28 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = niceMax(Math.max(...cur, ...(prev || [0]), 1));
  const n = cur.length;
  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const path = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = `${path(cur)}L${x(n - 1)},${pad.t + ih}L${x(0)},${pad.t + ih}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => max * k);
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 70))));
  const onMove = (e: React.PointerEvent) => {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round(((px - pad.l) / iw) * (n - 1));
    setHi(Math.max(0, Math.min(n - 1, i)));
  };
  const key = cur.join(',').length + '-' + n;
  return (
    <div ref={ref} className="ch">
      <svg width={w} height={h} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHi(null)} style={{ touchAction: 'pan-y' }} role="img" aria-label={names[0]}>
        <defs>
          <linearGradient id="chA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={colors.area} stopOpacity="0.35" /><stop offset="1" stopColor={colors.area} stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((tv) => (
          <g key={tv}>
            <line x1={pad.l} x2={w - pad.r} y1={y(tv)} y2={y(tv)} stroke={colors.grid} />
            <text x={pad.l - 8} y={y(tv) + 4} textAnchor="end" fontSize="10" fill={colors.text} fontFamily="var(--mono)">{fmtAxis(tv)}</text>
          </g>
        ))}
        {labels.map((l, i) => i % every === 0 && (
          <text key={i} x={x(i)} y={h - 8} textAnchor="middle" fontSize="10" fill={colors.text} fontFamily="var(--mono)">{l}</text>
        ))}
        <path d={area} fill="url(#chA)" className="ch-area" key={'a' + key} />
        {prev && <path d={path(prev)} fill="none" stroke={colors.prev} strokeWidth="1.5" strokeDasharray="4 4" />}
        <path d={path(cur)} fill="none" stroke={colors.line} strokeWidth="2.2" className="ch-line" pathLength={1} key={'l' + key} />
        {hi != null && (
          <g>
            <line x1={x(hi)} x2={x(hi)} y1={pad.t} y2={pad.t + ih} stroke={colors.text} strokeOpacity="0.4" />
            <circle cx={x(hi)} cy={y(cur[hi])} r="4.5" fill={colors.line} />
            {prev && <circle cx={x(hi)} cy={y(prev[hi] ?? 0)} r="3.5" fill={colors.prev} />}
          </g>
        )}
      </svg>
      {hi != null && (
        <div className="ch-tip" style={{ left: Math.min(Math.max(x(hi), 70), w - 70) }}>
          <b>{labels[hi]}</b>
          <span><i style={{ background: colors.line }} />{names[0]}: {fmt(cur[hi])}</span>
          {prev && <span><i style={{ background: colors.prev }} />{names[1]}: {fmt(prev[hi] ?? 0)}</span>}
        </div>
      )}
    </div>
  );
}

export function GroupBars({ labels, a, b, h = 220, colors, fmt, fmtAxis, names }: {
  labels: string[]; a: number[]; b: number[]; h?: number; colors: { a: string; b: string; grid: string; text: string };
  fmt: (v: number) => string; fmtAxis: (v: number) => string; names: [string, string];
}) {
  const [ref, w] = useSize<HTMLDivElement>();
  const [hi, setHi] = useState<number | null>(null);
  const pad = { l: 52, r: 8, t: 10, b: 26 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = niceMax(Math.max(...a, ...b, 1));
  const n = labels.length;
  const bw = iw / n;
  const barW = Math.max(2, Math.min(18, bw * 0.34));
  const y = (v: number) => pad.t + ih - (Math.max(0, v) / max) * ih;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 60))));
  const k = n + '-' + a.length;
  return (
    <div ref={ref} className="ch">
      <svg width={w} height={h} role="img" aria-label={names.join(' / ')} onPointerLeave={() => setHi(null)}>
        {[0, 0.5, 1].map((tv) => (
          <g key={tv}><line x1={pad.l} x2={w - pad.r} y1={y(max * tv)} y2={y(max * tv)} stroke={colors.grid} />
            <text x={pad.l - 8} y={y(max * tv) + 4} textAnchor="end" fontSize="10" fill={colors.text} fontFamily="var(--mono)">{fmtAxis(max * tv)}</text></g>
        ))}
        {labels.map((l, i) => {
          const cx = pad.l + bw * i + bw / 2;
          return (
            <g key={i + k} onPointerEnter={() => setHi(i)} onPointerDown={() => setHi(i)}>
              <rect x={pad.l + bw * i} y={pad.t} width={bw} height={ih} fill="transparent" />
              <rect className="ch-bar" x={cx - barW - 1} y={y(a[i])} width={barW} height={pad.t + ih - y(a[i])} fill={colors.a} opacity={hi == null || hi === i ? 1 : 0.4} style={{ ['--i' as any]: i }} />
              <rect className="ch-bar" x={cx + 1} y={y(b[i])} width={barW} height={pad.t + ih - y(b[i])} fill={colors.b} opacity={hi == null || hi === i ? 1 : 0.4} style={{ ['--i' as any]: i }} />
              {i % every === 0 && <text x={cx} y={h - 8} textAnchor="middle" fontSize="10" fill={colors.text} fontFamily="var(--mono)">{l}</text>}
            </g>
          );
        })}
      </svg>
      {hi != null && (
        <div className="ch-tip" style={{ left: Math.min(Math.max(pad.l + bw * hi + bw / 2, 70), w - 70) }}>
          <b>{labels[hi]}</b>
          <span><i style={{ background: colors.a }} />{names[0]}: {fmt(a[hi])}</span>
          <span><i style={{ background: colors.b }} />{names[1]}: {fmt(b[hi])}</span>
        </div>
      )}
    </div>
  );
}
