import React from 'react';
import site from '../config/site.json';

/** Wordmark: name + a ruler-tick glyph (верста — old measure of distance, and «верстка» — page layout) */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <svg className="logo-mark" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="0" y="0" width="22" height="22" fill="currentColor" />
        <rect x="4" y="4" width="2" height="14" fill="var(--paper)" />
        <rect x="9" y="9" width="2" height="9" fill="var(--paper)" />
        <rect x="14" y="13" width="4" height="5" fill="var(--accent)" />
      </svg>
      {!compact && <span className="logo-word">{site.studio.name}</span>}
    </span>
  );
}
