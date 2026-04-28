/* Points + Schedule pages. */
/* global React, useT, CATS, PageHead, HeroBand, CatBadge, MapPinIcon */

function PointsPage({ go }) {
  const { t, lang } = useT();
  const [filter, setFilter] = React.useState('all');

  const points = [
    { id: 1, name: lang === 'ua' ? 'Еко-двір №1' : 'Eco-yard #1', addr: lang === 'ua' ? 'вул. Київська 12' : 'Kyivska st. 12', dist: 0.6, cats: ['plastic','glass','paper','metal'], open: true, hours: '08:00–20:00' },
    { id: 2, name: lang === 'ua' ? 'Контейнер "Зелений ліс"' : 'Green Forest Bin', addr: lang === 'ua' ? 'пр. Миру 45' : 'Myru ave. 45', dist: 1.2, cats: ['plastic','paper'], open: true, hours: '24/7' },
    { id: 3, name: lang === 'ua' ? 'Пункт прийому скла' : 'Glass collection', addr: lang === 'ua' ? 'вул. Садова 3' : 'Sadova st. 3', dist: 1.8, cats: ['glass'], open: false, hours: '10:00–18:00' },
    { id: 4, name: lang === 'ua' ? 'Батарейки "Чисте місто"' : 'Batteries "Clean City"', addr: lang === 'ua' ? 'АТБ, Центральна' : 'ATB, Central', dist: 2.1, cats: ['battery'], open: true, hours: '09:00–22:00' },
    { id: 5, name: lang === 'ua' ? 'Металобаза' : 'Metal station', addr: lang === 'ua' ? 'вул. Промислова 7' : 'Promyslova st. 7', dist: 3.4, cats: ['metal'], open: true, hours: '08:00–17:00' },
  ];

  const filtered = filter === 'all' ? points : points.filter(p => p.cats.includes(filter));

  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHead title={t.points} onBack={() => go('home')} />
      <div className="page-body">

        {/* Map card — stylised, not a real map */}
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          height: 240,
          marginBottom: 14,
          background: `
            radial-gradient(ellipse 60% 40% at 30% 30%, rgba(111,211,154,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 75% 75%, rgba(74,164,184,0.20) 0%, transparent 70%),
            linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)
          `,
          border: '1px solid rgba(14,58,35,0.08)',
        }}>
          {/* Street grid */}
          <svg viewBox="0 0 400 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g stroke="rgba(14,58,35,0.12)" strokeWidth="1.5" fill="none">
              <path d="M-10 90 Q 100 70 200 100 T 410 120" />
              <path d="M-10 160 Q 150 140 260 170 T 410 190" />
              <path d="M80 -10 Q 100 100 110 260" />
              <path d="M230 -10 Q 240 100 255 260" />
              <path d="M340 -10 Q 330 120 350 260" />
            </g>
            <g stroke="rgba(14,58,35,0.25)" strokeWidth="1" strokeDasharray="3 4" fill="none">
              <path d="M30 40 L 370 40" />
            </g>
            {/* River */}
            <path d="M-10 210 Q 100 190 220 220 T 410 230" stroke="rgba(74,164,184,0.5)" strokeWidth="8" fill="none" />
          </svg>

          {/* Pins */}
          {filtered.slice(0, 4).map((p, i) => {
            const pos = [
              { top: '22%', left: '25%' },
              { top: '45%', left: '60%' },
              { top: '62%', left: '32%' },
              { top: '30%', left: '78%' },
            ][i];
            const catColor = p.cats[0] === 'plastic' ? 'var(--c-plastic)'
              : p.cats[0] === 'glass' ? 'var(--c-glass)'
              : p.cats[0] === 'paper' ? 'var(--c-paper)'
              : p.cats[0] === 'metal' ? 'var(--c-metal)'
              : p.cats[0] === 'battery' ? 'var(--c-battery)'
              : 'var(--green-light)';
            return (
              <div key={p.id} style={{ position: 'absolute', ...pos, transform: 'translate(-50%, -100%)' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50% 50% 50% 2px',
                  background: catColor,
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 6px 14px -4px rgba(0,0,0,0.3)',
                  border: '2px solid #fff',
                  display: 'grid', placeItems: 'center',
                }}>
                  <div style={{ transform: 'rotate(45deg)', width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>
            );
          })}

          {/* "You are here" */}
          <div style={{ position: 'absolute', top: '52%', left: '48%' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(47,165,96,0.3)', display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)', border: '2px solid #fff', boxShadow: '0 0 0 3px rgba(47,165,96,0.25)' }} />
            </div>
          </div>

          {/* Bottom overlay stats */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12, right: 12,
            display: 'flex', gap: 8, justifyContent: 'space-between',
          }}>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: 12,
              fontSize: 12, fontWeight: 600,
              color: 'var(--green-deep)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.6, letterSpacing: '0.1em' }}>LAT 50.59</span>
              <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.6, letterSpacing: '0.1em' }}>LON 32.39</span>
            </div>
            <button style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 12, fontSize: 12, fontWeight: 600, color: 'var(--green-deep)',
            }}>⌖ {lang === 'ua' ? 'Центрувати' : 'Recenter'}</button>
          </div>
        </div>

        <HeroBand pale eyebrow={t.pointsEyebrow} titleParts={t.pointsTitle} />

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -20px', padding: '2px 20px 14px' }}>
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} style={{ flexShrink: 0 }}>
            {t.allCat} · {points.length}
          </button>
          {CATS.map(c => {
            const count = points.filter(p => p.cats.includes(c.id)).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                className={`chip ${filter === c.id ? 'active' : ''}`}
                onClick={() => setFilter(c.id)}
                style={{
                  flexShrink: 0,
                  ...(filter === c.id ? { background: c.color } : {})
                }}>
                <span className="cat-dot" style={{ background: filter === c.id ? '#fff' : c.color }} />
                {c[lang]} · {count}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--green-deep)', letterSpacing: '-0.02em' }}>
            {t.nearby}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>
            {filtered.length} / {points.length}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'var(--green-pale)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--green-deep)', flexShrink: 0,
                }}><MapPinIcon /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green-deep)' }}>{p.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-light)', whiteSpace: 'nowrap' }}>
                      {p.dist} {t.distance}
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2 }}>{p.addr}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {p.cats.map(cid => {
                      const c = CATS.find(cc => cc.id === cid);
                      return <CatBadge key={cid} cat={c} />;
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(14,58,35,0.1)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12,
                      color: p.open ? 'var(--green-light)' : 'var(--c-battery)',
                      fontWeight: 600,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.open ? 'var(--green-light)' : 'var(--c-battery)' }} />
                      {p.open ? t.openNow : (lang === 'ua' ? 'Зачинено' : 'Closed')}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{p.hours}</span>
                    <button className="btn-ghost" style={{ marginLeft: 'auto', padding: '6px 10px', background: 'var(--green-pale)', color: 'var(--green-deep)' }}>
                      {t.getDirections} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================== SCHEDULE =========================== */

function SchedulePage({ go }) {
  const { t, lang } = useT();
  const [sub, setSub] = React.useState(false);

  const days = lang === 'ua'
    ? ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Schedule grid: which category is collected each day
  const week = [
    { day: 0, cat: 'plastic', time: '07:30' },
    { day: 1, cat: 'organic', time: '07:00' },
    { day: 2, cat: 'paper',   time: '08:15' },
    { day: 3, cat: 'organic', time: '07:00' },
    { day: 4, cat: 'glass',   time: '09:00' },
    { day: 5, cat: 'metal',   time: '10:00' },
    { day: 6, cat: null,      time: null },
  ];

  const todayIdx = 2; // Wed

  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHead title={t.schedule} onBack={() => go('home')}
        right={<button className="chip outline" style={{ padding: '6px 10px' }}>
          <span style={{ fontSize: 12 }}>⚙</span>
        </button>} />
      <div className="page-body">

        {/* Next pickup hero */}
        <div style={{
          margin: '6px 0 16px',
          padding: '22px 22px 20px',
          borderRadius: 28,
          background: `
            radial-gradient(ellipse 60% 50% at 100% 0%, rgba(111,211,154,0.45) 0%, transparent 60%),
            linear-gradient(165deg, #0E3A23 0%, #185C38 100%)`,
          color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="paper-grain" style={{ borderRadius: 'inherit', opacity: 0.15 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.6 }}>
              {t.nextPickup}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 62, lineHeight: 0.9, fontWeight: 400, letterSpacing: '-0.04em' }}>
                07<span style={{ color: '#FFD23F' }}>:</span>00
              </div>
              <div style={{ paddingBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{t.tomorrow}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>{lang === 'ua' ? 'четвер' : 'Thursday'}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CatBadge cat={CATS.find(c => c.id === 'organic')} />
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                · {lang === 'ua' ? 'Харчові відходи' : 'Food waste'}
              </span>
            </div>

            <button
              onClick={() => setSub(!sub)}
              style={{
                marginTop: 18, width: '100%',
                padding: '12px 16px',
                borderRadius: 16,
                background: sub ? '#FFD23F' : 'rgba(255,255,255,0.12)',
                color: sub ? 'var(--green-deep)' : '#fff',
                border: sub ? 'none' : '1px solid rgba(255,255,255,0.18)',
                fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s ease',
              }}>
              <span style={{ fontSize: 16 }}>{sub ? '✓' : '🔔'.replace(/\ufe0f/g, '')}</span>
              {sub ? (lang === 'ua' ? 'Сповіщення увімкнено' : 'Notifications on') : t.subscribe}
            </button>
          </div>
        </div>

        {/* Address chip */}
        <div className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--green-pale)', color: 'var(--green-deep)',
            display: 'grid', placeItems: 'center',
          }}><MapPinIcon /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.16em', color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
              {t.address}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
              {lang === 'ua' ? 'вул. Котляревського 23, кв. 4' : 'Kotlyarevskoho 23, apt. 4'}
            </div>
          </div>
          <button className="btn-ghost" style={{ padding: '6px 10px' }}>✎</button>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--green-deep)', letterSpacing: '-0.02em' }}>
            {lang === 'ua' ? 'Цей тиждень' : 'This week'}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>
            W17 · 2026
          </div>
        </div>

        {/* Week grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {week.map((w, i) => {
            const cat = w.cat ? CATS.find(c => c.id === w.cat) : null;
            const isToday = i === todayIdx;
            const isPast = i < todayIdx;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                borderRadius: 18,
                background: isToday ? 'linear-gradient(165deg, #FFF8E7 0%, #FFF1C9 100%)' : '#fff',
                border: isToday ? '1px solid rgba(199,153,8,0.25)' : '1px solid rgba(14,58,35,0.06)',
                opacity: isPast ? 0.5 : 1,
                boxShadow: isToday ? 'var(--shadow-md)' : 'none',
              }}>
                <div style={{
                  width: 48, textAlign: 'center', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
                    {days[i]}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 2, color: isToday ? 'var(--green-deep)' : 'var(--ink-soft)' }}>
                    {22 + i}
                  </div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(14,58,35,0.08)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {cat ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="cat-dot" style={{ background: cat.color }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{cat[lang]}</span>
                        {isToday && <span style={{
                          padding: '2px 8px', borderRadius: 999,
                          background: 'var(--yellow)', color: 'var(--green-deep)',
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>{t.today}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
                        {lang === 'ua' ? 'Бригада' : 'Crew'} #3 · {w.time}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic' }}>
                      {lang === 'ua' ? 'Без вивозу' : 'No pickup'}
                    </div>
                  )}
                </div>
                {cat && (
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: cat.bg, color: cat.color,
                    display: 'grid', placeItems: 'center', fontSize: 18,
                    flexShrink: 0,
                  }}>{cat.glyph}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PointsPage, SchedulePage });
