import { useEffect, useRef, useState } from 'react'
import {
  NAV, PLATFORMS, CLIENT_FACTS, OFFERS, PODCAST, TEACHER, CONTEXT, SITES, SUMMARY,
} from './data/content.js'

/* ------------------------------------------------------------ helpers */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 }
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
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 140) cur = id
      })
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return active
}

const Check = () => (
  <svg className="check" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const List = ({ items, className = '' }) => (
  <ul className={`list ${className}`}>
    {items.map((t) => (
      <li key={t}><Check /><span>{t}</span></li>
    ))}
  </ul>
)

const SectionHead = ({ n, kicker, title, lead }) => (
  <header className="sec-head reveal">
    <span className="sec-n">{n}</span>
    <div>
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  </header>
)

const Stat = ({ value, label }) => (
  <div className="stat">
    <b>{value}</b>
    <span>{label}</span>
  </div>
)

const SubTitle = ({ children }) => <h3 className="subtitle reveal">{children}</h3>

/* ------------------------------------------------ browser-frame preview */
const shot = (url) => `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=800`

function BrowserFrame({ url, title, ratio = '16 / 10', autoLabel = 'Открыть живой предпросмотр' }) {
  const [live, setLive] = useState(false)
  const [imgOk, setImgOk] = useState(true)
  const [scale, setScale] = useState(0.3)
  const box = useRef(null)
  const W = 1280

  useEffect(() => {
    if (!box.current) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])

  const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const [wn, hn] = ratio.split('/').map((x) => parseFloat(x))

  return (
    <div className="bframe">
      <div className="bar">
        <i /><i /><i />
        <span className="addr">{host}</span>
        <a href={url} target="_blank" rel="noreferrer" className="ext" aria-label={`Открыть ${title}`}>↗</a>
      </div>
      <div className="viewport" ref={box} style={{ aspectRatio: ratio }}>
        {!live && (
          <>
            {imgOk && (
              <img src={shot(url)} alt={`Превью сайта ${title}`} loading="lazy" onError={() => setImgOk(false)} />
            )}
            {!imgOk && <div className="noshot">{host}</div>}
            <button className="live-btn" onClick={() => setLive(true)}>{autoLabel}</button>
          </>
        )}
        {live && (
          <iframe
            title={title}
            src={url}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            style={{ width: W, height: (W * hn) / wn, transform: `scale(${scale})` }}
          />
        )}
      </div>
      {live && (
        <p className="frame-note">
          Если страница не загрузилась, сайт запрещает показ во фрейме —{' '}
          <a href={url} target="_blank" rel="noreferrer">откройте его в новой вкладке</a>.{' '}
          <button className="linkbtn" onClick={() => setLive(false)}>Вернуться к превью</button>
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------- video player */
function VideoPlayer() {
  const vids = PODCAST.videos
  const [i, setI] = useState(0)

  if (!vids.length) {
    return (
      <div className="player empty">
        <div className="play-ico">▶</div>
        <h4>Выпуски «Прогулки по Сыктывкару»</h4>
        <p>{PODCAST.firstEpisode}. Плейлист доступен на VK Видео.</p>
        <a className="btn" href={PODCAST.playlistUrl} target="_blank" rel="noreferrer">Смотреть плейлист</a>
      </div>
    )
  }
  const v = vids[i]
  return (
    <div className="player">
      <div className="player-screen">
        <iframe
          key={v.id}
          title={v.title}
          src={`https://vkvideo.ru/video_ext.php?oid=${v.oid}&id=${v.id}${v.hash ? `&hash=${v.hash}` : ''}&hd=2`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="episodes">
        {vids.map((x, idx) => (
          <button key={x.id} className={idx === i ? 'on' : ''} onClick={() => setI(idx)}>
            <span>{String(idx + 1).padStart(2, '0')}</span>{x.title}
          </button>
        ))}
        <a href={`https://vkvideo.ru/video${v.oid}_${v.id}`} target="_blank" rel="noreferrer" className="all">Не играет? Открыть в VK ↗</a>
        <a href={PODCAST.playlistUrl} target="_blank" rel="noreferrer" className="all">Весь плейлист ↗</a>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- FAQ */
function Faq({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="faq reveal">
      {items.map(([q, a], idx) => (
        <div key={q} className={`faq-item ${open === idx ? 'open' : ''}`}>
          <button onClick={() => setOpen(open === idx ? -1 : idx)} aria-expanded={open === idx}>
            {q}<i>+</i>
          </button>
          <div className="faq-a"><p>{a}</p></div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- lightbox */
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

/* ================================================================ APP */
export default function App() {
  useReveal()
  const active = useActiveSection(NAV.map((n) => n.id))
  const [menu, setMenu] = useState(false)
  const [zoom, setZoom] = useState(null)

  const go = (id) => (e) => {
    e.preventDefault()
    setMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* ------------------------------------------------ header */}
      <header className="topbar">
        <a href="#top" className="brand" onClick={go('top')}>
          <span className="brand-pg"><b>ПРО</b>ГОРОД</span>
          <span className="x">×</span>
          <span className="brand-td"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 12h3v8h14v-8h3L12 3Z" fill="currentColor" /></svg>Тёплый дом</span>
        </a>
        <nav className={menu ? 'open' : ''}>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'act' : ''} onClick={go(n.id)}>{n.label}</a>
          ))}
        </nav>
        <button className="burger" onClick={() => setMenu(!menu)} aria-label="Меню"><i /><i /><i /></button>
      </header>

      <main id="top">
        {/* ---------------------------------------------- hero */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow reveal">Коммерческое предложение · 2026</p>
              <h1 className="reveal">Для компании <em>«Тёплый дом»</em></h1>
              <p className="hero-lead reveal">
                Четыре инструмента, которые помогут вашим каркасным домам находить будущих владельцев:
                городское медиа, социальный проект, реклама в Яндексе и сайт.
              </p>
              <p className="from reveal">Подготовлено: <b className="pg"><span>ПРО</span>ГОРОД</b> Сыктывкар</p>
            </div>
            <div className="hero-card reveal">
              <p className="hero-card-t">Вы строите уже</p>
              <div className="facts">
                {CLIENT_FACTS.map((f) => <Stat key={f.label} {...f} />)}
              </div>
              <div className="hero-roof" aria-hidden="true">
                <svg viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 120 200 8 400 120Z" /></svg>
              </div>
            </div>
          </div>

          <div className="wrap">
            <div className="offers">
              {OFFERS.map((o) => (
                <a key={o.id} href={`#${o.id}`} className="offer reveal" onClick={go(o.id)}>
                  <span className="offer-n">{o.n}</span>
                  <h3>{o.title}</h3>
                  <p>{o.text}</p>
                  <span className="offer-price">{o.price}<i>→</i></span>
                </a>
              ))}
            </div>
          </div>

          <div className="wrap">
            <div className="strip reveal">
              <p>Платформы «ПроГорода», где увидят ваш бренд</p>
              <div className="strip-stats">
                {PLATFORMS.map((p) => <Stat key={p.label} {...p} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- 01 podcast */}
        <section id="podcast" className="sec">
          <div className="wrap">
            <SectionHead n="01" kicker="Видеопроект · сезон 2026" title="Прогулка по Сыктывкару" lead={PODCAST.lead} />

            <div className="grid-2">
              <div className="card reveal">
                <h4>Мощь городской медиаплатформы</h4>
                <p>{PODCAST.scale}</p>
                <div className="big-num">400 000+ <span>контактов, суммарный охват</span></div>
              </div>
              <div className="plat-grid reveal">
                {PODCAST.platforms.map((p) => (
                  <div key={p.name} className="plat"><small>{p.name}</small><b>{p.value}</b><span>{p.note}</span></div>
                ))}
              </div>
            </div>

            <div className="vs reveal">
              <div className="vs-col bad"><h4>Обычная реклама</h4>
                <ul>{PODCAST.before.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="vs-col good"><h4>«Прогулка по Сыктывкару»</h4>
                <ul>{PODCAST.after.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </div>

            <SubTitle>Смотрите выпуски прямо здесь</SubTitle>
            <div className="reveal"><VideoPlayer /></div>

            <div className="grid-2 gap-top">
              <div className="card reveal">
                <h4>Экспертный видеоподкаст на улицах города</h4>
                <p>{PODCAST.format}</p>
                <p className="chip">{PODCAST.firstEpisode}</p>
              </div>
              <div className="card host reveal">
                <div className="avatar">НЧ</div>
                <h4>{PODCAST.host.name}</h4>
                <small>{PODCAST.host.role}</small>
                <blockquote>«{PODCAST.host.quote}»</blockquote>
                <div className="tags">{PODCAST.host.team.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
            </div>

            <SubTitle>Как проходит работа</SubTitle>
            <div className="steps reveal">
              {PODCAST.steps.map((s, i) => (
                <div key={s.t} className="step"><span>{String(i + 1).padStart(2, '0')}</span><h5>{s.t}</h5><p>{s.d}</p></div>
              ))}
            </div>

            <div className="grid-2 gap-top">
              <div className="card reveal">
                <h4>Что вы получаете</h4>
                <List items={PODCAST.included} />
              </div>
              <div className="card reveal">
                <h4>Охваты и каналы распространения</h4>
                <ul className="dist">
                  {PODCAST.distribution.map((d) => <li key={d.name}><span>{d.name}</span><b>{d.value}</b></li>)}
                </ul>
                <p className="forecast">{PODCAST.forecast}</p>
              </div>
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

        {/* ---------------------------------------------- 02 teacher */}
        <section id="teacher" className="sec alt">
          <div className="wrap">
            <SectionHead n="02" kicker={`Партнёрский проект · ${TEACHER.period}`} title="Народный учитель" lead={TEACHER.intro} />

            <div className="grid-2">
              <div className="card reveal">
                <h4>Информационная поддержка</h4>
                <ul className="support">
                  {TEACHER.support.map((s) => <li key={s.name}><b>{s.name}</b><span>{s.note}</span></li>)}
                </ul>
              </div>
              <div className="card reveal">
                <h4>Цели проекта</h4>
                <List items={TEACHER.goals} />
              </div>
            </div>

            <div className="card wide reveal">
              <h4>Как проходит проект</h4>
              <p>{TEACHER.mechanics}</p>
            </div>

            <SubTitle>Выберите один из четырёх вариантов сотрудничества</SubTitle>
            <div className="tiers">
              {TEACHER.tiers.map((t) => (
                <article key={t.key} className={`tier t-${t.key} reveal`}>
                  <div className="tier-top">
                    <h4>{t.name}</h4>
                    <div className="price">{t.price}<small>за 3 месяца</small></div>
                    <p className="monthly">или {t.monthly} при поэтапной оплате</p>
                  </div>
                  <div className="tier-body">
                    <p className="tag">{t.tag}</p>
                    <List items={t.items} />
                  </div>
                </article>
              ))}
            </div>

            <div className="pre reveal">
              <h4>Возможности для партнёров перед концертом</h4>
              <div className="pre-grid">
                {TEACHER.preConcert.map((p) => <div key={p.t}><b>{p.t}</b><span>{p.d}</span></div>)}
              </div>
            </div>
            <ul className="terms reveal">{TEACHER.terms.map((t) => <li key={t}>{t}</li>)}</ul>

            <SubTitle>Макеты предложения</SubTitle>
            <div className="mockups reveal">
              <button onClick={() => setZoom('/img/narodny-uchitel-opisanie.jpg')}>
                <img src="/img/narodny-uchitel-opisanie.jpg" alt="Описание проекта «Народный учитель»" loading="lazy" />
                <span>Описание проекта</span>
              </button>
              <button onClick={() => setZoom('/img/narodny-uchitel-pakety.png')}>
                <img src="/img/narodny-uchitel-pakety.png" alt="Пакеты партнёрства «Народный учитель»" loading="lazy" />
                <span>Пакеты партнёрства</span>
              </button>
            </div>

            <SubTitle>{TEACHER.previous.title}</SubTitle>
            <div className="grid-2 prev">
              <div className="reveal">
                <BrowserFrame url={TEACHER.previous.url} title="Народный тренер 2026" ratio="4 / 5" autoLabel="Открыть страницу проекта" />
              </div>
              <div className="card reveal">
                <h4>Так выглядит партнёрство на странице проекта</h4>
                <p>{TEACHER.previous.text}</p>
                <ul className="plain">{TEACHER.previous.partners.map((p) => <li key={p}>{p}</li>)}</ul>
                <a className="btn ghost" href={TEACHER.previous.url} target="_blank" rel="noreferrer">Открыть страницу проекта ↗</a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- 03 context */}
        <section id="context" className="sec">
          <div className="wrap">
            <SectionHead n="03" kicker="Яндекс.Директ · Поиск + РСЯ" title="Контекстная реклама" lead={CONTEXT.lead} />

            <div className="stats4 reveal">{CONTEXT.stats.map((s) => <Stat key={s.label} {...s} />)}</div>

            <SubTitle>Почему обычная реклама не работает</SubTitle>
            <div className="cards3">
              {CONTEXT.problems.map((p) => (
                <div key={p.t} className="card reveal"><h4>{p.t}</h4><p>{p.d}</p></div>
              ))}
            </div>

            <div className="grid-2 gap-top">
              <div className="card reveal">
                <h4>{CONTEXT.rsyaTitle}</h4>
                <p>{CONTEXT.rsya}</p>
                <List items={CONTEXT.how} />
              </div>
              <div className="card accent reveal">
                <h4>Честно о рекламе</h4>
                <p>{CONTEXT.honest}</p>
              </div>
            </div>

            <SubTitle>Поиск + РСЯ: комплексный подход</SubTitle>
            <div className="grid-2">
              {CONTEXT.channels.map((c) => (
                <div key={c.t} className="card reveal">
                  <span className="chip">{c.tag}</span>
                  <h4>{c.t}</h4>
                  <p>{c.d}</p>
                  <List items={c.list} />
                </div>
              ))}
            </div>
            <div className="cards3 gap-top">
              {CONTEXT.synergy.map((p) => (
                <div key={p.t} className="card soft reveal"><h4>{p.t}</h4><p>{p.d}</p></div>
              ))}
            </div>

            <SubTitle>Что входит в стоимость</SubTitle>
            <div className="cards3">
              {CONTEXT.included.map(([t, d]) => (
                <div key={t} className="card reveal"><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Тарифы</SubTitle>
            <div className="tariffs three reveal">
              {CONTEXT.tariffs.map((t) => (
                <div key={t.name} className={`tariff ${t.badge ? 'hot' : ''}`}>
                  {t.badge && <span className="badge">{t.badge}</span>}
                  <h4>{t.name}</h4>
                  <p className="sub">{t.sub}</p>
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
                <tbody>
                  {CONTEXT.compare.map(([a, b, c]) => (
                    <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubTitle>Наши гарантии</SubTitle>
            <div className="cards4">
              {CONTEXT.guarantees.map(([t, d]) => (
                <div key={t} className="card soft reveal"><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Почему выбирают «ПроГород»</SubTitle>
            <div className="cards3">
              {CONTEXT.why.map(([t, d], i) => (
                <div key={t} className="card reveal"><span className="num">{i + 1}</span><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Частые вопросы</SubTitle>
            <Faq items={CONTEXT.faq} />
          </div>
        </section>

        {/* ---------------------------------------------- 04 sites */}
        <section id="sites" className="sec alt">
          <div className="wrap">
            <SectionHead n="04" kicker="15 лет на рынке Сыктывкара" title="Создание сайтов для бизнеса" lead={SITES.lead} />

            <div className="stats4 reveal">{SITES.stats.map((s) => <Stat key={s.label} {...s} />)}</div>

            <SubTitle>Наши работы</SubTitle>
            <div className="portfolio">
              {SITES.portfolio.map((p) => (
                <div key={p.url} className="reveal">
                  <BrowserFrame url={p.url} title={p.title} />
                  <div className="p-cap"><b>{p.title}</b><span>{p.desc}</span></div>
                </div>
              ))}
            </div>

            <SubTitle>Почему выбирают нас</SubTitle>
            <div className="cards4">
              {SITES.advantages.map(([t, d]) => (
                <div key={t} className="card reveal"><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Этапы работы</SubTitle>
            <div className="timeline reveal">
              {SITES.stages.map(([t, d], i) => (
                <div key={t}><span>{i + 1}</span><h5>{t}</h5><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Пакеты услуг</SubTitle>
            <div className="tariffs four reveal">
              {SITES.packages.map((t) => (
                <div key={t.name} className={`tariff ${t.badge ? 'hot' : ''}`}>
                  {t.badge && <span className="badge">{t.badge}</span>}
                  <h4>{t.name}</h4>
                  <p className="sub">{t.sub}</p>
                  <div className="price">{t.price}</div>
                  <List items={t.items} />
                </div>
              ))}
            </div>

            <SubTitle>Мы отвечаем за качество</SubTitle>
            <div className="cards3">
              {SITES.guarantees.map(([t, d]) => (
                <div key={t} className="card reveal"><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Бонусы при заказе</SubTitle>
            <div className="cards4">
              {SITES.bonuses.map(([t, d]) => (
                <div key={t} className="card soft reveal"><h4>{t}</h4><p>{d}</p></div>
              ))}
            </div>

            <SubTitle>Частые вопросы</SubTitle>
            <Faq items={SITES.faq} />
          </div>
        </section>

        {/* ---------------------------------------------- summary */}
        <section id="summary" className="sec">
          <div className="wrap">
            <SectionHead n="05" kicker="Сводка" title="Все предложения в одном месте" />
            <div className="sum-grid">
              {SUMMARY.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="sum reveal" onClick={go(s.id)}>
                  <h4>{s.title}</h4>
                  <ul>{s.rows.map((r) => <li key={r}>{r}</li>)}</ul>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <span className="brand-pg"><b>ПРО</b>ГОРОД</span>
          <p>Коммерческое предложение для «Тёплый дом» · 2026. Предложение действительно на дату обращения.</p>
        </div>
      </footer>

      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </>
  )
}
