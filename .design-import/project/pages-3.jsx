/* Rules + Report pages. */
/* global React, useT, CATS, PageHead, HeroBand, CatBadge */

function RulesPage({ go }) {
  const { t, lang } = useT();
  const [open, setOpen] = React.useState(null);

  const rules = CATS.map(c => {
    const ua = {
      plastic: { doList: ['Пляшки PET 1–7', 'Плівка та пакети', 'Кришки окремо'], dontList: ['Брудний пластик', 'Памперси', 'Іграшки'] },
      glass:   { doList: ['Пляшки, банки', 'Скло будь-якого кольору', 'Без кришок і етикеток'], dontList: ['Дзеркала, вікна', 'Лампи', 'Порцеляна'] },
      paper:   { doList: ['Газети, журнали', 'Картон (складений)', 'Папір для принтера'], dontList: ['Чеки (термопапір)', 'Жирні обгортки', 'Серветки'] },
      organic: { doList: ['Залишки їжі', 'Шкірки, листя', 'Кавова гуща'], dontList: ['М’ясо й кістки', 'Масло, жир', 'Пакетики чаю зі скобами'] },
      metal:   { doList: ['Алюмінієві банки', 'Бляшанки з-під консерв', 'Кришки від банок'], dontList: ['Балончики під тиском', 'Фарба', 'Електроніка'] },
      battery: { doList: ['Побутові батарейки AA/AAA', 'Акумулятори телефонів', 'Лампи-економки'], dontList: ['Автомобільні АКБ (окремий пункт)', 'Розбиті термометри', 'Промислові хімікати'] },
    };
    const en = {
      plastic: { doList: ['PET bottles 1–7', 'Film and bags', 'Caps separately'], dontList: ['Dirty plastic', 'Diapers', 'Toys'] },
      glass:   { doList: ['Bottles, jars', 'Any colour glass', 'Caps and labels removed'], dontList: ['Mirrors, windows', 'Light bulbs', 'Porcelain'] },
      paper:   { doList: ['Newspapers, magazines', 'Flattened cardboard', 'Printer paper'], dontList: ['Receipts (thermal)', 'Greasy wrappers', 'Napkins'] },
      organic: { doList: ['Food scraps', 'Peels, leaves', 'Coffee grounds'], dontList: ['Meat and bones', 'Oil, fat', 'Tea bags with staples'] },
      metal:   { doList: ['Aluminium cans', 'Tin cans', 'Jar lids'], dontList: ['Pressurised cans', 'Paint', 'Electronics'] },
      battery: { doList: ['Household batteries AA/AAA', 'Phone batteries', 'CFL bulbs'], dontList: ['Car batteries (separate)', 'Broken thermometers', 'Industrial chemicals'] },
    };
    const lists = (lang === 'ua' ? ua : en)[c.id];
    return { ...c, ...lists };
  });

  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHead title={t.rules} onBack={() => go('home')} />
      <div className="page-body">
        <HeroBand pale eyebrow={t.rulesEyebrow} titleParts={t.rulesTitle} sub={t.rulesSub} />

        {/* Category visual grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
          {CATS.map(c => (
            <button key={c.id}
              onClick={() => { setOpen(c.id); setTimeout(() => document.getElementById(`rule-${c.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              style={{
                padding: 12, borderRadius: 16,
                background: c.bg,
                border: '1px solid rgba(14,58,35,0.05)',
                textAlign: 'center',
              }}>
              <div style={{
                margin: '2px auto 6px', width: 36, height: 36, borderRadius: 12,
                background: '#fff', color: c.color,
                display: 'grid', placeItems: 'center', fontSize: 20,
                boxShadow: 'inset 0 0 0 1px rgba(14,58,35,0.04)',
              }}>{c.glyph}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                {c[lang]}
              </div>
            </button>
          ))}
        </div>

        {/* Rule cards (expandable) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rules.map(r => (
            <div id={`rule-${r.id}`} key={r.id} style={{
              background: '#fff',
              borderRadius: 22,
              border: '1px solid rgba(14,58,35,0.06)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: 16, textAlign: 'left',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: r.bg, color: r.color,
                  display: 'grid', placeItems: 'center', fontSize: 22,
                  flexShrink: 0,
                }}>{r.glyph}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: 'var(--green-deep)' }}>
                    {r[lang]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
                    {r.doList.length} {lang === 'ua' ? 'правил' : 'items'} · {r.dontList.length} {lang === 'ua' ? 'заборон' : 'no-nos'}
                  </div>
                </div>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--green-pale)', color: 'var(--green-deep)',
                  display: 'grid', placeItems: 'center',
                  transform: open === r.id ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.25s ease',
                  fontSize: 14,
                }}>⌄</span>
              </button>

              {open === r.id && (
                <div style={{ padding: '0 16px 18px', borderTop: '1px dashed rgba(14,58,35,0.08)', paddingTop: 16 }} className="fade-slide">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green-light)', marginBottom: 8 }}>
                        ✓ {t.doList}
                      </div>
                      {r.doList.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                          <span style={{ color: 'var(--green-light)', flexShrink: 0, marginTop: 1 }}>•</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--c-battery)', marginBottom: 8 }}>
                        ✕ {t.dontList}
                      </div>
                      {r.dontList.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                          <span style={{ color: 'var(--c-battery)', flexShrink: 0, marginTop: 1 }}>•</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => go('points')} style={{
                    marginTop: 14, width: '100%',
                    padding: '10px 14px', borderRadius: 14,
                    background: r.bg, color: r.color,
                    fontWeight: 700, fontSize: 13,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {lang === 'ua' ? 'Де здати?' : 'Where to drop?'} →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================== REPORT =========================== */

function ReportPage({ go }) {
  const { t, lang } = useT();
  const [step, setStep] = React.useState(1);
  const [photo, setPhoto] = React.useState(false);
  const [loc, setLoc] = React.useState(false);
  const [desc, setDesc] = React.useState('');

  const canNext = step === 1 ? photo : step === 2 ? loc : true;
  const total = 3;

  if (step === 4) {
    return <ReportSubmitted go={go} />;
  }

  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHead title={t.report} onBack={() => step > 1 ? setStep(step - 1) : go('home')} />
      <div className="page-body">

        {/* Progress */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
          padding: '12px 14px', borderRadius: 14,
          background: 'var(--green-pale)',
        }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--green-deep)', textTransform: 'uppercase' }}>
            {t.step} {step}/{total}
          </div>
          <div style={{ flex: 1, height: 4, background: 'rgba(14,58,35,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(step / total) * 100}%`, height: '100%', background: 'var(--green-light)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        <HeroBand pale eyebrow={t.reportEyebrow} titleParts={t.reportTitle} sub={t.reportSub} />

        {/* STEP 1 — photo */}
        {step === 1 && (
          <div className="fade-slide">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 10 }}>
              1 · {t.photo}
            </div>
            <button onClick={() => setPhoto(!photo)} style={{
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: 24,
              background: photo
                ? 'linear-gradient(160deg, #2FA560 0%, #185C38 100%)'
                : 'repeating-linear-gradient(45deg, rgba(14,58,35,0.05) 0 10px, rgba(14,58,35,0.02) 10px 20px)',
              border: photo ? 'none' : '2px dashed rgba(14,58,35,0.2)',
              display: 'grid', placeItems: 'center',
              color: photo ? '#fff' : 'var(--ink-mute)',
              fontFamily: photo ? 'inherit' : 'var(--font-mono)',
              fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.25s ease',
            }}>
              {photo ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 42 }}>✓</div>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0, textTransform: 'none', fontFamily: 'inherit', marginTop: 4 }}>
                    {lang === 'ua' ? 'Фото додано' : 'Photo added'}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'var(--font-mono)', marginTop: 4 }}>IMG_4521.JPG · 2.3 MB</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, color: 'var(--green-light)' }}>◎</div>
                  <div style={{ marginTop: 8 }}>{lang === 'ua' ? 'Натисніть, щоб зняти' : 'Tap to capture'}</div>
                </div>
              )}
            </button>
          </div>
        )}

        {/* STEP 2 — location */}
        {step === 2 && (
          <div className="fade-slide">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 10 }}>
              2 · {t.location}
            </div>
            <div style={{
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
              height: 260,
              background: `
                radial-gradient(ellipse 60% 40% at 30% 30%, rgba(111,211,154,0.35) 0%, transparent 70%),
                linear-gradient(165deg, #E8F5EC 0%, #F4F9F1 100%)`,
              border: '1px solid rgba(14,58,35,0.08)',
            }}>
              <svg viewBox="0 0 400 260" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <g stroke="rgba(14,58,35,0.12)" strokeWidth="1.5" fill="none">
                  <path d="M-10 90 Q 100 70 200 100 T 410 120" />
                  <path d="M-10 160 Q 150 140 260 170 T 410 190" />
                  <path d="M80 -10 Q 100 100 110 270" />
                  <path d="M230 -10 Q 240 100 255 270" />
                </g>
              </svg>
              {/* Drop pin */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -100%)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50% 50% 50% 2px',
                  background: loc ? 'var(--c-battery)' : 'var(--green-light)',
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 8px 20px -4px rgba(0,0,0,0.35)',
                  border: '3px solid #fff',
                  display: 'grid', placeItems: 'center',
                  animation: loc ? 'none' : 'fadeSlide 0.4s ease both',
                }}>
                  <div style={{ transform: 'rotate(45deg)', width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>

              <button onClick={() => setLoc(true)} style={{
                position: 'absolute', bottom: 14, left: 14, right: 14,
                padding: '12px 16px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                color: 'var(--green-deep)',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loc ? '✓' : '⌖'} {loc
                  ? (lang === 'ua' ? 'Локацію зафіксовано' : 'Location set')
                  : (lang === 'ua' ? 'Використати моє місце' : 'Use my location')}
              </button>
            </div>

            {loc && (
              <div className="card fade-slide" style={{ marginTop: 12, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)' }} />
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--ink-soft)' }}>
                  50.594231, 32.393810
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)' }}>±5м</div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — description */}
        {step === 3 && (
          <div className="fade-slide">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 10 }}>
              3 · {t.description}
            </div>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder={t.placeholderDesc}
              rows={5}
              style={{
                width: '100%', resize: 'none',
                padding: 16,
                borderRadius: 20,
                border: '1px solid rgba(14,58,35,0.1)',
                background: '#fff',
                fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {(lang === 'ua'
                ? ['Будівельне сміття', 'Стихійне звалище', 'Переповнений контейнер', 'Небезпечні відходи']
                : ['Construction waste', 'Illegal dump', 'Overflowing bin', 'Hazardous waste']
              ).map(tag => (
                <button key={tag} className="chip outline"
                  onClick={() => setDesc(desc ? `${desc}, ${tag.toLowerCase()}` : tag)}>
                  + {tag}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="card" style={{ marginTop: 18, padding: 16 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>
                {lang === 'ua' ? 'Перегляд' : 'Review'}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
                <div className="ph-img" style={{ width: 48, height: 48, flexShrink: 0 }}>IMG</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{lang === 'ua' ? 'Фото додано' : 'Photo attached'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 2 }}>50.594, 32.394 · ±5м</div>
                </div>
                <span style={{ color: 'var(--green-light)' }}>✓</span>
              </div>
            </div>
          </div>
        )}

        <button
          className="btn-primary"
          style={{ marginTop: 24, opacity: canNext ? 1 : 0.4, pointerEvents: canNext ? 'auto' : 'none' }}
          onClick={() => step < 3 ? setStep(step + 1) : setStep(4)}>
          {step < 3 ? (lang === 'ua' ? 'Далі' : 'Continue') : t.send}
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

function ReportSubmitted({ go }) {
  const { t, lang } = useT();
  return (
    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '40px 20px' }}>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            margin: '0 auto 24px', width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(165deg, var(--green-light), var(--green-mid))',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontSize: 42,
            boxShadow: '0 14px 40px -10px rgba(14,58,35,0.35)',
          }}>✓</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 32,
            letterSpacing: '-0.03em', color: 'var(--green-deep)',
          }}>
            {t.submitted}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 8, lineHeight: 1.5 }}>
            {lang === 'ua'
              ? 'Диспетчер отримав вашу скаргу. Орієнтовний час реагування — 48 годин.'
              : 'Dispatch received your report. Estimated response time — 48 hours.'}
          </div>

          <div style={{
            marginTop: 24, padding: 14, borderRadius: 16,
            background: 'var(--green-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
                {lang === 'ua' ? 'Номер скарги' : 'Report ID'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--green-deep)', marginTop: 2 }}>
                TF-2026-0417
              </div>
            </div>
            <button className="btn-ghost" style={{ background: '#fff', padding: '8px 12px' }}>
              {t.track} →
            </button>
          </div>

          <button className="btn-secondary" style={{ marginTop: 14, width: '100%' }} onClick={() => go('home')}>
            {lang === 'ua' ? 'На головну' : 'Back home'}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RulesPage, ReportPage });
