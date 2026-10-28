import { useEffect, useMemo, useRef, useState } from 'react'
import {
  NAV, PLATFORMS, OFFERS, PODCAST, TEACHER, CONTEXT, SITES, FACTS_TD, AUDIT, FUNNEL, SEO, CALC,
} from './data/content.js'

const rub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'

/* ------------------------------------------------------------ hooks */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

function useActiveSection(ids) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const onScroll = () => {
      let cur = ''
      ids.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 160) cur = id })
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return active
}

/* ------------------------------------------------------------ atoms */
const Check = () => (
  <svg className="check" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="currentColor" opacity=".18" />
    <path d="M5.5 10.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const List = ({ items }) => (
  <ul className="list">{items.map((t) => <li key={t}><Check /><span>{t}</span></li>)}</ul>
)
const Stat = ({ value, label }) => (<div className="stat"><b>{value}</b><span>{label}</span></div>)
const SubTitle = ({ children }) => <h3 className="subtitle reveal">{children}</h3>

const SectionHead = ({ n, stage, kicker, title, lead, dark }) => (
  <header className={`sec-head reveal ${dark ? 'on-dark' : ''}`}>
    <div className="sec-meta">
      <span className={`sec-n ${n.length > 2 ? 'word' : ''}`}>{n}</span>
      {stage && <span className="stage-chip">Клиент: «{stage}»</span>}
    </div>
    <div>
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  </header>
)

const WhyBox = ({ children }) => (
  <aside className="why reveal">
    <span className="why-t">Для «Тёплого дома»</span>
    <p>{children}</p>
  </aside>
)

/* ------------------------------------------------ live site preview */
const W = 1280
function SitePreview({ url, title, shot, ratio = 16 / 10, hint = 'Открыть сайт' }) {
  const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const box = useRef(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [scale, setScale] = useState(0.3)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { rootMargin: '300px' })
    io.observe(el)
    return () => { ro.disconnect(); io.disconnect() }
  }, [])

  return (
    <div className="bframe">
      <div className="bar">
        <i /><i /><i />
        <span className="addr">🔒 {host}</span>
        <a href={url} target="_blank" rel="noreferrer" className="ext">{hint} ↗</a>
      </div>
      <div className="viewport" ref={box} style={{ aspectRatio: String(ratio) }}>
        <div className={`skeleton ${loaded || shot ? 'off' : ''}`}><span>{host}</span></div>
        {shot ? (
          <img src={shot} alt={`Сайт ${title}`} loading="lazy" />
        ) : (
          visible && (
            <iframe
              title={title}
              src={url}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => setLoaded(true)}
              style={{ width: W, height: W / ratio, transform: `scale(${scale})` }}
            />
          )
        )}
        <a className="shield" href={url} target="_blank" rel="noreferrer" aria-label={`Открыть ${title}`} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------- video player */
function VideoPlayer() {
  const vids = PODCAST.videos
  const [i, setI] = useState(0)
  const [started, setStarted] = useState(false)
  const v = vids[i]
  if (!v) return null
  const src = `https://vkvideo.ru/video_ext.php?oid=${v.oid}&id=${v.id}${v.hash ? `&hash=${v.hash}` : ''}&hd=2${started ? '&autoplay=1' : ''}`
  return (
    <div className="player">
      <div className="player-screen">
        {started ? (
          <iframe key={v.id} title={v.title} src={src} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <button className="player-cover" onClick={() => setStarted(true)}>
            <span className="play-ico">▶</span>
            <strong>Смотреть: {v.title}</strong>
            <small>Видео открывается прямо на этой странице</small>
          </button>
        )}
      </div>
      <div className="episodes">
        {vids.map((x, idx) => (
          <button key={x.id} className={idx === i ? 'on' : ''} onClick={() => { setI(idx); setStarted(true) }}>
            <span>{String(idx + 1).padStart(2, '0')}</span>{x.title}
          </button>
        ))}
        <a href={`https://vkvideo.ru/video${v.oid}_${v.id}`} target="_blank" rel="noreferrer" className="all first">Не играет? Открыть в VK ↗</a>
        <a href={PODCAST.playlistUrl} target="_blank" rel="noreferrer" className="all">Весь плейлист ↗</a>
      </div>
    </div>
  )
}

