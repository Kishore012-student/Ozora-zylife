import React, { useLayoutEffect, useRef } from 'react';
import { gsap, reduced, revealLines, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, TLink } from '../site.jsx';

const DOCS = [['privacy', '/privacy', 'Privacy Policy'], ['terms', '/terms', 'Terms of Use'], ['disclaimer', '/disclaimer', 'Medical Disclaimer']];

export default function Legal({ doc }) {
  const legal = useContent('legal');
  const d = legal[doc];
  useSeo(d.seoTitle, d.intro?.slice(0, 155));
  const root = useRef(null);
  const { pageReady } = useTransition();

  useLayoutEffect(() => {
    const el = root.current;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.phead h1 .wm > span');
      if (!reduced) gsap.set(words, { yPercent: 110 });
      revealLines(el.querySelector('.legal'));
      if (!reduced) gsap.from(el.querySelectorAll('.legal__sec'), { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.legal', start: 'top 85%' } });
      themeTriggers(el);
    }, el);
    pageReady(() => ctx.add(() => { if (!reduced) gsap.to(el.querySelectorAll('.phead h1 .wm > span'), { yPercent: 0, stagger: 0.06, duration: 1.2, ease: 'expo.out' }); }));
    return () => ctx.revert();
  }, [doc]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={root} key={doc}>
      <section className="phead phead--sm" data-theme="light">
        <p className="label"><span className="dot" />&nbsp; Legal</p>
        <Words as="h1" text={d.title} />
        {d.updated && <p className="label" style={{ marginTop: '1.5rem' }}>Last updated: {d.updated}</p>}
      </section>
      <section className="legal" data-theme="light">
        <nav className="legal__nav" aria-label="Legal documents">
          {DOCS.map(([k, to, label]) => <TLink key={k} to={to} className={k === doc ? 'is-on' : ''}>{label}</TLink>)}
        </nav>
        <article className="legal__body">
          <p className="lede">{d.intro}</p>
          {(d.sections || []).map((s, i) => (
            <div className="legal__sec" key={i}><h2>{s.title}</h2><p>{s.text}</p></div>
          ))}
        </article>
      </section>
    </div>
  );
}
