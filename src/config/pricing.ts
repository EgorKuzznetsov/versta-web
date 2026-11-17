/**
 * ЄДИНИЙ ФАЙЛ ЦІН, АКЦІЇ, ТАРИФІВ І УМОВ
 * ------------------------------------------------------------
 * • promo.enabled - увімкнути/вимкнути стартову акцію. Після вимкнення з сайту
 *   автоматично зникають закреслені ціни, економія та написи про акцію,
 *   а скрізь показуються звичайні (стандартні) ціни.
 * • regular - планові стандартні тарифи після завершення стартової акції.
 * • promo   - акційна ціна. Для позицій, де promo не вказано (додаткові сторінки,
 *   мови, функції, анімації), акційна ціна рахується як regular × promo.factor
 *   і округлюється до partRound.
 * • uk - гривні (українська версія), en - євро (англійська версія), окремі ціни.
 * • days - орієнтовні робочі дні.
 */

type Bi<T = string> = { uk: T; en: T };

export const promo = {
  enabled: true,
  /** Коефіцієнт стартової ціни: лендинг 7 000 → 4 000 грн = 4/7 (знижка ≈ 43%) */
  factor: 4 / 7,
};

export type ItemId = 'landing' | 'multipage' | 'corporate' | 'booking' | 'menu' | 'shop' | 'dashboard' | 'crm' | 'redesign' | 'webapp';
export type PlanId = 'basic' | 'standard' | 'business';
export type Feat = 'booking' | 'shop' | 'analytics' | 'admin';
export interface Price { regular: number; promo?: number }

/** Позиції прайсу (порядок = порядок на сайті) */
export const ITEMS: { id: ItemId; name: Bi; note: Bi; days: number; includedPages: number; includes?: Feat[] }[] = [
  { id: 'landing', name: { uk: 'Лендинг', en: 'Landing page' }, note: { uk: 'Одна сторінка під рекламу чи послугу', en: 'One page for an ad or a service' }, days: 6, includedPages: 1 },
  { id: 'multipage', name: { uk: 'Багатосторінковий сайт', en: 'Multi-page website' }, note: { uk: 'Кілька сторінок про послуги', en: 'Several pages about your services' }, days: 10, includedPages: 5 },
  { id: 'corporate', name: { uk: 'Корпоративний сайт', en: 'Company website' }, note: { uk: 'Розгорнутий сайт компанії', en: 'A full company website' }, days: 14, includedPages: 8 },
  { id: 'booking', name: { uk: 'Сайт з онлайн-записом', en: 'Website with online booking' }, note: { uk: 'Послуги, майстри, календар', en: 'Services, staff, calendar' }, days: 18, includedPages: 4, includes: ['booking'] },
  { id: 'menu', name: { uk: 'Цифрове меню', en: 'Digital menu' }, note: { uk: 'Меню для кафе й ресторанів', en: 'For cafés and restaurants' }, days: 12, includedPages: 2 },
  { id: 'shop', name: { uk: 'Інтернет-магазин', en: 'Online store' }, note: { uk: 'Каталог, кошик, оплата', en: 'Catalogue, cart, payment' }, days: 24, includedPages: 6, includes: ['shop'] },
  { id: 'dashboard', name: { uk: 'Панель аналітики', en: 'Analytics dashboard' }, note: { uk: 'Цифри бізнесу на одному екрані', en: 'Business numbers on one screen' }, days: 20, includedPages: 3, includes: ['analytics'] },
  { id: 'crm', name: { uk: 'CRM-система', en: 'CRM system' }, note: { uk: 'Клієнти, угоди, задачі', en: 'Clients, deals, tasks' }, days: 28, includedPages: 4, includes: ['admin'] },
  { id: 'redesign', name: { uk: 'Редизайн сайту', en: 'Website redesign' }, note: { uk: 'Оновлення наявного сайту', en: 'Refresh of an existing site' }, days: 12, includedPages: 5 },
  { id: 'webapp', name: { uk: 'Індивідуальний веб-застосунок', en: 'Custom web application' }, note: { uk: 'Кабінет, облік, портал', en: 'Portal, accounts, tracking' }, days: 35, includedPages: 6 },
];

/** Орієнтовні додаткові робочі дні для складових у калькуляторі */
export const DAYS = { extraPage: 1, extraLanguage: 2, booking: 7, shop: 12, analytics: 7, admin: 5, moderate: 2, rich: 5 };