function Faq({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="faq reveal">
      {items.map(([q, a], idx) => (
        <div key={q} className={`faq-item ${open === idx ? 'open' : ''}`}>
          <button onClick={() => setOpen(open === idx ? -1 : idx)} aria-expanded={open === idx}>{q}<i>+</i></button>
          <div className="faq-a"><p>{a}</p></div>
        </div>
      ))}
    </div>
  )
}

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  if (!src) return null
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button aria-label="Закрыть">×</button>
      <img src={src} alt="Макет КП" />
    </div>
  )
}

/* ------------------------------------------------------- calculator */
const recommended = () => Object.fromEntries(CALC.map((g) => [g.id, g.options.findIndex((o) => o.rec)]))
const empty = () => Object.fromEntries(CALC.map((g) => [g.id, -1]))

function Calculator() {
  const [sel, setSel] = useState(recommended)
  const [margin, setMargin] = useState(300000)

  const calc = useMemo(() => {
    let once = 0, month = 0, extra = 0
    const rows = []
    CALC.forEach((g) => {
      const o = g.options[sel[g.id]]
      if (!o) return
      once += o.once || 0
      month += o.month || 0
      extra += o.extra || 0
      rows.push({ g: g.title, label: o.label, cost: o.once ? rub(o.once) : `${rub(o.month)}/мес` })
    })
    const total3 = once + 3 * (month + extra)
    return { once, month, extra, rows, total3 }
  }, [sel])

  const m = Math.max(0, Number(margin) || 0)
  const houses = m > 0 ? Math.ceil(calc.total3 / m) : null

  return (
    <div className="calc">
      <div className="calc-left">
        {CALC.map((g) => (
          <fieldset key={g.id} className="calc-group">
            <legend>{g.title}</legend>
            <div className="opts">
              <label className={`opt ${sel[g.id] === -1 ? 'on' : ''}`}>
                <input type="radio" name={g.id} checked={sel[g.id] === -1} onChange={() => setSel({ ...sel, [g.id]: -1 })} />
                <span>Не нужно</span>
              </label>
              {g.options.map((o, idx) => (
                <label key={o.label} className={`opt ${sel[g.id] === idx ? 'on' : ''}`}>
                  <input type="radio" name={g.id} checked={sel[g.id] === idx} onChange={() => setSel({ ...sel, [g.id]: idx })} />
                  <span>{o.label}{o.rec && <em>выбор команды</em>}</span>
                  <b>{o.once ? rub(o.once) : `${rub(o.month)}/мес`}</b>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="calc-actions">
          <button className="btn small" onClick={() => setSel(recommended())}>Рекомендуемый набор</button>
          <button className="btn small ghost" onClick={() => setSel(empty())}>Сбросить</button>
        </div>
      </div>

      <aside className="calc-right">
        <h4>Ваш пакет</h4>
        {calc.rows.length === 0 && <p className="muted">Выберите хотя бы одну услугу слева.</p>}
        <ul className="calc-rows">
          {calc.rows.map((r) => (<li key={r.g}><div><small>{r.g}</small><span>{r.label}</span></div><b>{r.cost}</b></li>))}
        </ul>
        <dl className="calc-total">
          <div><dt>Разовые платежи</dt><dd>{rub(calc.once)}</dd></div>
          <div><dt>Ежемесячно (работы)</dt><dd>{rub(calc.month)}</dd></div>
          <div><dt>Реклама и внешний бюджет*</dt><dd>от {rub(calc.extra)}/мес</dd></div>
          <div className="big"><dt>Первые 3 месяца</dt><dd>≈ {rub(calc.total3)}</dd></div>
        </dl>
        <p className="tiny">* Рекламный бюджет Яндекс.Директ (от 15 000 ₽/мес) и внешние размещения для SEO/GEO оплачиваются отдельно, мы показываем минимальную сумму. Участие в «Народном учителе» рассчитано на 3 месяца.</p>

        <div className="payback">
          <label>
            Ваша средняя прибыль с одного дома, ₽
            <input type="number" min="0" step="10000" value={margin} onChange={(e) => setMargin(e.target.value)} />
          </label>
          {houses !== null && calc.total3 > 0 && (
            <p className="payback-res">
              Пакет на 3 месяца окупается, если он приведёт <b>{houses} {houses === 1 ? 'дом' : houses < 5 ? 'дома' : 'домов'}</b>
              <span> — это простая арифметика на ваших цифрах, а не прогноз заявок.</span>
            </p>
          )}
          <p className="tiny">Значение 300 000 ₽ — условный пример. Подставьте реальную цифру.</p>
        </div>
      </aside>
    </div>
  )
}

/* ================================================================ APP */
export default function App() {
  useReveal()
  const active = useActiveSection(NAV.map((n) => n.id))
  const [menu, setMenu] = useState(false)
  const [zoom, setZoom] = useState(null)

  const go = (id) => (e) => {
    e.preventDefault(); setMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="topbar">
        <a href="#top" className="brand" onClick={go('top')} aria-label="Наверх">
          <span className="logo-pg"><img src="/img/progorod-logo.png" alt="ПроГород" /></span>
          <span className="x">×</span>
          <img className="logo-td" src="/img/teplydom-logo.png" alt="Тёплый дом" />
        </a>
        <nav className={menu ? 'open' : ''}>
          {NAV.map((n) => (<a key={n.id} href={`#${n.id}`} className={active === n.id ? 'act' : ''} onClick={go(n.id)}>{n.label}</a>))}
        </nav>
        <button className="burger" onClick={() => setMenu(!menu)} aria-label="Меню"><i /><i /><i /></button>
      </header>

      <main id="top">
        {/* =========================================================== HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow reveal">Персональное предложение · октябрь 2026</p>
              <h1 className="reveal">Вы строите <em>тёплые дома.</em> Мы приводим тех, кто их заказывает.</h1>
              <p className="hero-lead reveal">
                Мы изучили присутствие «Тёплого дома» в сети и собрали пять инструментов, которые ведут клиента
                от первого знакомства до заявки: городское медиа, социальный проект, реклама, сайт и поиск/нейросети.
              </p>
              <div className="hero-cta reveal">
                <a href="#audit" className="btn" onClick={go('audit')}>Что мы увидели в вашем присутствии</a>
                <a href="#summary" className="btn ghost-light" onClick={go('summary')}>Собрать свой пакет</a>
              </div>
            </div>
            <div className="hero-badge reveal">
              <img src="/img/teplydom-logo.png" alt="" />
              <div className="facts">{FACTS_TD.map((f) => <Stat key={f.label} {...f} />)}</div>
            </div>
          </div>

          <div className="wrap">
            <div className="offers">
              {OFFERS.map((o) => (
                <a key={o.id} href={`#${o.id}`} className="offer reveal" onClick={go(o.id)}>
                  <span className="offer-stage">{o.stage}</span>
                  <span className="offer-n">{o.n}</span>
                  <h3>{o.title}</h3>
                  <p>{o.text}</p>
                  <span className="offer-price">{o.price}<i>→</i></span>
                </a>
              ))}
            </div>
            <div className="strip reveal">
              <p>Площадки «ПроГорода», на которых увидят ваш бренд</p>
              <div className="strip-stats">{PLATFORMS.map((p) => <Stat key={p.label} {...p} />)}</div>
            </div>
          </div>
        </section>

        {/* =========================================================== AUDIT */}
        <section id="audit" className="sec light">
          <div className="wrap">
            <SectionHead n="Аудит" kicker={`Проверка от ${AUDIT.date}`} title="Что мы увидели в вашем присутствии в сети" lead={AUDIT.lead} />

            <div className="audit-grid">
              <div className="audit-strong reveal">
                <h4>Что уже сильно</h4>
                <List items={AUDIT.strong} />
                <p className="audit-note">Это сильная база: опыт, который можно превратить в страницы, кейсы и упоминания. Поэтому дорогая переделка сайта не нужна.</p>
              </div>
              <div className="audit-gaps">
                {AUDIT.gaps.map((g, i) => (
                  <article key={g.t} className="gap reveal">
                    <span className="gap-n">{i + 1}</span>
                    <div>
                      <h4>{g.t}</h4>
                      <p className="see"><b>Видим:</b> {g.see}</p>
                      <p className="fix"><b>Решаем:</b> {g.fix}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <p className="sources reveal">Проверено по открытым источникам:{' '}
              {AUDIT.sources.map(([t, u], i) => (<span key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a>{i < AUDIT.sources.length - 1 ? ' · ' : ''}</span>))}
            </p>

            <SubTitle>Как это работает вместе: путь клиента</SubTitle>
            <div className="funnel">
              {FUNNEL.map((f, i) => (
                <a key={f.stage} href={`#${f.go}`} className="fstep reveal" onClick={go(f.go)}>
                  <span className="fnum">{i + 1}</span>
                  <h4>{f.stage}</h4>
                  <small>{f.ids}</small>
                  <p>{f.d}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================== 01 PODCAST */}
        <section id="podcast" className="sec dark">
          <div className="wrap">
            <SectionHead dark n="01" stage="Узнают" kicker="Видеопроект · сезон 2026" title="Прогулка по Сыктывкару" lead={PODCAST.lead} />

            <div className="grid-2">
              <div className="card reveal">
                <h4>Мощь городской медиаплатформы</h4>
                <p>{PODCAST.scale}</p>
                <div className="big-num">400 000+ <span>контактов, суммарный охват</span></div>
              </div>
              <div className="plat-grid reveal">
                {PODCAST.platforms.map((p) => (<div key={p.name} className="plat"><small>{p.name}</small><b>{p.value}</b><span>{p.note}</span></div>))}
              </div>
            </div>

            <SubTitle>Смотрите выпуски прямо здесь</SubTitle>
            <div className="reveal"><VideoPlayer /></div>
            <p className="note reveal">{PODCAST.firstEpisode}. Население Сыктывкара ~245 тыс. человек: {PODCAST.forecast.split(': ')[1]}</p>

            <WhyBox>Люди сомневаются, отдавая миллионы за дом. Выпуск, где ваш эксперт 30 минут отвечает на их вопросы, работает как личная консультация сразу для десятков тысяч зрителей.</WhyBox>

            <div className="grid-2 gap-top">
              <div className="card reveal">
                <h4>О чём мог бы быть ваш выпуск</h4>
                <List items={PODCAST.topics} />
              </div>
              <div className="card reveal">
                <h4>Экспертный видеоподкаст на улицах города</h4>
                <p>{PODCAST.format}</p>
                <div className="vs-mini">
                  <div><b>Обычная реклама</b>{PODCAST.before.map((t) => <span key={t}>– {t}</span>)}</div>
                  <div className="good"><b>Прогулка по Сыктывкару</b>{PODCAST.after.map((t) => <span key={t}>+ {t}</span>)}</div>
                </div>
              </div>
            </div>

            <div className="grid-2 gap-top">
              <div className="card host reveal">
                <div className="avatar">НЧ</div>
                <h4>{PODCAST.host.name}</h4>
                <small>{PODCAST.host.role}</small>
                <blockquote>«{PODCAST.host.quote}»</blockquote>
                <div className="tags">{PODCAST.host.team.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
              <div className="card reveal">
                <h4>Что вы получаете</h4>
                <List items={PODCAST.included} />
                <ul className="dist">
                  {PODCAST.distribution.map((d) => <li key={d.name}><span>{d.name}</span><b>{d.value}</b></li>)}
                </ul>
              </div>
            </div>

            <SubTitle>Как проходит работа</SubTitle>
            <div className="steps reveal">
              {PODCAST.steps.map((s, i) => (<div key={s.t} className="step"><span>{String(i + 1).padStart(2, '0')}</span><h5>{s.t}</h5><p>{s.d}</p></div>))}
            </div>

            <SubTitle>Стоимость участия</SubTitle>
            <div className="tariffs two reveal">
              {PODCAST.tariffs.map((t) => (
                <div key={t.name} className={`tariff ${t.badge ? 'hot' : ''}`}>
                  {t.badge && <span className="badge">{t.badge}</span>}
                  <h4>{t.name}</h4>
                  <div className="price">{t.price}{t.old && <s>{t.old}</s>}</div>
                  <p className="sub">{t.sub}</p>
                  <List items={t.items} />
                </div>
              ))}
            </div>
            <p className="note reveal">{PODCAST.note}</p>
          </div>
        </section>

        {/* =========================================================== 02 TEACHER */}
        <section id="teacher" className="sec light">
          <div className="wrap">
            <SectionHead n="02" stage="Запоминают" kicker={`Партнёрский проект · ${TEACHER.period}`} title="Народный учитель" lead={TEACHER.intro} />

            <WhyBox>Строительство дома — решение семьи, а семьи с детьми — ваша ключевая аудитория. Партнёрство в проекте, который чествует школьных учителей, ставит бренд рядом с добрым делом, а не рядом с рекламой.</WhyBox>

            <div className="grid-2 gap-top">
              <div className="card reveal"><h4>Информационная поддержка</h4>
                <ul className="support">{TEACHER.support.map((s) => <li key={s.name}><b>{s.name}</b><span>{s.note}</span></li>)}</ul>
              </div>
              <div className="card reveal"><h4>Цели проекта</h4><List items={TEACHER.goals} /></div>
            </div>
            <div className="card wide reveal"><h4>Как проходит проект</h4><p>{TEACHER.mechanics}</p></div>

            <SubTitle>Четыре варианта сотрудничества</SubTitle>
            <div className="tiers">
              {TEACHER.tiers.map((t) => (
                <article key={t.key} className={`tier t-${t.key} reveal`}>
                  <div className="tier-top">
                    <h4>{t.name}</h4>
                    <div className="price">{t.price}<small>за 3 месяца</small></div>
                    <p className="monthly">или {t.monthly} при поэтапной оплате</p>
                  </div>
                  <div className="tier-body"><p className="tag">{t.tag}</p><List items={t.items} /></div>
                </article>
              ))}
            </div>

            <div className="pre reveal">
              <h4>Возможности для партнёров перед концертом</h4>
              <div className="pre-grid">{TEACHER.preConcert.map((p) => <div key={p.t}><b>{p.t}</b><span>{p.d}</span></div>)}</div>
            </div>
            <ul className="terms reveal">{TEACHER.terms.map((t) => <li key={t}>{t}</li>)}</ul>

            <SubTitle>Так выглядит предложение для партнёров</SubTitle>
            <div className="mockups reveal">
              <button onClick={() => setZoom('/img/narodny-uchitel-opisanie.jpg')}>
                <img src="/img/narodny-uchitel-opisanie.jpg" alt="Описание проекта «Народный учитель»" loading="lazy" /><span>Описание проекта — нажмите, чтобы увеличить</span>
              </button>
              <button onClick={() => setZoom('/img/narodny-uchitel-pakety.png')}>
                <img src="/img/narodny-uchitel-pakety.png" alt="Пакеты партнёрства" loading="lazy" /><span>Пакеты партнёрства — нажмите, чтобы увеличить</span>
              </button>
            </div>

            <SubTitle>{TEACHER.previous.title}</SubTitle>
            <div className="grid-2 prev">
              <div className="reveal"><SitePreview url={TEACHER.previous.url} title="Народный тренер 2026" ratio={0.8} hint="Страница проекта" /></div>
              <div className="card reveal">
                <h4>Так выглядит партнёрство на странице проекта</h4>
                <p>{TEACHER.previous.text}</p>
                <ul className="plain">{TEACHER.previous.partners.map((p) => <li key={p}>{p}</li>)}</ul>
                <a className="btn ghost" href={TEACHER.previous.url} target="_blank" rel="noreferrer">Открыть страницу проекта ↗</a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================== 03 CONTEXT */}
        <section id="context" className="sec white">
          <div className="wrap">
            <SectionHead n="03" stage="Находят" kicker="Яндекс.Директ · Поиск + РСЯ" title="Контекстная реклама" lead={CONTEXT.lead} />
            <div className="stats4 reveal">{CONTEXT.stats.map((s) => <Stat key={s.label} {...s} />)}</div>

            <WhyBox>Человек, который вводит «каркасный дом под ключ Сыктывкар», уже выбирает подрядчика. Поиск перехватывает такой спрос, а РСЯ возвращает тех, кто посмотрел ваш сайт и ушёл — для дорогой стройки это обычная история.</WhyBox>

            <SubTitle>Почему обычная реклама не работает</SubTitle>
            <div className="cards3">
              {CONTEXT.problems.map((p) => (<div key={p.t} className="card reveal"><h4>{p.t}</h4><p>{p.d}</p></div>))}
            </div>

            <div className="grid-2 gap-top">
              <div className="card reveal"><h4>{CONTEXT.rsyaTitle}</h4><p>{CONTEXT.rsya}</p><List items={CONTEXT.how} /></div>
              <div className="card accent reveal"><h4>Честно о рекламе</h4><p>{CONTEXT.honest}</p></div>
            </div>

            <SubTitle>Поиск + РСЯ: комплексный подход</SubTitle>
            <div className="grid-2">
              {CONTEXT.channels.map((c) => (
                <div key={c.t} className="card reveal"><span className="chip">{c.tag}</span><h4>{c.t}</h4><p>{c.d}</p><List items={c.list} /></div>
              ))}
            </div>
            <div className="cards3 gap-top">
              {CONTEXT.synergy.map((p) => (<div key={p.t} className="card soft reveal"><h4>{p.t}</h4><p>{p.d}</p></div>))}
            </div>

            <SubTitle>Что входит в стоимость</SubTitle>
            <div className="cards3">{CONTEXT.included.map(([t, d]) => (<div key={t} className="card reveal"><h4>{t}</h4><p>{d}</p></div>))}</div>

            <SubTitle>Тарифы</SubTitle>
            <div className="tariffs three reveal">
              {CONTEXT.tariffs.map((t) => (
                <div key={t.name} className={`tariff ${t.badge ? 'hot' : ''}`}>
                  {t.badge && <span className="badge">{t.badge}</span>}
                  <h4>{t.name}</h4><p className="sub">{t.sub}</p>
                  <div className="price">{t.price}</div>
                  {t.save && <p className="save">{t.save}</p>}
                  <List items={t.items} />
                </div>
              ))}
            </div>
            <p className="note reveal">{CONTEXT.budgetNote}</p>

            <SubTitle>Фрилансер или ПроГород?</SubTitle>
            <div className="table-wrap reveal">
              <table className="compare">
                <thead><tr><th></th><th>Фрилансер</th><th>ПроГород</th></tr></thead>
                <tbody>{CONTEXT.compare.map(([a, b, c]) => (<tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>))}</tbody>
              </table>
            </div>

            <SubTitle>Наши гарантии</SubTitle>
            <div className="cards4">{CONTEXT.guarantees.map(([t, d]) => (<div key={t} className="card soft reveal"><h4>{t}</h4><p>{d}</p></div>))}</div>

            <SubTitle>Почему выбирают «ПроГород»</SubTitle>
            <div className="cards3">{CONTEXT.why.map(([t, d], i) => (<div key={t} className="card reveal"><span className="num">{i + 1}</span><h4>{t}</h4><p>{d}</p></div>))}</div>

            <SubTitle>Частые вопросы</SubTitle>
            <Faq items={CONTEXT.faq} />
          </div>
        </section>

        {/* =========================================================== 04 SITES */}
        <section id="sites" className="sec light">
          <div className="wrap">
            <SectionHead n="04" stage="Доверяют" kicker="15 лет на рынке Сыктывкара" title="Каталог проектов и посадочные на сайте" lead={SITES.lead} />
            <div className="stats4 reveal">{SITES.stats.map((s) => <Stat key={s.label} {...s} />)}</div>

            <WhyBox>Полностью переделывать ваш сайт не нужно. Но 16+ построенных домов лежат без каталога, а реклама и поиск должны вести на конкретные страницы. Мы предлагаем раздел «Проекты» с фильтрами по площади и цене и посадочные под ключевые запросы. Формат и стоимость такой доработки рассчитаем отдельно, а ниже — пакеты для новых сайтов.</WhyBox>

            <SubTitle>Наши работы — живые сайты</SubTitle>
            <div className="portfolio">
              {SITES.portfolio.map((p) => (
                <div key={p.url} className="reveal">
                  <SitePreview url={p.url} title={p.title} shot={p.shot} />
                  <div className="p-cap"><b>{p.title}</b><span>{p.desc}</span></div>
                </div>
              ))}
            </div>

            <SubTitle>Почему выбирают нас</SubTitle>
            <div className="cards4">{SITES.advantages.map(([t, d]) => (<div key={t} className="card reveal"><h4>{t}</h4><p>{d}</p></div>))}</div>

            <SubTitle>Этапы работы</SubTitle>
            <div className="timeline reveal">{SITES.stages.map(([t, d], i) => (<div key={t}><span>{i + 1}</span><h5>{t}</h5><p>{d}</p></div>))}</div>

            <SubTitle>Пакеты услуг</SubTitle>
            <div className="tariffs four reveal">
              {SITES.packages.map((t) => (
                <div key={t.name} className={`tariff ${t.badge ? 'hot' : ''}`}>
                  {t.badge && <span className="badge">{t.badge}</span>}
                  <h4>{t.name}</h4><p className="sub">{t.sub}</p>
                  <div className="price">{t.price}</div>
                  <List items={t.items} />
                </div>
              ))}
            </div>

            <SubTitle>Мы отвечаем за качество</SubTitle>
            <div className="cards3">{SITES.guarantees.map(([t, d]) => (<div key={t} className="card reveal"><h4>{t}</h4><p>{d}</p></div>))}</div>

            <SubTitle>Бонусы при заказе</SubTitle>
            <div className="cards4">{SITES.bonuses.map(([t, d]) => (<div key={t} className="card soft reveal"><h4>{t}</h4><p>{d}</p></div>))}</div>

            <SubTitle>Частые вопросы</SubTitle>
            <Faq items={SITES.faq} />
          </div>
        </section>

        {/* =========================================================== 05 SEO */}
        <section id="seo" className="sec dark">
          <div className="wrap">
            <SectionHead dark n="05" stage="Выбирают вас" kicker="SEO · GEO/AI · SERM · аудит от 28.10.2026" title="Чтобы вас находили, называли и хвалили" lead={SEO.lead} />

            <div className="grid-2">
              <div className="card reveal">
                <h4>Какие страницы создаём (приоритетный пул)</h4>
                <ul className="chips">{SEO.clusters.map((c) => <li key={c}>{c}</li>)}</ul>
                <p className="muted-s">Не всё сразу: при бюджете от 20 000 ₽ в месяц берём 1–2 коммерческих кластера в месяц.</p>
              </div>
              <div className="card reveal">
                <h4>Темы экспертных материалов</h4>
                <List items={SEO.topics} />
              </div>
            </div>
            <div className="card accent2 wide reveal"><h4>Что такое GEO/AI</h4><p>{SEO.ai}</p></div>

            <SubTitle>Три варианта работы</SubTitle>
            <div className="tariffs three reveal">
              {SEO.plans.map((t) => (
                <div key={t.name} className={`tariff ${t.badge ? 'hot' : ''}`}>
                  {t.badge && <span className="badge">{t.badge}</span>}
                  <h4>{t.name}</h4><p className="sub">{t.sub}</p>
                  <div className="price">{t.price}</div>
                  <p className="ext">{t.ext}</p>
                  <List items={t.items} />
                  {t.no && <p className="no">{t.no}</p>}
                </div>
              ))}
            </div>
            <p className="note reveal">Для вашей ниши мы советуем «SEO + GEO/AI»: SEO создаёт страницы, которые получают трафик, а GEO усиливает их внешними источниками и присутствием бренда вне собственного сайта.</p>

            <SubTitle>План первых трёх месяцев</SubTitle>
            <div className="table-wrap reveal">
              <table className="compare road">
                <thead><tr><th></th><th>SEO</th><th>GEO/AI</th><th>SERM / карты</th></tr></thead>
                <tbody>{SEO.roadmap.map((r) => (<tr key={r.m}><td>{r.m}</td><td>{r.seo}</td><td>{r.geo}</td><td>{r.serm}</td></tr>))}</tbody>
              </table>
            </div>

            <SubTitle>Честные сроки</SubTitle>
            <div className="honest reveal">
              {SEO.honest.map(([t, d]) => (<div key={t}><b>{t}</b><span>{d}</span></div>))}
            </div>
            <p className="note reveal">{SEO.honestNote}</p>
          </div>
        </section>

        {/* =========================================================== SUMMARY */}
        <section id="summary" className="sec white">
          <div className="wrap">
            <SectionHead n="Итого" kicker="Интерактивный расчёт" title="Соберите пакет под задачу «Тёплого дома»" lead="Выберите нужные услуги — сумма и срок окупаемости пересчитаются сразу. Мы заранее отметили набор, который считаем самым сбалансированным." />
            <div className="reveal"><Calculator /></div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <span className="logo-pg"><img src="/img/progorod-logo.png" alt="ПроГород" /></span>
          <p>Персональное предложение для компании «Тёплый дом» · октябрь 2026. Цены действительны на дату обращения.</p>
        </div>
      </footer>
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </>
  )
}
