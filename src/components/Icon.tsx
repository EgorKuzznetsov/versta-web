import React from 'react';

const P: Record<string, React.ReactNode> = {
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  arrowUR: <path d="M7 17 17 7M9 7h8v8" />,
  arrowL: <path d="M20 12H5m6-6-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3 8h18M3 16h18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />,
  bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  cart: <><path d="M3 4h2.5l2.2 11h10.6L20.5 7H7" /><circle cx="9.5" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c.8-3.8 3.8-5.8 7.5-5.8s6.7 2 7.5 5.8" /></>,
  users: <><circle cx="9" cy="9" r="3.3" /><path d="M2.8 19c.7-3.3 3.1-5 6.2-5s5.5 1.7 6.2 5" /><path d="M15.5 6a3.2 3.2 0 0 1 0 6.2M17.5 14.3c2 .6 3.3 2.1 3.8 4.7" /></>,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  download: <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" /><path d="M15.5 8.5V4.5h-11v11h4" /></>,
  send: <path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z" />,
  telegram: <path d="M21 4.5 2.8 11.4c-.6.2-.6 1.1.1 1.3l4.6 1.4 1.8 5.6c.2.6 1 .8 1.4.3l2.6-2.6 4.6 3.4c.5.4 1.2.1 1.3-.5L22 5.6c.2-.8-.4-1.4-1-1.1ZM8 14l9-6.2-6.8 7.4" />,
  whatsapp: <><path d="M4 20l1.2-4.1A8.2 8.2 0 1 1 8.4 19L4 20Z" /><path d="M9 8.3c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.4 2.4.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.6v.5c0 .3-.1.6-.4.8-.6.4-1.4.6-2.2.4-2.7-.7-4.8-2.8-5.5-5.5-.2-.8 0-1.6.4-2.3Z" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></>,
  phone: <path d="M6.6 3.5h2.8l1.4 4.2-2 1.4a11.5 11.5 0 0 0 6.1 6.1l1.4-2 4.2 1.4v2.8c0 .9-.7 1.6-1.6 1.6C10.6 19 5 13.4 5 5.1c0-.9.7-1.6 1.6-1.6Z" />,
  trash: <path d="M4.5 7h15M10 4h4M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />,
  edit: <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 7.5l2 2" />,
  home: <path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4v-9.5Z" />,
  area: <><path d="M4 4h16v16H4z" /><path d="M4 9h5V4M15 20v-5h5" /></>,
  rooms: <><path d="M3.5 4h17v16h-17z" /><path d="M12 4v7H3.5M12 15v5M15.5 11h5" /></>,
  compare: <path d="M8 4v16M16 4v16M4 8l4-4 4 4M12 16l4 4 4-4" />,
  chart: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />,
  grip: <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>,
  bell: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15L6 16.5ZM10 20.5h4" />,
  refresh: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  chevL: <path d="m15 6-6 6 6 6" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.6v.1" /></>,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  layers: <path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5" />,
  flame: <path d="M12 21a6 6 0 0 0 6-6c0-3.5-2.5-5.5-3.5-8-1 2-2 3-3 3 0-2.5-1-4.5-2.5-6C9 7 6 9.5 6 15a6 6 0 0 0 6 6Z" />,
  leaf: <path d="M5 19C5 10 10 5 20 4c0 9-5 15-13 15M5 19l7-7" />,
  wheat: <path d="M12 21V8M12 12c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Zm0 4.5c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4ZM12 8c-1-1-1.2-2.5 0-4.5 1.2 2 1 3.5 0 4.5Z" />,
  scissors: <><circle cx="6" cy="7" r="2.5" /><circle cx="6" cy="17" r="2.5" /><path d="M8 8.5 20 17M8 15.5 20 7" /></>,
  tag: <path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5-8.5-8.5ZM8 8v.1" />,
  truck: <><path d="M3 6h11v10H3zM14 9.5h4l3 3.5v3h-7" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17.5" cy="17.5" r="1.7" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
};

export type IconName = keyof typeof P;
export function Icon({ n, s = 20, className, title }: { n: IconName | string; s?: number; className?: string; title?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="square" strokeLinejoin="miter" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      {P[n as IconName]}
    </svg>
  );
}
