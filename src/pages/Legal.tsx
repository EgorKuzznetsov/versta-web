import React from 'react';
import { useT } from '../core/i18n';
import { useRoute } from '../core/router';
import { Seo } from '../components/Chrome';
import site from '../config/site.json';
import NotFound from './NotFound';

const F = ({ v }: { v: string }) => {
  const { t } = useT();
  return v ? <>{v}</> : <mark className="ph">[{t.legal.placeholder}]</mark>;
};

export default function Legal() {
  const { t, lang } = useT();
  const r = useRoute();
  const doc = r.segs[1];
  const l = site.legal;
  const B = (v: unknown) => (typeof v === 'string' ? v : (v as Record<string, string> | undefined)?.[lang] || '');
  const owner = <F v={B(l.ownerName)} />;
  const email = <F v={l.email || site.contacts.email} />;
  const docs: Record<string, { uk: React.ReactNode; en: React.ReactNode; title: string }> = {
    privacy: {
      title: t.footer.privacy,
      uk: (
        <>
          <h2>1. Хто відповідає за дані</h2>
          <p>Відповідальна особа: {owner}, {<F v={B(l.legalForm)} />}, адреса: {<F v={B(l.address)} />}, телефон: <a href={'tel:' + l.phone.replace(/[^\d+]/g, '')}>{l.phone}</a>, email: {email}.</p>
          <h2>2. Які дані ми обробляємо</h2>
          <p>Лише ті, які ви самі залишаєте у формі заявки: ім’я, назву бізнесу, контакт для зв’язку та опис проєкту. Демо в розділі Demo Lab не передають жодних даних - усе, що ви вводите там, зберігається тільки у вашому браузері (localStorage) і може бути видалене кнопкою «Скинути демо» або очищенням даних браузера.</p>
          <h2>3. Мета та правова підстава</h2>
          <p>Дані використовуються виключно для відповіді на ваш запит і підготовки пропозиції (ст. 6(1)(b) GDPR - дії до укладення договору; Закон України «Про захист персональних даних» - згода суб’єкта).</p>
          <h2>4. Сервіси третіх сторін</h2>
          <p>Хостинг і обробка форми: Cloudflare Workers (Cloudflare, Inc.). IP-адреса використовується лише тимчасово для захисту форми від спаму й не зберігається на сайті. Доставка заявки: Telegram (Telegram Messenger Inc.) та email через Resend (Resend, Inc.) на скриньку Gmail (Google LLC). Шрифти: Bunny Fonts (BunnyWay d.o.o.). Аналітика й рекламні трекери не використовуються, cookies сайт не встановлює.</p>
          <h2>5. Строк зберігання</h2>
          <p>Сайт не зберігає заявки у власній базі: вони одразу пересилаються нам у Telegram і на email. Там дані зберігаються, доки це потрібно для комунікації щодо проєкту, але не довше 6 місяців, якщо договір не укладено; після цього ми їх видаляємо. Якщо договір укладено, дані зберігаються на час його дії та в строки, передбачені законодавством. Ви можете попросити видалити свої дані раніше, написавши на {email}.</p>
          <h2>6. Ваші права</h2>
          <p>Ви маєте право на доступ, виправлення, видалення, обмеження обробки, перенесення даних і заперечення проти обробки, а також право подати скаргу до наглядового органу. Для цього напишіть на {email}.</p>
        </>
      ),
      en: (
        <>
          <h2>1. Controller</h2>
          <p>Responsible person: {owner}, {<F v={B(l.legalForm)} />}, address: {<F v={B(l.address)} />}, phone: <a href={'tel:' + l.phone.replace(/[^\d+]/g, '')}>{l.phone}</a>, email: {email}.</p>
          <h2>2. What data we process</h2>
          <p>Only what you provide in the enquiry form: your name, business name, contact details and project description. The Demo Lab demos transmit no data - anything you enter there is stored only in your browser (localStorage) and can be deleted with “Reset demo” or by clearing your browser data.</p>
          <h2>3. Purpose and legal basis</h2>
          <p>Data is used solely to respond to your enquiry and prepare a proposal (Art. 6(1)(b) GDPR - pre-contractual steps).</p>
          <h2>4. Third-party services</h2>
          <p>Hosting and form processing: Cloudflare Workers (Cloudflare, Inc.). Your IP address is used only briefly to protect the form from spam and is not stored on the site. Enquiry delivery: Telegram (Telegram Messenger Inc.) and email via Resend (Resend, Inc.) to a Gmail inbox (Google LLC). Fonts: Bunny Fonts (BunnyWay d.o.o.). No analytics or advertising trackers are used, and the site sets no cookies.</p>
          <h2>5. Retention</h2>
          <p>The site does not keep enquiries in its own database: they are forwarded straight to us via Telegram and email. There, data is kept as long as needed to communicate about the project, and no longer than 6 months if no contract is concluded; after that we delete it. If a contract is concluded, data is kept for its duration and for the periods required by law. You can ask us to delete your data earlier at {email}.</p>
          <h2>6. Your rights</h2>
          <p>You have the right to access, rectify, erase, restrict, port and object to processing, and to lodge a complaint with a supervisory authority. Contact {email}.</p>
        </>
      ),
    },
    terms: {
      title: t.footer.terms,
      uk: (
        <>
          <h2>1. Загальні положення</h2>
          <p>Сайт належить {owner}. Користуючись сайтом, ви погоджуєтеся з цими умовами.</p>
          <h2>2. Демонстраційні проєкти</h2>
          <p>Усі проєкти з позначкою Concept або Demo Project є концептами студії й не є роботами для реальних клієнтів. Дані в демо вигадані. Демо не проводять платежів і не оформлюють реальних замовлень.</p>
          <h2>3. Ціни</h2>
          <p>Ціни та терміни на сайті й у калькуляторі орієнтовні та не є публічною офертою. Остаточні умови фіксуються в договорі.</p>
          <h2>4. Інтелектуальна власність</h2>
          <p>Дизайн, тексти й код сайту захищені авторським правом. Копіювання без письмової згоди заборонене.</p>
          <h2>5. Контакти</h2>
          <p>З питань щодо умов пишіть на {email}.</p>
        </>
      ),
      en: (
        <>
          <h2>1. General</h2>
          <p>This website is operated by {owner}. By using it you agree to these terms.</p>
          <h2>2. Demo projects</h2>
          <p>All projects labelled Concept or Demo Project are studio concepts and not work for real clients. Demo data is fictional. Demos take no payments and place no real orders.</p>
          <h2>3. Prices</h2>
          <p>Prices and timelines on the site and in the calculator are estimates and not a binding offer. Final terms are set out in a contract.</p>
          <h2>4. Intellectual property</h2>
          <p>The design, copy and code of this site are protected by copyright. Copying without written permission is prohibited.</p>
          <h2>5. Contact</h2>
          <p>Questions about these terms: {email}.</p>
        </>
      ),
    },
  };
  const d = docs[doc];
  if (!d) return <NotFound />;
  return (
    <section className="legal">
      <Seo />
      <div className="wrap g12">
        <div className="legal-k"><span className="kicker">{t.footer.legal}</span></div>
        <div className="legal-c">
          <h1 className="d2">{d.title}</h1>
          <p className="mono muted">{t.legal.updated}: {l.lastUpdated}</p>
          <div className="prose">{d[lang]}</div>
        </div>
      </div>
    </section>
  );
}
