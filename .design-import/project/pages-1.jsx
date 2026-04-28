/* Home + Classify pages. */
/* global React, useT, CATS, PageHead, HeroBand, CatBadge, LeafIcon */

function HomePage({ go }) {
  const { t, lang } = useT();
  const tiles = [
    { id: 'classify', title: t.classify, sub: lang === 'ua' ? 'AI-розпізнавання' : 'AI recognition', glyph: '◎', accent: 'var(--yellow)' },
    { id: 'points',   title: t.points,   sub: lang === 'ua' ? '12 активних' : '12 active',            glyph: '◉', accent: 'var(--green-mint)' },
    { id: 'schedule', title: t.schedule, sub: lang === 'ua' ? 'Цей тиждень' : 'This week',            glyph: '◷', accent: 'var(--c-glass)' },
    { id: 'rules',    title: t.rules,    sub: lang === 'ua' ? '5 категорій' : '5 categories',         glyph: '❋', accent: 'var(--c-paper)' },
  ];

  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Dark hero — preserved from original design system. */}
      <div style={{
        position: 'relative',
        margin: '6px 14px 18px',
        padding: '24px 22px 26px',
        borderRadius: 28,
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 120% 70% at 50% -10%, #2FA560 0%, transparent 55%),
          radial-gradient(ellipse 80% 50% at 90% 110%, rgba(255,210,63,0.18) 0%, transparent 60%),
          linear-gradient(180deg, #0E3A23 0%, #185C38 65%, #0E3A23 100%)
        `,
        color: '#fff',
      }}>
        <div className="paper-grain" style={{ borderRadius: 'inherit', opacity: 0.15 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(160deg, #FFE27A, #FFD23F)',
              color: '#0E3A23', fontWeight: 800, fontSize: 18,
              transform: 'rotate(-6deg)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -3px 0 #C79908',
            }} aria-hidden>↻</span>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>{t.appName}</span>
          </div>
          <span style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)',
          }}>{t.city}</span>
        </div>

        {/* Bubble placeholder, small on home */}
        <div style={{ position: 'relative', margin: '22px auto 10px', width: 180, height: 180 }}>
          <Bubble />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.025em',
          margin: 0, textAlign: 'center', textWrap: 'pretty',
        }}>
          {lang === 'ua' ? <>Чистіша <em style={{ color: '#FFD23F', fontWeight: 500 }}>громада</em><br/>в три кліки</>
                         : <>A cleaner <em style={{ color: '#FFD23F', fontWeight: 500 }}>community</em><br/>in three taps</>}
        </h1>

        <button onClick={() => go('classify')} style={{
          marginTop: 22,
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10,
          padding: '16px 18px',
          borderRadius: 20,
          background: 'linear-gradient(120deg, #FFD23F, #FFE27A)',
          color: '#07231A',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 0 #C79908, 0 14px 28px -8px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.65 }}>
              {lang === 'ua' ? 'Почати' : 'Start'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
              {lang === 'ua' ? 'Сфотографувати сміття' : 'Photograph waste'}
            </div>
          </div>
          <span style={{
            display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: 14,
            background: '#0E3A23', color: '#FFD23F', fontSize: 22,
          }} aria-hidden>→</span>
        </button>
      </div>

      {/* Tile grid */}
      <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tiles.map(ti => (
          <button key={ti.id} onClick={() => go(ti.id)} style={{
            background: '#fff',
            border: '1px solid rgba(14,58,35,0.06)',
            borderRadius: 22, padding: 16, textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.15s ease',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 11,
              background: ti.accent, color: '#0E3A23',
              display: 'grid', placeItems: 'center', fontSize: 16, marginBottom: 10,
            }}>{ti.glyph}</div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{ti.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2 }}>{ti.sub}</div>
          </button>
        ))}
      </div>

      {/* Report banner */}
      <div style={{ padding: '14px 14px 4px' }}>
        <button onClick={() => go('report')} style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px',
          borderRadius: 20,
          background: 'linear-gradient(180deg, #FFF8E7 0%, #FFF1C9 100%)',
          border: '1px dashed rgba(199, 153, 8, 0.4)',
          color: '#4A3500',
          textAlign: 'left',
        }}>
          <span style={{
            display: 'grid', placeItems: 'center',
            width: 42, height: 42, borderRadius: 12,
            background: '#FFD23F', color: '#4A3500',
          }}>⚠</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
              {lang === 'ua' ? 'Побачили звалище?' : 'Spotted a dump?'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1 }}>
              {lang === 'ua' ? 'Надішліть фото — бригада приїде.' : 'Send a photo — we’ll dispatch a crew.'}
            </div>
          </div>
          <span style={{ fontSize: 18, opacity: 0.5 }}>→</span>
        </button>
      </div>
    </div>
  );
}

/* Small organic-looking bubble placeholder (the real page uses WebGL). */
function Bubble() {
  return (
    <svg viewBox="0 0 180 180" width="100%" height="100%">
      <defs>
        <radialGradient id="bub" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="40%" stopColor="rgba(200,255,220,0.25)" />
          <stop offset="100%" stopColor="rgba(14,58,35,0.0)" />
        </radialGradient>
        <radialGradient id="bub-ring" cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="rgba(255,255,255,0)" />
          <stop offset="92%" stopColor="rgba(255,226,122,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="90" cy="90" r="78" fill="url(#bub-ring)" />
      <circle cx="90" cy="90" r="72" fill="url(#bub)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <ellipse cx="65" cy="60" rx="18" ry="10" fill="rgba(255,255,255,0.5)" transform="rotate(-30 65 60)" />
    </svg>
  );
}

/* =========================== CLASSIFY =========================== */

function ClassifyPage({ go }) {
  const { t, lang } = useT();
  const [stage, setStage] = React.useState('start'); // start | scanning | result
  const [cat, setCat] = React.useState(null);

  const startScan = () => {
    setStage('scanning');
    const chosen = CATS[Math.floor(Math.random() * CATS.length)];
    setTimeout(() => { setCat(chosen); setStage('result'); }, 1800);
  };
  const reset = () => { setStage('start'); setCat(null); };

  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHead title={t.classify} onBack={() => go('home')} />
      <div className="page-body">

        {stage === 'start' && (
          <>
            <HeroBand
              eyebrow={t.classifyEyebrow}
              titleParts={t.classifyTitle}
              sub={t.classifySub}
            />

            {/* Camera window */}
            <div style={{
              margin: '6px 0 14px',
              aspectRatio: '4 / 5',
              borderRadius: 28,
              background: 'linear-gradient(160deg, #0E3A23 0%, #185C38 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div className="paper-grain" style={{ borderRadius: 'inherit', opacity: 0.2 }} />
              {/* Corner brackets */}
              {[0,1,2,3].map(i => {
                const pos = [
                  { top: 18, left: 18 }, { top: 18, right: 18 },
                  { bottom: 18, left: 18 }, { bottom: 18, right: 18 },
                ][i];
                const rot = [0, 90, -90, 180][i];
                return (
                  <div key={i} style={{ position: 'absolute', ...pos, width: 26, height: 26, transform: `rotate(${rot}deg)` }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 2, background: '#FFD23F', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 22, background: '#FFD23F', borderRadius: 2 }} />
                  </div>
                );
              })}
              {/* Center prompt */}
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                color: 'rgba(255,255,255,0.75)', textAlign: 'center', padding: 24,
              }}>
                <div>
                  <div style={{
                    margin: '0 auto 12px', width: 54, height: 54, borderRadius: '50%',
                    border: '1.5px dashed rgba(255,255,255,0.35)',
                    display: 'grid', placeItems: 'center', fontSize: 22, color: '#FFD23F',
                  }}>◎</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 20, letterSpacing: '-0.02em' }}>
                    {lang === 'ua' ? 'Наведіть камеру' : 'Point the camera'}
                  </div>
                  <div style={{ fontSize: 12.5, opacity: 0.6, marginTop: 4 }}>
                    {lang === 'ua' ? 'на об’єкт у центрі кадру' : 'at the object in the frame'}
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={startScan}>
              <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }}>◉</span>
              {t.takePhoto}
            </button>
            <button className="btn-secondary" style={{ marginTop: 10, width: '100%' }}>
              {t.uploadPhoto}
            </button>

            {/* Recent scans */}
            <div style={{ marginTop: 28 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10,
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--green-deep)', letterSpacing: '-0.02em' }}>
                  {t.recent}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>
                  24H
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, margin: '0 -20px', padding: '0 20px' }}>
                {CATS.slice(0, 4).map((c, i) => (
                  <div key={c.id} style={{
                    minWidth: 130, padding: 12,
                    borderRadius: 18, background: '#fff',
                    border: '1px solid rgba(14,58,35,0.06)',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: '100%', height: 72, borderRadius: 12,
                      background: c.bg, color: c.color,
                      display: 'grid', placeItems: 'center', fontSize: 30,
                      marginBottom: 8,
                    }}>{c.glyph}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c[lang]}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                      {i + 1}h {lang === 'ua' ? 'тому' : 'ago'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {stage === 'scanning' && (
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <div style={{
              margin: '0 auto 24px', width: 180, height: 180, position: 'relative',
            }}>
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(14,58,35,0.08)" strokeWidth="3" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="var(--green-light)"
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="500"
                  style={{ animation: 'drawRing 1.5s ease-in-out infinite', transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <LeafIcon size={36} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--green-deep)', letterSpacing: '-0.02em' }}>
              {lang === 'ua' ? 'Розпізнаємо…' : 'Analysing…'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 6 }}>
              {lang === 'ua' ? 'Модель порівнює форму, колір, текстуру' : 'Comparing shape, colour, texture'}
            </div>
          </div>
        )}

        {stage === 'result' && cat && (
          <div className="fade-slide">
            {/* Result card */}
            <div style={{
              borderRadius: 28, padding: 22,
              background: `linear-gradient(160deg, ${cat.bg} 0%, #fff 100%)`,
              border: `1px solid ${cat.color}22`,
              position: 'relative', overflow: 'hidden',
              marginBottom: 16,
            }}>
              <div style={{
                position: 'absolute', top: -30, right: -20, fontSize: 150,
                color: cat.color, opacity: 0.08, lineHeight: 1, fontFamily: 'var(--font-display)',
              }}>{cat.glyph}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.22em', textTransform: 'uppercase', color: cat.color }}>
                {lang === 'ua' ? 'Розпізнано' : 'Detected'}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 38,
                letterSpacing: '-0.03em', marginTop: 4, color: 'var(--green-deep)',
              }}>
                {cat[lang]}
              </div>
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  {t.confidence.toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green-deep)' }}>94%</div>
              </div>
              <div style={{ marginTop: 6, height: 6, background: 'rgba(14,58,35,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '94%', height: '100%', background: cat.color, borderRadius: 3 }} />
              </div>
            </div>

            {/* Where to */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 10 }}>
                {t.whereTo}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="ph-img" style={{ width: 56, height: 56, flexShrink: 0 }}>MAP</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {lang === 'ua' ? 'Пункт №3, вул. Київська 12' : 'Point #3, Kyivska st. 12'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
                    0.6 {t.distance} · {t.openNow}
                  </div>
                </div>
                <button className="btn-ghost" onClick={() => go('points')}>→</button>
              </div>
            </div>

            {/* How to prep */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 10 }}>
                {t.howPrep}
              </div>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {(lang === 'ua' ? [
                  'Сполосніть від залишків',
                  'Зніміть етикетку, якщо легко',
                  'Стисніть, щоб зменшити обсяг',
                ] : [
                  'Rinse off residue',
                  'Remove label if easy',
                  'Flatten to save volume',
                ]).map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 2 ? '1px dashed rgba(14,58,35,0.1)' : 'none' }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: cat.bg, color: cat.color,
                      display: 'grid', placeItems: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button className="btn-primary" onClick={reset}>
              {t.tryAnother}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, ClassifyPage });