/** Тарифи обслуговування (тексти - тут, ціни - у блоках uk / en нижче) */
export const PLANS: { id: PlanId; name: string; best?: boolean; lead: Bi; features: Bi<string[]>; excluded?: Bi<string[]> }[] = [
  {
    id: 'basic', name: 'BASIC',
    lead: { uk: 'Для тих, кому потрібен базовий технічний нагляд за сайтом.', en: 'For clients who need basic technical monitoring of their website.' },
    features: {
      uk: ['3 перевірки працездатності сайту на місяць', 'Перевірка доступності сторінок', 'Перевірка основних кнопок, посилань і форм', 'Повідомлення, якщо знайдено проблему'],
      en: ['3 website health checks per month', 'Page availability checks', 'Checks of key buttons, links and forms', 'We notify you if we find a problem'],
    },
    excluded: { uk: ['Зміни в контенті сайту не входять'], en: ['Content changes are not included'] },
  },
  {
    id: 'standard', name: 'STANDARD', best: true,
    lead: { uk: 'Для бізнесу, якому час від часу потрібно оновлювати інформацію на сайті.', en: 'For businesses that need to update their site from time to time.' },
    features: {
      uk: ['3 перевірки працездатності сайту на місяць', 'Перевірка доступності сторінок', 'Перевірка основних кнопок, посилань і форм', 'Повідомлення, якщо знайдено проблему', 'До 3 невеликих змін на сайті щомісяця', 'Оновлення текстів, цін, зображень, контактів і наявних елементів'],
      en: ['3 website health checks per month', 'Page availability checks', 'Checks of key buttons, links and forms', 'We notify you if we find a problem', 'Up to 3 small changes per month', 'Updates to copy, prices, images, contacts and existing elements'],
    },
  },
  {
    id: 'business', name: 'BUSINESS',
    lead: { uk: 'Для бізнесу, що активно розвивається й потребує регулярного обслуговування.', en: 'For growing businesses that need regular technical care.' },
    features: {
      uk: ['Перевірка працездатності 2 рази на тиждень', 'Перевірка доступності сторінок', 'Перевірка основних кнопок, посилань і форм', 'Повідомлення, якщо знайдено проблему', 'До 6 невеликих змін на сайті щомісяця', 'Оновлення текстів, цін, зображень і наявних елементів', 'Пріоритетна обробка запитів'],
      en: ['Health checks twice a week', 'Page availability checks', 'Checks of key buttons, links and forms', 'We notify you if we find a problem', 'Up to 6 small changes per month', 'Updates to copy, prices, images and existing elements', 'Priority handling of your requests'],
    },
  },
];

/** Таблиця порівняння тарифів: значення для [BASIC, STANDARD, BUSINESS]; true/false = є/немає */
export const COMPARE: { label: Bi; v: [Bi | boolean, Bi | boolean, Bi | boolean] }[] = [
  { label: { uk: 'Перевірки працездатності', en: 'Health checks' }, v: [{ uk: '3 / міс.', en: '3 / mo' }, { uk: '3 / міс.', en: '3 / mo' }, { uk: '2 / тиж.', en: '2 / week' }] },
  { label: { uk: 'Доступність сторінок', en: 'Page availability' }, v: [true, true, true] },
  { label: { uk: 'Кнопки, посилання, форми', en: 'Buttons, links, forms' }, v: [true, true, true] },
  { label: { uk: 'Повідомлення про проблему', en: 'Problem notifications' }, v: [true, true, true] },
  { label: { uk: 'Невеликі зміни на місяць', en: 'Small changes per month' }, v: [false, { uk: 'до 3', en: 'up to 3' }, { uk: 'до 6', en: 'up to 6' }] },
  { label: { uk: 'Оновлення текстів, цін, зображень', en: 'Copy, price and image updates' }, v: [false, true, true] },
  { label: { uk: 'Пріоритетна обробка запитів', en: 'Priority request handling' }, v: [false, false, true] },
];

/** Умови обслуговування */
/** Гарантії студії (показуються на сторінці цін і на головній). Ці ж умови мають бути в договорі. */
export const GUARANTEE_MONTHS = 1;
export const GUARANTEES: { title: Bi; text: Bi }[] = [
  { title: { uk: 'Офіційно, як ФОП', en: 'Officially registered' }, text: { uk: 'Договір із ціною й термінами, рахунок і безготівкова оплата.', en: 'A contract with the price and timeline, an invoice and bank transfer payment.' } },
  { title: { uk: '50% / 50%', en: '50% / 50%' }, text: { uk: 'Половина на старті, решта - після здачі сайту.', en: 'Half upfront, the rest when the website is delivered.' } },
  { title: { uk: 'Гарантія 1 місяць', en: '1-month warranty' }, text: { uk: 'Безкоштовно виправляємо помилки протягом місяця після запуску.', en: 'We fix bugs free of charge for a month after launch.' } },
  { title: { uk: 'Сайт і домен - ваші', en: 'You own the site and domain' }, text: { uk: 'Передаємо всі доступи, без прив’язки до нас.', en: 'We hand over all access, with no lock-in.' } },
  { title: { uk: 'Повернемо передоплату', en: 'Prepayment refund' }, text: { uk: 'Якщо робота ще не почалась.', en: 'If work has not started yet.' } },
];

