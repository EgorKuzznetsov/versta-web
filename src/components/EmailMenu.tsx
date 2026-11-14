import React, { useEffect, useState } from 'react';
import { useT } from '../core/i18n';
import { useCopy, useDialog } from '../core/hooks';
import { Icon } from './Icon';

/**
 * A plain mailto: link does nothing when no mail program is set up (common on Windows),
 * so the email button offers Gmail in the browser, the mail app and copying the address.
 */
export function EmailMenu({ to, subject, body, className = '', children, up = false }: { to: string; subject?: string; body?: string; className?: string; children: React.ReactNode; up?: boolean }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useDialog<HTMLSpanElement>(open, () => setOpen(false), { trap: false });
  const { copy, done } = useCopy();
  useEffect(() => {
    if (!open) return;
    const f = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', f);
    return () => document.removeEventListener('pointerdown', f);
  }, [open]);
  const q = (o: Record<string, string | undefined>) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v!)).join('&');
  const gmail = 'https://mail.google.com/mail/?view=cm&fs=1&' + q({ to, su: subject, body });
  const mailto = 'mailto:' + to + (subject || body ? '?' + q({ subject, body }) : '');
  return (
    <span className={'em' + (up ? ' em-up' : '')} ref={ref}>
      <button type="button" className={className} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>{children}</button>
      {open && (
        <span className="em-menu" role="menu">
          <a role="menuitem" href={gmail} target="_blank" rel="noopener" onClick={() => setOpen(false)}><Icon n="arrowUR" s={14} />{t.mail.gmail}</a>
          <a role="menuitem" href={mailto} onClick={() => setOpen(false)}><Icon n="mail" s={14} />{t.mail.app}</a>
          {to && <button type="button" role="menuitem" onClick={() => copy(to)}><Icon n={done ? 'check' : 'copy'} s={14} />{done ? t.common.copied : t.mail.copy}</button>}
          {to && <span className="em-addr">{to}</span>}
        </span>
      )}
    </span>
  );
}
