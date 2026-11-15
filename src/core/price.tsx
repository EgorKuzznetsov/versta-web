import React from 'react';
import { promo, pricing, Price, PricingConfig, ItemId } from '../config/pricing';
import { useT } from './i18n';
import { cur, cx } from './format';
import type { Lang } from './router';

export const promoOn = () => promo.enabled;
export const discountPct = () => Math.round((1 - promo.factor) * 100);

/** Price that applies now: launch price while the promo is on, otherwise the regular one */
export function nowPrice(p: Price, cfg: PricingConfig) {
  if (!promo.enabled) return p.regular;
  if (p.promo != null) return p.promo;
  return Math.round((p.regular * promo.factor) / cfg.partRound) * cfg.partRound;
}

export const fmt = (v: number, l: Lang) => cur(v, pricing[l].currency, l);

/** «від 4 000 грн  ~~7 000 грн~~» - or just «від 7 000 грн» when the promo is off */
export function PriceTag({ price, from = true, suffix, size = 'm', className = '' }: { price: Price; from?: boolean; suffix?: string; size?: 's' | 'm' | 'l'; className?: string }) {
  const { lang, t } = useT();
  const cfg = pricing[lang];
  const now = nowPrice(price, cfg);
  const showOld = promo.enabled && now < price.regular;
  return (
    <span className={cx('pt', 'pt-' + size, className)}>
      {from && <span className="pt-from">{t.common.from}</span>}
      <b className="pt-now">{fmt(now, lang)}{suffix && <span className="pt-suf"> {suffix}</span>}</b>
      {showOld && (
        <s className="pt-old">
          <span className="sr">{t.promo.regular}: </span>{fmt(price.regular, lang)}
        </s>
      )}
    </span>
  );
}

export const itemPrice = (id: ItemId, l: Lang) => pricing[l].items[id];
