import React, { createContext, useContext } from 'react';
import uk, { Dict } from '../i18n/uk';
import en from '../i18n/en';
import type { Lang } from './router';

const dicts: Record<Lang, Dict> = { uk, en };
export type Bi<T = string> = { uk: T; en: T };

interface Ctx { lang: Lang; t: Dict; L: <T>(b: Bi<T>) => T }
const C = createContext<Ctx>({ lang: 'uk', t: uk, L: (b) => b.uk });

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const L = <T,>(b: Bi<T>) => b[lang];
  return <C.Provider value={{ lang, t: dicts[lang], L }}>{children}</C.Provider>;
}
export const useT = () => useContext(C);
export const LANG_KEY = 'versta.lang';
