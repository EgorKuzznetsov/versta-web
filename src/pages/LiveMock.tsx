import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../core/i18n';
import { cx } from '../core/format';

const DESIGN_W = 1200;
const MIN_W = 340;

/** A real, tiny website rendered at a chosen width - it reflows via container queries. */
export function LiveMock() {
  const { t } = useT();
  const stage = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(800);
  const [w, setW] = useState(DESIGN_W);
  const [wire, setWire] = useState(false);
  const [drag, setDrag] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const el = stage.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setStageW(e.contentRect.width));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  // gentle one-time demo: desktop → phone → desktop, unless the user already interacted
  useEffect(() => {
    if (touched || document.documentElement.classList.contains('rm')) return;
    let raf = 0; const start = performance.now() + 1400; const dur = 2600;
    const tick = (now: number) => {
      if (now < start) { raf = requestAnimationFrame(tick); return; }
      const k = Math.min(1, (now - start) / dur);
      const e = 0.5 - Math.cos(k * Math.PI * 2) / 2; // 0→1→0
      setW(Math.round(DESIGN_W - (DESIGN_W - 390) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [touched]);

  const scale = stageW / DESIGN_W;
  const stageH = Math.max(300, Math.min(560, stageW * 0.62));
  const device = w < 560 ? 'mobile' : w < 900 ? 'tablet' : 'desktop';

  const onDown = (e: React.PointerEvent) => {
    setTouched(true); setDrag(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale;
    setW(Math.round(Math.max(MIN_W, Math.min(DESIGN_W, px))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 100 : 20;
    if (e.key === 'ArrowLeft') { setTouched(true); setW((v) => Math.max(MIN_W, v - step)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setTouched(true); setW((v) => Math.min(DESIGN_W, v + step)); e.preventDefault(); }
  };
  const preset = (v: number) => { setTouched(true); setW(v); };

  return (
    <div className="lm">
      <div className="lm-bar">
        <span className="mono">{t.hero.liveLabel}</span>
        <div className="lm-presets" role="group" aria-label={t.hero.liveLabel}>
          {([['desktop', 1200], ['tablet', 768], ['mobile', 390]] as const).map(([k, v]) => (
            <button key={k} type="button" className={cx('mono', device === k && 'on')} onClick={() => preset(v)}>{t.hero.devices[k]}</button>
          ))}
        </div>
        <div className="lm-toggle" role="group">
          <button type="button" className={cx('mono', !wire && 'on')} aria-pressed={!wire} onClick={() => { setTouched(true); setWire(false); }}>{t.hero.design}</button>
          <button type="button" className={cx('mono', wire && 'on')} aria-pressed={wire} onClick={() => { setTouched(true); setWire(true); }}>{t.hero.wire}</button>
        </div>
      </div>
      <div className="lm-stage" ref={stage} style={{ height: stageH }}>
        <div className="lm-ruler" aria-hidden="true" />
        <div className="lm-frame" style={{ width: w * scale, height: stageH - 22 }}>
          <div className="lm-scaler" style={{ width: w, height: (stageH - 22) / scale, transform: `scale(${scale})` }}>
            <MockSite wire={wire} />
          </div>
          <div
            className={cx('lm-handle', drag && 'drag')}
            role="slider" tabIndex={0} aria-label={t.hero.liveHint}
            aria-valuemin={MIN_W} aria-valuemax={DESIGN_W} aria-valuenow={w}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => setDrag(false)} onPointerCancel={() => setDrag(false)}
            onKeyDown={onKey}
          >
            <span />
          </div>
        </div>
        <div className="lm-readout mono" style={{ left: Math.min(w * scale + 14, stageW - 120) }}>
          {w}px · {t.hero.devices[device]}
        </div>
      </div>
      <p className="lm-hint small muted">{t.hero.liveHint}</p>
    </div>
  );
}

function Loaf({ c = '#C98A4B', d = '#8A5528' }: { c?: string; d?: string }) {
  return (
    <svg viewBox="0 0 120 80" className="ms-img" aria-hidden="true">
      <ellipse cx="60" cy="50" rx="52" ry="26" fill={d} />
      <ellipse cx="60" cy="44" rx="50" ry="26" fill={c} />
      {[30, 50, 70, 90].map((x) => <path key={x} d={`M${x - 8} 30 q8 10 16 0`} stroke={d} strokeWidth="3" fill="none" />)}
    </svg>
  );
}

function MockSite({ wire }: { wire: boolean }) {
  const { t } = useT();
  const m = t.mock;
  const colors = [['#C98A4B', '#8A5528'], ['#E3C9A0', '#B08A55'], ['#D9A35C', '#9E6A2C']];
  return (
    <div className={cx('ms', wire && 'wire')} aria-hidden="true">
      <div className="ms-nav">
        <b className="ms-brand">{m.brand}</b>
        <span className="ms-links">{m.nav.map((n) => <i key={n}>{n}</i>)}</span>
        <span className="ms-btn">{m.order}</span>
        <span className="ms-burger"><i /><i /></span>
      </div>
      <div className="ms-hero">
        <div className="ms-copy">
          <p className="ms-title">{m.title}</p>
          <p>{m.text}</p>
          <span className="ms-cta">{m.cta} →</span>
        </div>
        <div className="ms-photo"><Loaf /></div>
      </div>
      <div className="ms-grid">
        {m.items.map(([n, p], i) => (
          <div className="ms-card" key={n}>
            <div className="ms-thumb"><Loaf c={colors[i][0]} d={colors[i][1]} /></div>
            <div className="ms-row"><span>{n}</span><b>{p}</b></div>
          </div>
        ))}
      </div>
      <div className="ms-strip"><span className="ms-dot" />{m.strip}</div>
    </div>
  );
}
