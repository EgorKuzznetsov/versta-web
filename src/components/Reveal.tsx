import React from 'react';
import { useReveal } from '../core/hooks';

export function Reveal({ as = 'div', className = '', children, delay = 0, ...rest }: { as?: any; className?: string; children: React.ReactNode; delay?: number; [k: string]: any }) {
  const ref = useReveal<HTMLElement>();
  const Tag = as;
  return <Tag ref={ref} className={'rv ' + className} style={{ ['--d' as any]: delay + 'ms' }} {...rest}>{children}</Tag>;
}

/** Splits a line into words for staggered typography reveal */
export function SplitLine({ text, className = '', base = 0 }: { text: string; className?: string; base?: number }) {
  return (
    <span className={'split ' + className}>
      {text.split(' ').map((w, i) => (
        <React.Fragment key={i}><span className="w"><span style={{ ['--i' as any]: base + i }}>{w}</span></span>{' '}</React.Fragment>
      ))}
    </span>
  );
}
