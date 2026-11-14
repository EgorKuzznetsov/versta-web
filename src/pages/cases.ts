import type { Bi } from '../core/i18n';
import type { DemoId } from '../demos/meta';

export interface Case {
  id: DemoId;
  title: Bi;
  client: Bi;
  year: string;
  task: Bi;
  design: Bi;
  features: Bi<string[]>;
  mobile: Bi;
  tech: string[];
}

export const CASES: Case[] = [
  {
    id: 'analytics',
    title: { uk: 'Ledger — аналітика для автосервісу', en: 'Ledger — analytics for a car service' },
    client: { uk: 'Концепт: мережа СТО «Півоберта»', en: 'Concept: “Pivoberta” car service chain' },
    year: '2026',
    task: {
      uk: 'Власник мережі зводить виручку, витрати й завантаження боксів у кількох таблицях. Потрібен один екран, де за хвилину видно, як іде місяць, які послуги приносять прибуток і де ростуть витрати.',
      en: 'The owner pieces together revenue, costs and bay utilisation from several spreadsheets. The goal: one screen that shows in a minute how the month is going, which services make money and where costs are creeping up.',
    },
    design: {
      uk: 'Темний інтерфейс для щоденного використання: менше втомлює очі, а акцентний м’ятний колір виділяє лише головне — поточний період. Цифри набрані моноширинним шрифтом, щоб розряди стояли рівно й легко порівнювалися.',
      en: 'A dark interface built for daily use: easier on the eyes, with a single mint accent reserved for what matters — the current period. Figures are set in a monospaced face so digits line up and compare at a glance.',
    },
    features: {
      uk: ['Фільтр за періодом і власний діапазон дат', 'Порівняння з попереднім періодом', 'Графіки виручки, витрат і прибутку', 'Рейтинг популярних послуг', 'Список останніх замовлень', 'Експорт даних у CSV'],
      en: ['Period presets and custom date range', 'Comparison with the previous period', 'Revenue, cost and profit charts', 'Top services ranking', 'Latest orders list', 'CSV export'],
    },
    mobile: {
      uk: 'На телефоні KPI стають горизонтальною стрічкою, що гортається пальцем, графіки перебудовуються в одну колонку, а підказки на графіку працюють дотиком.',
      en: 'On phones the KPIs become a swipeable strip, charts stack into one column, and chart tooltips respond to touch.',
    },
    tech: ['React', 'TypeScript', 'SVG charts, no chart libraries', 'CSV export', 'LocalStorage'],
  },
  {
    id: 'booking',
    title: { uk: 'Гребінь — онлайн-запис для барбершопу', en: 'Hrebin — barbershop online booking' },
    client: { uk: 'Концепт: барбершоп «Гребінь»', en: 'Concept: “Hrebin” barbershop' },
    year: '2026',
    task: {
      uk: 'Адміністратор пів дня відповідає на дзвінки «а є вільне на суботу?». Потрібен запис, який клієнт пройде за 30 секунд, і календар, де адміністратор бачить усіх майстрів одразу.',
      en: 'The front desk spends half the day answering “anything free on Saturday?”. The goal: a booking flow a client completes in 30 seconds, and a calendar where the admin sees every barber at once.',
    },
    design: {
      uk: 'Теплий папір, глибокий зелений і курсивна антиква — атмосфера класичної перукарні без кліше з вусами й бритвами. Великі кнопки-«пігулки» зручно натискати великим пальцем.',
      en: 'Warm paper, deep green and an italic serif — the feel of a classic barbershop without the moustache-and-razor clichés. Large pill buttons are easy to hit with a thumb.',
    },
    features: {
      uk: ['Вибір послуги, майстра, дати й часу', 'Ціна й тривалість одразу видно', 'Підтвердження з кодом запису', 'Перенесення та скасування', 'Календар адміністратора на тиждень'],
      en: ['Service, barber, date and time selection', 'Price and duration up front', 'Confirmation with booking code', 'Reschedule and cancel', 'Weekly admin calendar'],
    },
    mobile: {
      uk: 'Кроки запису на телефоні йдуть один за одним, а підсумок закріплений унизу екрана — ціна й кнопка завжди під пальцем.',
      en: 'On phones the steps follow one another and the summary is pinned to the bottom — price and button always within thumb reach.',
    },
    tech: ['React', 'TypeScript', 'Slot generation', 'LocalStorage'],
  },
  {
    id: 'menu',
    title: { uk: 'Полум’я — цифрове меню ресторану', en: 'Polumia — restaurant digital menu' },
    client: { uk: 'Концепт: ресторан відкритого вогню «Полум’я»', en: 'Concept: “Polumia” open-fire restaurant' },
    year: '2026',
    task: {
      uk: 'Гості сканують QR-код і чекають офіціанта, щоб зробити замовлення. Потрібне меню, у якому можна обрати страву, додати інгредієнти, оформити замовлення до столика й бачити, коли воно буде готове.',
      en: 'Guests scan a QR code and still wait for a waiter to order. The goal: a menu where they pick dishes, add extras, order to their table and see when it will be ready.',
    },
    design: {
      uk: 'Теракота й оливковий, як кераміка та вугілля печі. Ілюстрації страв зверху — так, як гість бачить тарілку на столі. Інтерфейс розрахований на одну руку.',
      en: 'Terracotta and olive, like clay and embers. Dishes are drawn from above — the way a guest sees the plate. The UI is built for one-handed use.',
    },
    features: {
      uk: ['Категорії та пошук', 'Фільтри: вегетаріанське, гостре, без глютену', 'Добавки з автоматичним перерахунком', 'Кошик і оформлення', 'Відстеження статусу замовлення'],
      en: ['Categories and search', 'Filters: vegetarian, spicy, gluten-free', 'Add-ons with live price', 'Cart and checkout', 'Order status tracking'],
    },
    mobile: {
      uk: 'Створено насамперед для смартфона: нижні панелі, великі зони натискання, закріплена кнопка кошика. На комп’ютері меню відкривається в рамці телефона.',
      en: 'Built phone-first: bottom sheets, large tap targets, a pinned cart button. On desktop it opens inside a phone frame.',
    },
    tech: ['React', 'TypeScript', 'SVG illustrations', 'LocalStorage'],
  },
  {
    id: 'crm',
    title: { uk: 'Pipeline — CRM для студії ремонту', en: 'Pipeline — CRM for a renovation studio' },
    client: { uk: 'Концепт: студія ремонту «Кут»', en: 'Concept: “Kut” renovation studio' },
    year: '2026',
    task: {
      uk: 'Заявки губляться між месенджерами, нотатками й пам’яттю менеджера. Потрібна проста CRM: база клієнтів, воронка угод і нагадування, щоб жоден клієнт не залишився без відповіді.',
      en: 'Leads get lost between messengers, notes and a manager’s memory. The goal: a simple CRM — client base, deal pipeline and reminders, so no client is left without a reply.',
    },
    design: {
      uk: 'Щільний робочий інтерфейс: світло-сірий фон, чіткі таблиці й один синій колір для дій. Усе, що потрібно щодня, — на відстані одного кліку.',
      en: 'A dense working interface: light grey, crisp tables and one blue for actions. Everything you need daily is one click away.',
    },
    features: {
      uk: ['База клієнтів із пошуком і фільтрами', 'Картка клієнта та історія замовлень', 'Додавання й редагування', 'Канбан із перетягуванням угод', 'Потенційна виручка з урахуванням етапу', 'Задачі й нагадування'],
      en: ['Client base with search and filters', 'Client card and order history', 'Add and edit clients', 'Drag-and-drop deal board', 'Stage-weighted pipeline value', 'Tasks and reminders'],
    },
    mobile: {
      uk: 'Канбан на телефоні гортається колонками, картки перетягуються пальцем, а таблиця клієнтів перетворюється на список.',
      en: 'On phones the kanban scrolls column by column, cards drag with a finger, and the client table turns into a list.',
    },
    tech: ['React', 'TypeScript', 'Pointer Events drag & drop', 'LocalStorage'],
  },
  {
    id: 'store',
    title: { uk: 'ЛЬОН — магазин лляного одягу', en: 'LON — linen clothing store' },
    client: { uk: 'Концепт: бренд лляного одягу «Льон»', en: 'Concept: “Lon” linen clothing brand' },
    year: '2026',
    task: {
      uk: 'Невеликий бренд продає через Instagram і губить замовлення в директі. Потрібен магазин, який виглядає дорого, але купити в ньому так само просто, як написати повідомлення.',
      en: 'A small brand sells via Instagram and loses orders in DMs. The goal: a store that feels premium but makes buying as easy as sending a message.',
    },
    design: {
      uk: 'Пісочні тони, велика розріджена типографіка й багато повітря навколо товару — як у друкованому лукбуці. Жодних банерів зі знижками, що кричать.',
      en: 'Sand tones, large tracked-out type and plenty of air around the product — like a printed lookbook. No shouting discount banners.',
    },
    features: {
      uk: ['Каталог і фільтри', 'Сторінка товару з кольорами й розмірами', 'Обране', 'Кошик і промокоди', 'Розрахунок доставки', 'Покрокове оформлення'],
      en: ['Catalog and filters', 'Product page with colors and sizes', 'Favorites', 'Cart and promo codes', 'Shipping calculation', 'Step-by-step checkout'],
    },
    mobile: {
      uk: 'Каталог у дві колонки, фільтри — у нижній панелі, кошик відкривається поверх сторінки й не збиває з думки.',
      en: 'Two-column catalog, filters in a bottom sheet, and a cart that slides over the page without breaking the flow.',
    },
    tech: ['React', 'TypeScript', 'SVG illustrations', 'LocalStorage'],
  },
  {
    id: 'estate',
    title: { uk: 'Квартал — платформа агентства нерухомості', en: 'Kvartal — real estate agency platform' },
    client: { uk: 'Концепт: агентство «Квартал»', en: 'Concept: “Kvartal” agency' },
    year: '2026',
    task: {
      uk: 'Покупці переглядають десятки квартир у різних вкладках і плутаються. Потрібен каталог, де можна відфільтрувати, порівняти кілька варіантів поруч, прикинути платіж і записатися на перегляд.',
      en: 'Buyers browse dozens of flats in different tabs and lose track. The goal: a catalog to filter, compare options side by side, estimate payments and book a viewing.',
    },
    design: {
      uk: 'Спокійна архітектурна палітра: білий, графітовий і латунний акцент. Планування квартир — як креслення, бо саме вони найбільше цікавлять покупця.',
      en: 'A calm architectural palette: white, slate and a brass accent. Floor plans are drawn like blueprints — they are what buyers care about most.',
    },
    features: {
      uk: ['Фільтри за ціною, площею й кімнатами', 'Галерея з плануванням', 'Порівняння до трьох квартир', 'Обране', 'Орієнтовний іпотечний калькулятор', 'Запис на перегляд'],
      en: ['Price, area and room filters', 'Gallery with floor plan', 'Compare up to three flats', 'Favorites', 'Indicative mortgage calculator', 'Viewing requests'],
    },
    mobile: {
      uk: 'Фото гортаються свайпом, порівняння стає горизонтальною таблицею, а калькулятор працює повзунками, зручними для пальця.',
      en: 'Photos swipe, the comparison becomes a horizontal table, and the calculator uses thumb-friendly sliders.',
    },
    tech: ['React', 'TypeScript', 'SVG floor plans', 'LocalStorage'],
  },
];
