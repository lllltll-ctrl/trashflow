/* Shared strings + tiny i18n context used across all pages. */
/* global React */

const T = {
  ua: {
    appName: 'TrashFlow',
    city: 'Прилуки',
    home: 'Головна',
    classify: 'Класифікація',
    classifyShort: 'Фото',
    points: 'Точки',
    pointsShort: 'Мапа',
    schedule: 'Графік',
    scheduleShort: 'Графік',
    rules: 'Правила',
    rulesShort: 'Сорт',
    report: 'Скарга',
    reportShort: 'Скарга',
    back: 'Назад',

    // Classify
    classifyEyebrow: 'AI-підказка',
    classifyTitle: ['Сфотографуй ', 'сміття', ' — підкажемо, куди здати.'],
    classifySub: 'Модель розпізнає 6 категорій за 2 секунди. Працює офлайн.',
    takePhoto: 'Зробити фото',
    uploadPhoto: 'Завантажити з галереї',
    recent: 'Нещодавні',
    confidence: 'Впевненість',
    whereTo: 'Куди здати',
    howPrep: 'Як підготувати',
    tryAnother: 'Спробувати інше фото',

    // Points
    pointsEyebrow: 'Точки прийому',
    pointsTitle: ['12 активних ', 'точок', ' у громаді'],
    pointsSub: 'Оберіть категорію, щоб побачити найближчі пункти прийому.',
    nearby: 'Поруч із вами',
    openNow: 'Зараз відкрито',
    distance: 'км',
    allCat: 'Усі',
    getDirections: 'Маршрут',

    // Schedule
    scheduleEyebrow: 'Цей тиждень',
    scheduleTitle: ['Коли під’їжджає ', 'бригада', '?'],
    scheduleSub: 'Сповіщення за 30 хвилин до вивозу. Налаштуйте адресу.',
    today: 'Сьогодні',
    tomorrow: 'Завтра',
    nextPickup: 'Наступний вивіз',
    subscribe: 'Сповіщати мене',
    address: 'Адреса',

    // Rules
    rulesEyebrow: '5 категорій сортування',
    rulesTitle: ['Як сортувати ', 'правильно', '.'],
    rulesSub: 'Коротко: що у який контейнер. Гортайте картки.',
    doList: 'Можна',
    dontList: 'Не можна',
    learnMore: 'Детальніше',

    // Report
    reportEyebrow: 'Повідомити про звалище',
    reportTitle: ['Знайшли ', 'проблему', '?'],
    reportSub: 'Надішліть фото й координати — диспетчер надасть бригаду.',
    photo: 'Фото',
    location: 'Локація',
    description: 'Опис (необов’язково)',
    placeholderDesc: 'Мішки з будівельним сміттям біля трансформатора…',
    send: 'Надіслати',
    step: 'Крок',
    of: 'з',
    submitted: 'Скаргу прийнято',
    track: 'Відстежити',
  },
  en: {
    appName: 'TrashFlow',
    city: 'Pryluky',
    home: 'Home',
    classify: 'Classify',
    classifyShort: 'Scan',
    points: 'Points',
    pointsShort: 'Map',
    schedule: 'Schedule',
    scheduleShort: 'Pickup',
    rules: 'Rules',
    rulesShort: 'Sort',
    report: 'Report',
    reportShort: 'Report',
    back: 'Back',

    classifyEyebrow: 'AI assist',
    classifyTitle: ['Snap your ', 'waste', ' — we’ll tell you where it goes.'],
    classifySub: 'Recognises 6 categories in 2 seconds. Works offline.',
    takePhoto: 'Take a photo',
    uploadPhoto: 'Upload from gallery',
    recent: 'Recent',
    confidence: 'Confidence',
    whereTo: 'Where to drop',
    howPrep: 'How to prep',
    tryAnother: 'Try another photo',

    pointsEyebrow: 'Drop-off points',
    pointsTitle: ['12 active ', 'points', ' in the district'],
    pointsSub: 'Pick a category to see the nearest collection points.',
    nearby: 'Near you',
    openNow: 'Open now',
    distance: 'km',
    allCat: 'All',
    getDirections: 'Directions',

    scheduleEyebrow: 'This week',
    scheduleTitle: ['When is the ', 'truck', ' coming?'],
    scheduleSub: 'We’ll ping you 30 minutes ahead. Set your address once.',
    today: 'Today',
    tomorrow: 'Tomorrow',
    nextPickup: 'Next pickup',
    subscribe: 'Notify me',
    address: 'Address',

    rulesEyebrow: '5 sorting categories',
    rulesTitle: ['How to sort ', 'properly', '.'],
    rulesSub: 'Plain language: what goes in which bin. Swipe the cards.',
    doList: 'Do',
    dontList: 'Don’t',
    learnMore: 'Learn more',

    reportEyebrow: 'Report a dump site',
    reportTitle: ['Found a ', 'problem', '?'],
    reportSub: 'Send a photo and location — a crew will be dispatched.',
    photo: 'Photo',
    location: 'Location',
    description: 'Description (optional)',
    placeholderDesc: 'Construction waste bags by the transformer…',
    send: 'Send',
    step: 'Step',
    of: 'of',
    submitted: 'Report received',
    track: 'Track status',
  },
};