export const TERMS = {
  smallChange: {
    uk: ['Заміна або додавання тексту в наявний блок', 'Заміна зображення', 'Зміна вартості товару чи послуги', 'Оновлення контактної інформації', 'Невелика зміна наявного елемента інтерфейсу'],
    en: ['Replacing or adding text in an existing block', 'Replacing an image', 'Changing the price of a product or service', 'Updating contact details', 'A small change to an existing interface element'],
  } as Bi<string[]>,
  notes: {
    uk: [
      'Створення нових сторінок, складних функцій, нових інтеграцій і масштабний редизайн розраховуються окремо.',
      'Невикористані зміни не переносяться на наступний місяць.',
      'Домен і хостинг оплачуються окремо.',
      'Виправлення помилок, знайдених під час перевірок, узгоджується окремо, якщо воно не входить у гарантію на розроблений сайт (1 місяць після запуску).',
      'Обслуговування добровільне: після розробки ви не зобовʼязані купувати щомісячний тариф.',
    ],
    en: [
      'New pages, complex features, new integrations and large-scale redesigns are quoted separately.',
      'Unused changes do not roll over to the next month.',
      'Domain and hosting are paid separately.',
      'Fixing issues found during checks is agreed separately unless it is covered by the warranty for the website we built (1 month after launch).',
      'Maintenance is optional: you are not obliged to buy a monthly plan after development.',
    ],
  } as Bi<string[]>,
};

export interface PricingConfig {
  currency: 'UAH' | 'EUR';
  /** округлення підсумку калькулятора та розрахованих акційних цін */
  roundTo: number;
  partRound: number;
  items: Record<ItemId, Price>;
  extraPage: Price;
  extraLanguage: Price;
  addons: Record<Feat, Price>;
  animations: { basic: Price; moderate: Price; rich: Price };
  urgency: { standard: { mult: number; daysMult: number }; fast: { mult: number; daysMult: number }; rush: { mult: number; daysMult: number } };
  /** тарифи обслуговування, за місяць */
  maintenance: Record<PlanId, number>;
  /** «від …» для послуг, яких немає в прайсі (без акції) */
  other: { integrations: number };
}

export const pricing: { uk: PricingConfig; en: PricingConfig } = {
  uk: {
    currency: 'UAH',
    roundTo: 500,
    partRound: 100,
    items: {
      landing: { regular: 7000, promo: 4000 },
      multipage: { regular: 14000, promo: 8000 },
      corporate: { regular: 21000, promo: 12000 },
      booking: { regular: 17500, promo: 10000 },
      menu: { regular: 10500, promo: 6000 },
      shop: { regular: 28000, promo: 16000 },
      dashboard: { regular: 24500, promo: 14000 },
      crm: { regular: 35000, promo: 20000 },
      redesign: { regular: 7000, promo: 4000 },
      webapp: { regular: 42000, promo: 24000 },
    },
    extraPage: { regular: 1200 },
    extraLanguage: { regular: 3500 },
    addons: { booking: { regular: 7000 }, shop: { regular: 14000 }, analytics: { regular: 10500 }, admin: { regular: 7000 } },
    animations: { basic: { regular: 0 }, moderate: { regular: 2500 }, rich: { regular: 7000 } },
    urgency: { standard: { mult: 1, daysMult: 1 }, fast: { mult: 1.25, daysMult: 0.75 }, rush: { mult: 1.5, daysMult: 0.55 } },
    maintenance: { basic: 500, standard: 1500, business: 3000 },
    other: { integrations: 3000 },
  },
  en: {
    currency: 'EUR',
    roundTo: 10,
    partRound: 5,
    items: {
      landing: { regular: 350, promo: 200 },
      multipage: { regular: 700, promo: 400 },
      corporate: { regular: 1050, promo: 600 },
      booking: { regular: 875, promo: 500 },
      menu: { regular: 525, promo: 300 },
      shop: { regular: 1400, promo: 800 },
      dashboard: { regular: 1225, promo: 700 },
      crm: { regular: 1750, promo: 1000 },
      redesign: { regular: 350, promo: 200 },
      webapp: { regular: 2100, promo: 1200 },
    },
    extraPage: { regular: 35 },
    extraLanguage: { regular: 105 },
    addons: { booking: { regular: 245 }, shop: { regular: 490 }, analytics: { regular: 350 }, admin: { regular: 245 } },
    animations: { basic: { regular: 0 }, moderate: { regular: 70 }, rich: { regular: 175 } },
    urgency: { standard: { mult: 1, daysMult: 1 }, fast: { mult: 1.25, daysMult: 0.75 }, rush: { mult: 1.5, daysMult: 0.55 } },
    maintenance: { basic: 19, standard: 49, business: 99 },
    other: { integrations: 100 },
  },
};
