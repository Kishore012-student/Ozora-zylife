import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { gsap, ScrollTrigger, reduced, fine, startLenis, getLenis } from '../motion.js';
import { TransCtx, TLink, useSite, waLink, telLink, mailLink, isPlaceholder } from '../site.jsx';
import logoImg from '../assets/Ozora Zylife Horizontal Logo Transparent1.webp';
import logomarkImg from '../assets/Logomark.webp';
import PremiumFooter from './PremiumFooter.jsx';
import './PremiumFooter.css';

const NAV = [
  ['/products', 'Products'], ['/about', 'About'], ['/quality', 'Quality'], ['/certifications', 'Certifications'], ['/contact', 'Contact'],
];

export default function Layout({ children }) {
  const { content, error, reload } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();
  const curtain = useRef(null), menuRef = useRef(null), navRef = useRef(null);
  const st = useRef({ first: true, covered: false, busy: false, pendingIntro: null });
  const [menuOpen, setMenuOpen] = useState(false);

  /* smooth scroll + nav hide-on-scroll */
  useEffect(() => {
    startLenis();
    let lastY = 0;
    const t = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      const y = self.scroll();
      const el = navRef.current;
      if (el) {
        el.classList.toggle('is-scrolled', y > 40);
        el.classList.toggle('is-hidden', y > lastY && y > 300 && !document.body.classList.contains('menu-open'));
      }
      lastY = y;
    } });
    return () => t.kill();
  }, []);

  const revealCurtain = useCallback(intro => {
    const panels = curtain.current.querySelectorAll('i');
    gsap.timeline({ onComplete: () => { st.current.covered = false; st.current.busy = false; gsap.set(panels, { yPercent: 100 }); } })
      .to([...panels].reverse(), { yPercent: -100, duration: 0.75, stagger: 0.08, ease: 'expo.inOut' })
      .add(() => intro?.(), '-=.45');
  }, []);

  /* pages call this once their DOM + triggers are ready */
  const pageReady = useCallback(intro => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const s = st.current;
      if (s.first) {
        s.first = false;
        intro?.();
      } else if (s.covered) {
        revealCurtain(intro);
      } else {
        intro?.();
      }
    });
  }, [revealCurtain]);

  const go = useCallback(to => {
    const s = st.current;
    setMenuOpen(false);
    const target = typeof to === 'string' ? to : `${to.pathname || ''}${to.search || ''}`;
    if (s.busy) return;
    if (target === location.pathname + location.search) { getLenis()?.scrollTo(0, { duration: 1.4 }); return; }
    if (reduced) { navigate(to); return; }
    s.busy = true;
    const panels = curtain.current.querySelectorAll('i');
    gsap.timeline({ onComplete: () => { s.covered = true; navigate(to); setTimeout(() => s.covered && revealCurtain(), 5000); } })
      .fromTo(panels, { yPercent: 100 }, { yPercent: 0, duration: 0.65, stagger: 0.08, ease: 'expo.inOut' });
  }, [location.pathname, location.search, navigate, revealCurtain]);

  /* reset scroll on every route change */
  useLayoutEffect(() => {
    const l = getLenis();
    if (l) l.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
    navRef.current?.classList.remove('is-hidden');
  }, [location.pathname]);
  useEffect(() => { if (navType === 'POP') st.current.busy = false; }, [location.key, navType]);

  /* menu open/close */
  useEffect(() => {
    const m = menuRef.current; if (!m) return;
    document.body.classList.toggle('menu-open', menuOpen);
    const l = getLenis();
    if (menuOpen) {
      l?.stop();
      gsap.timeline().to(m, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
        .fromTo(m.querySelectorAll('.big'), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'expo.out' }, '-=.35');
    } else {
      l?.start();
      gsap.to(m, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut' });
    }
  }, [menuOpen]);
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const ctx = useMemo(() => ({ go, pageReady }), [go, pageReady]);
  const settings = content?.settings;

  return (
    <TransCtx.Provider value={ctx}>
      <div className="curtain" ref={curtain} aria-hidden="true"><i /><i /></div>

      <header className="nav" ref={navRef}>
        <TLink to="/" className="brand" aria-label="Ozora Zylife home">
          <img src={logoImg} alt="Ozora Zylife Logo" className="brand__logo brand__logo--desktop" />
          <img src={logomarkImg} alt="Ozora Zylife Mark" className="brand__logo brand__logo--mobile" />
        </TLink>
        <nav className="nav__links" aria-label="Primary">
          {NAV.map(([to, l]) => <TLink key={to} to={to} className={location.pathname.startsWith(to) ? 'is-active' : ''}>{l}</TLink>)}
        </nav>
        <div className="nav__right">
          <TLink to="/contact?type=Product%20enquiry" className="nav__cta">Send an Enquiry</TLink>
          <button className="nav__menu" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><b />Menu</button>
        </div>
      </header>

      <div className="menu" ref={menuRef} role="dialog" aria-label="Menu" aria-hidden={!menuOpen}>
        <button className="menu__close" onClick={() => setMenuOpen(false)}>Close</button>
        <div>
          <TLink className="big" to="/">Home</TLink>
          {NAV.map(([to, l]) => <TLink className="big" key={to} to={to}>{l}</TLink>)}
        </div>
        <div className="menu__foot">
          <a className="btn btn--white" href={waLink(settings)} target="_blank" rel="noreferrer">Chat on WhatsApp <span className="arr">→</span></a>
        </div>
      </div>

      <main id="main">
        {error ? (
          <section className="page-error">
            <h1>We could not load this page.</h1>
            <p>Please check your connection and try again.</p>
            <button className="btn btn--solid" onClick={reload}>Try again <span className="arr">→</span></button>
          </section>
        ) : content ? children : null}
      </main>

      {content && <PremiumFooter settings={settings} />}
      {content && <a className="wa-float" href={waLink(settings)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WaIcon /></a>}
    </TransCtx.Provider>
  );
}



export function WaIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.6L3 29l7-2.1c1.8 1 3.9 1.6 6 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.2 1.2-4-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6C5.3 9.8 10.1 5 16 5s10.7 4.8 10.7 10.6S21.9 26.1 16 26.1zm5.9-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-1.9-.9-3.1-1.7-4.4-3.9-.3-.6.3-.5 1-1.8.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.3 3.4c.2.2 2.3 3.6 5.7 5 2.1.9 3 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.3-.3-.4-.6-.6z"/></svg>
  );
}

/** Shared closing call-to-action band */
export function CtaBand({ title, text, children, theme = 'warm' }) {
  return (
    <section className={`ctaband ${theme === 'warm' ? 'warm' : theme === 'dark' ? 'dark' : ''}`} data-theme={theme === 'dark' ? 'dark' : 'light'}>
      <div className="ctaband__in">
        <div>
          {title && <h2 className="ctaband__title"><WordsInline text={title} /></h2>}
          {text && <p className="ctaband__text" data-fade="">{text}</p>}
        </div>
        <div className="ctaband__btns" data-fade="">{children}</div>
      </div>
    </section>
  );
}
function WordsInline({ text }) {
  const words = String(text).split(/\s+/);
  return <span data-reveal="">{words.map((w, i) => <React.Fragment key={i}><span className="wm"><span>{w}</span></span>{i < words.length - 1 ? ' ' : ''}</React.Fragment>)}</span>;
}

export { isPlaceholder };