const CATS = [
  { id: 'plastic', ua: 'Пластик',  en: 'Plastic',  color: 'var(--c-plastic)',  bg: 'var(--c-plastic-bg)',  glyph: '◌' },
  { id: 'glass',   ua: 'Скло',     en: 'Glass',    color: 'var(--c-glass)',    bg: 'var(--c-glass-bg)',    glyph: '◇' },
  { id: 'paper',   ua: 'Папір',    en: 'Paper',    color: 'var(--c-paper)',    bg: 'var(--c-paper-bg)',    glyph: '◱' },
  { id: 'organic', ua: 'Органіка', en: 'Organic',  color: 'var(--c-organic)',  bg: 'var(--c-organic-bg)',  glyph: '❦' },
  { id: 'metal',   ua: 'Метал',    en: 'Metal',    color: 'var(--c-metal)',    bg: 'var(--c-metal-bg)',    glyph: '◐' },
  { id: 'battery', ua: 'Батарейки',en: 'Hazard',   color: 'var(--c-battery)',  bg: 'var(--c-battery-bg)',  glyph: '⚡' },
];

const LangCtx = React.createContext({ lang: 'ua', t: T.ua, setLang: () => {} });

function useT() { return React.useContext(LangCtx); }

/* ============ Layout primitives ============ */

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="statusbar-right" aria-hidden>
        <span style={{ fontSize: 11, letterSpacing: 1 }}>••• </span>
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none"><path d="M1 10L1 8M5 10L5 6M9 10L9 4M13 10L13 2M17 10L17 0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><rect x="21.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}

function PageHead({ title, onBack, right }) {
  return (
    <div className="page-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="page-head-title">{title}</div>
      </div>
      <div>{right}</div>
    </div>
  );
}

function TabBar({ current, go }) {
  const { t } = useT();
  const items = [
    { id: 'home',     label: t.home,          glyph: <HomeIcon /> },
    { id: 'classify', label: t.classifyShort, glyph: <ScanIcon /> },
    { id: 'points',   label: t.pointsShort,   glyph: <MapPinIcon /> },
    { id: 'schedule', label: t.scheduleShort, glyph: <ClockIcon /> },
    { id: 'rules',    label: t.rulesShort,    glyph: <SortIcon /> },
  ];
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {items.map(it => (
          <button
            key={it.id}
            className={`tab ${current === it.id ? 'active' : ''}`}
            onClick={() => go(it.id)}
          >
            <span className="tab-icon">{it.glyph}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ============ Icons (simple, line-weight consistent) ============ */

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 11L12 4L20 11V20H14V14H10V20H4V11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}
function ScanIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 9V5H8M20 9V5H16M4 15V19H8M20 15V19H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>;
}
function MapPinIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21C16 17 19 13.5 19 10C19 6.13 15.87 3 12 3C8.13 3 5 6.13 5 10C5 13.5 8 17 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>;
}
function ClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7.5V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function SortIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7H14M4 12H20M4 17H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M17 15L20 18L17 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function FlagIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 21V4M5 4H17L14.5 8L17 12H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function LeafIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 20C4 11 11 4 20 4C20 13 13 20 4 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M4 20L14 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

function HeroBand({ eyebrow, titleParts, sub, pale, right }) {
  return (
    <div className={`hero-band ${pale ? 'pale' : ''}`}>
      <div className="paper-grain" style={{ borderRadius: 'inherit' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="hero-eyebrow">{eyebrow}</div>
          <h1 className="hero-title">
            {titleParts[0]}<em>{titleParts[1]}</em>{titleParts[2]}
          </h1>
          {sub ? <p className="hero-sub">{sub}</p> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
    </div>
  );
}

function CatBadge({ cat, size = 'md' }) {
  const { lang } = useT();
  const label = cat[lang];
  return (
    <span className="cat-badge" style={{ background: cat.bg, color: cat.color }}>
      <span className="cat-dot" style={{ background: cat.color }} />
      {label}
    </span>
  );
}

// Export to window for other scripts.
Object.assign(window, {
  T, CATS, LangCtx, useT,
  StatusBar, PageHead, TabBar, HeroBand, CatBadge,
  HomeIcon, ScanIcon, MapPinIcon, ClockIcon, SortIcon, FlagIcon, LeafIcon,
});
