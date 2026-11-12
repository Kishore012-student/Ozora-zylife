import React, { useLayoutEffect, useRef } from 'react';
import { gsap, reduced, revealLines, wordScrub, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, Btn } from '../site.jsx';
import { img } from '../api.js';
import { CtaBand } from '../components/Layout.jsx';

export default function About() {
  const c = useContent('about');
  useSeo(c.seoTitle, c.seoDescription);
  const root = useRef(null);
  const { pageReady } = useTransition();

  useLayoutEffect(() => {
    const el = root.current;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.ahero h1 .wm > span');
      if (!reduced) {
        gsap.set(words, { yPercent: 110 });
        gsap.set('.ahero__media', { clipPath: 'inset(0 0 100% 0 round 24px)' });
        gsap.fromTo('.ahero__media img', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.ahero__media', start: 'top bottom', end: 'bottom top', scrub: true } });
        /* mission / vision cards slide in from opposite sides */
        gsap.from('.mv__card', { y: 120, rotate: (i) => (i ? 3 : -3), opacity: 0, stagger: 0.15, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.mv', start: 'top 80%' } });
        gsap.from('.value', { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.values__grid', start: 'top 85%' } });
        gsap.from('.glance tr', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.glance', start: 'top 85%' } });
        gsap.fromTo('.glance__line i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.glance', start: 'top 80%', end: 'bottom 60%', scrub: true } });
      }
      revealLines(el.querySelector('.after-hero'));
      el.querySelectorAll('.js-words').forEach(wordScrub);
      magnetic(el);
      themeTriggers(el);
    }, el);
    pageReady(() => ctx.add(() => {
      if (reduced) return;
      gsap.timeline()
        .to(el.querySelectorAll('.ahero h1 .wm > span'), { yPercent: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out' })
        .fromTo('.ahero__sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, 0.3)
        .to('.ahero__media', { clipPath: 'inset(0 0 0% 0 round 24px)', duration: 1.6, ease: 'expo.inOut' }, 0.2);
    }));
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lead, ...rest] = c.story || [];
  return (
    <div ref={root}>
      <section className="ahero" data-theme="light">
        <Words as="h1" text={c.headline} />
        <p className="ahero__sub lede">{c.sub}</p>
        <div className="ahero__media"><img src={img(c.heroImage)} alt="A family together at home" /></div>
      </section>

      <div className="after-hero">
        <section className="story" data-theme="light">
          <p className="label">{c.storyTitle}</p>
          <div>
            {lead && <p className="story__lead js-words">{lead}</p>}
            <div className="story__rest">{rest.map((t, i) => <p key={i} data-fade="">{t}</p>)}</div>
          </div>
        </section>

        <section className="mv dark" data-theme="dark">
          <article className="mv__card"><p className="label">Our mission</p><p className="mv__t">{c.mission}</p></article>
          <article className="mv__card mv__card--o"><p className="label">Our vision</p><p className="mv__t">{c.vision}</p></article>
        </section>

        <section className="values" data-theme="light">
          <Words as="h2" text="Our values" />
          <div className="values__grid">
            {(c.values || []).map((v, i) => (
              <article className="value" key={i}>
                <span className="value__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glance-wrap" data-theme="light">
          <div className="glance__head"><Words as="h2"/><div className="glance__line"><i /></div></div>
          <table className="glance"><tbody>
            {(c.glance || []).map((r, i) => <tr key={i}><th scope="row">{r.label}</th><td>{r.value}</td></tr>)}
          </tbody></table>
        </section>

        <CtaBand title={c.ctaTitle}>
          <Btn to="/products" variant="dark">Explore Products</Btn>
          <Btn to="/contact">Contact Us</Btn>
        </CtaBand>
      </div>
    </div>
  );
}
