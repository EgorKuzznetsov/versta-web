import React from 'react';
import { useT } from '../core/i18n';

export const DEMO_IDS = ['analytics', 'booking', 'menu', 'crm', 'store', 'estate'] as const;
export type DemoId = (typeof DEMO_IDS)[number];

/** each demo has its own palette - used by thumbnails and case pages */
export const DEMO_THEME: Record<DemoId, { bg: string; fg: string; ac: string; n: string; service: string }> = {
  analytics: { bg: '#121614', fg: '#E9EFEA', ac: '#7FE0B0', n: '01', service: 'dashboard' },
  booking: { bg: '#E9E1D2', fg: '#1F2A22', ac: '#2F5D46', n: '02', service: 'booking' },
  menu: { bg: '#F4E7D7', fg: '#2A1A12', ac: '#C8532B', n: '03', service: 'shop' },
  crm: { bg: '#EEF0F2', fg: '#14171C', ac: '#2F62D8', n: '04', service: 'webapp' },
  store: { bg: '#E6E0D6', fg: '#111111', ac: '#111111', n: '05', service: 'shop' },
  estate: { bg: '#F5F4F0', fg: '#1D2630', ac: '#C08A3E', n: '06', service: 'corporate' },
};

/** Miniature, stylised previews of each demo interface (pure SVG) */
export function DemoThumb({ id, className = '' }: { id: DemoId; className?: string }) {
  const t = DEMO_THEME[id];
  const { lang } = useT();
  const common = { viewBox: '0 0 400 280', className: 'thumb ' + className, role: 'img' as const, 'aria-hidden': true };
  switch (id) {
    case 'analytics':
      return (
        <svg {...common}>
          <rect width="400" height="280" fill={t.bg} />
          <rect x="0" y="0" width="64" height="280" fill="#0B0E0C" />
          {[40, 70, 100, 130].map((y) => <rect key={y} x="18" y={y} width="28" height="4" fill="#2A332E" />)}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${80 + i * 78},22)`}>
              <rect width="70" height="52" fill="#1A201D" />
              <rect x="8" y="10" width="26" height="4" fill="#3B4741" />
              <rect x="8" y="24" width={30 + i * 6} height="10" fill={i === 0 ? t.ac : t.fg} opacity={i === 0 ? 1 : 0.85} />
            </g>
          ))}
          <rect x="80" y="88" width="304" height="120" fill="#1A201D" />
          <polyline points="92,190 130,170 168,176 206,148 244,156 282,122 320,130 370,100" fill="none" stroke={t.ac} strokeWidth="3" />
          <polyline points="92,196 130,186 168,190 206,170 244,176 282,160 320,162 370,148" fill="none" stroke="#5C6B63" strokeWidth="2" strokeDasharray="5 5" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={84 + i * 22} y={262 - (20 + ((i * 37) % 40))} width="12" height={20 + ((i * 37) % 40)} fill={i % 2 ? '#3B4741' : t.ac} opacity="0.9" />)}
          <rect x="250" y="220" width="134" height="6" fill="#2A332E" /><rect x="250" y="234" width="100" height="6" fill="#2A332E" /><rect x="250" y="248" width="120" height="6" fill="#2A332E" />
        </svg>
      );
    case 'booking':
      return (
        <svg {...common}>
          <rect width="400" height="280" fill={t.bg} />
          <text x="24" y="48" fill={t.fg} fontFamily="Georgia, serif" fontSize="30" fontStyle="italic">{lang === 'uk' ? 'Гребінь' : 'Hrebin'}</text>
          <rect x="24" y="66" width="160" height="1" fill={t.fg} opacity="0.3" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(24,${84 + i * 50})`}>
              <rect width="160" height="40" rx="20" fill={i === 1 ? t.ac : 'none'} stroke={t.fg} strokeOpacity="0.3" />
              <rect x="18" y="17" width="70" height="6" rx="3" fill={i === 1 ? '#E9E1D2' : t.fg} opacity="0.7" />
            </g>
          ))}
          <g transform="translate(210,40)">
            {Array.from({ length: 28 }).map((_, i) => {
              const x = (i % 7) * 24, y = Math.floor(i / 7) * 28;
              const on = i === 16;
              return <g key={i}><circle cx={x + 10} cy={y + 10} r="10" fill={on ? t.ac : 'none'} stroke={t.fg} strokeOpacity={i % 7 === 6 ? 0.1 : 0.25} />{i % 7 !== 6 && <circle cx={x + 10} cy={y + 10} r="2" fill={on ? '#E9E1D2' : t.fg} opacity="0.6" />}</g>;
            })}
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={(i % 3) * 56} y={130 + Math.floor(i / 3) * 34} width="48" height="24" rx="12" fill={i === 2 ? t.fg : 'none'} stroke={t.fg} strokeOpacity="0.35" />)}
          </g>
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <rect width="400" height="280" fill={t.bg} />
          <rect x="128" y="14" width="144" height="266" rx="22" fill="#FFF8EE" stroke={t.fg} strokeOpacity="0.15" />
          <rect x="144" y="40" width="64" height="8" rx="4" fill={t.fg} />
          {[0, 1, 2].map((i) => <rect key={i} x={144 + i * 40} y="60" width="34" height="16" rx="8" fill={i === 0 ? t.ac : 'none'} stroke={t.ac} />)}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(144,${90 + i * 90})`}>
              <circle cx="36" cy="36" r="32" fill="#E9D5BC" />
              <circle cx="36" cy="36" r="24" fill={i ? '#6E8B3D' : t.ac} />
              <circle cx="28" cy="30" r="6" fill="#F4E7D7" opacity="0.8" />
              <rect x="78" y="18" width="34" height="6" rx="3" fill={t.fg} />
              <rect x="78" y="32" width="26" height="5" rx="2.5" fill={t.fg} opacity="0.4" />
              <rect x="78" y="50" width="30" height="14" rx="7" fill={t.fg} />
            </g>
          ))}
          <rect x="140" y="246" width="120" height="24" rx="12" fill={t.ac} />
          <g fill={t.fg} opacity="0.5"><circle cx="60" cy="90" r="34" /><circle cx="340" cy="190" r="30" /></g>
          <circle cx="60" cy="90" r="24" fill="#E9D5BC" /><circle cx="340" cy="190" r="20" fill="#E9D5BC" />
        </svg>
      );
    case 'crm':
      return (
        <svg {...common}>
          <rect width="400" height="280" fill={t.bg} />
          <rect x="0" y="0" width="400" height="34" fill="#fff" />
          <rect x="16" y="13" width="40" height="8" fill={t.fg} />
          {[0, 1, 2, 3].map((c) => (
            <g key={c} transform={`translate(${14 + c * 96},48)`}>
              <rect width="86" height="10" fill={t.fg} opacity="0.12" />
              <rect y="0" width={20 + c * 14} height="10" fill={c === 3 ? '#2E9E62' : t.ac} opacity="0.9" />
              {Array.from({ length: 4 - (c % 3) }).map((_, i) => (
                <g key={i} transform={`translate(0,${20 + i * 50})`}>
                  <rect width="86" height="42" fill="#fff" stroke="#D6DAE0" />
                  <rect x="8" y="10" width="44" height="5" fill={t.fg} opacity="0.8" />
                  <rect x="8" y="24" width="28" height="5" fill={t.ac} opacity="0.7" />
                </g>
              ))}
            </g>
          ))}
          <g transform="translate(118,118) rotate(-4)"><rect width="86" height="42" fill="#fff" stroke={t.ac} strokeWidth="2" /><rect x="8" y="10" width="50" height="5" fill={t.fg} /><rect x="8" y="24" width="30" height="5" fill={t.ac} /></g>
        </svg>
      );
    case 'store':
      return (
        <svg {...common}>
          <rect width="400" height="280" fill={t.bg} />
          <text x="200" y="40" textAnchor="middle" fill={t.fg} fontFamily="var(--f)" fontWeight="600" fontSize="22" letterSpacing="8">{lang === 'uk' ? 'ЛЬОН' : 'LON'}</text>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${30 + i * 120},62)`}>
              <rect width="100" height="150" fill={['#D8CFC0', '#BFC5B4', '#CDB9A4'][i]} />
              <path d={`M30 40 L50 30 L70 40 L76 70 L68 72 L68 130 L32 130 L32 72 L24 70 Z`} fill={['#F1ECE2', '#6E7A62', '#9A6B4A'][i]} />
              <rect y="160" width="60" height="5" fill={t.fg} /><rect y="172" width="30" height="5" fill={t.fg} opacity="0.4" />
            </g>
          ))}
        </svg>
      );
    case 'estate':
      return (
        <svg {...common}>
          <rect width="400" height="280" fill={t.bg} />
          <rect x="20" y="20" width="220" height="240" fill="#DCE2E5" />
          <rect x="60" y="70" width="140" height="190" fill="#B8C3C9" />
          {Array.from({ length: 15 }).map((_, i) => <rect key={i} x={72 + (i % 3) * 42} y={84 + Math.floor(i / 3) * 34} width="30" height="22" fill={i === 7 ? t.ac : '#EEF1F2'} />)}
          <rect x="256" y="20" width="124" height="114" fill="none" stroke={t.fg} strokeOpacity="0.5" />
          <path d="M256 70 H320 V20 M320 70 V134 M320 100 H380" stroke={t.fg} strokeOpacity="0.5" fill="none" />
          <rect x="256" y="150" width="124" height="6" fill={t.fg} />
          <rect x="256" y="166" width="80" height="6" fill={t.fg} opacity="0.4" />
          <rect x="256" y="190" width="124" height="70" fill={t.fg} />
          <rect x="268" y="204" width="50" height="6" fill={t.ac} /><rect x="268" y="222" width="90" height="14" fill="#F5F4F0" />
        </svg>
      );
  }
}
