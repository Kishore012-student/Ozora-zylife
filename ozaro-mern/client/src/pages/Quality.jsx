import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, reduced, revealLines, wordScrub, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, Btn } from '../site.jsx';
import { img } from '../api.js';
import { CtaBand } from '../components/Layout.jsx';

export default function Quality() {
  const c = useContent('quality'), home = useContent('home');
  useSeo(c.seoTitle, c.seoDescription);
  const root = useRef(null);
  const { pageReady } = useTransition();

  useLayoutEffect(() => {
    const el = root.current;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.qhero h1 .wm > span');
      if (!reduced) gsap.set(words, { yPercent: 110 });
      const steps = el.querySelectorAll('.qstep'), pics = el.querySelectorAll('.qproc__media img'), num = el.querySelector('.qproc__num');
      if (!reduced) {
        gsap.fromTo('.qproc__line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.qproc__list', start: 'top 60%', end: 'bottom 60%', scrub: true } });
        steps.forEach((s, i) => ScrollTrigger.create({
          trigger: s, start: 'top 60%', end: 'bottom 60%',
          onToggle: self => {
            if (!self.isActive) return;
            steps.forEach((x, j) => x.classList.toggle('is-on', j === i));
            pics.forEach((p, j) => gsap.to(p, { opacity: j === i ? 1 : 0, scale: j === i ? 1 : 1.08, duration: 0.9, ease: 'expo.out' }));
            if (num) num.textContent = String(i + 1).padStart(2, '0');
          },
        }));
        /* two traditions slide together */
        gsap.timeline({ scrollTrigger: { trigger: '.qstd', start: 'top 75%', end: 'center 50%', scrub: 1 } })
          .fromTo('.qstd__a', { xPercent: -30, rotate: -6 }, { xPercent: 0, rotate: -2, ease: 'none' }, 0)
          .fromTo('.qstd__b', { xPercent: 30, rotate: 6 }, { xPercent: 0, rotate: 2, ease: 'none' }, 0);
        gsap.from('.qpack li', { x: -40, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.qpack ul', start: 'top 85%' } });
      } else steps.forEach(s => s.classList.add('is-on'));
      revealLines(el.querySelector('.after-hero'));
      el.querySelectorAll('.js-words').forEach(wordScrub);
      magnetic(el);
      themeTriggers(el);
    }, el);
    pageReady(() => ctx.add(() => {
      if (reduced) return;
      gsap.timeline()
        .to(el.querySelectorAll('.qhero h1 .wm > span'), { yPercent: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out' })
        .fromTo('.qhero__sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, 0.3);
    }));
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = c.process || [];
  return (
    <div ref={root}>
      <section className="qhero phead" data-theme="light">
       <Words as="h1" text={c.headline} />
        <p className="qhero__sub phead__sub lede">{c.sub}</p>
      </section>

      <div className="after-hero">
        <section className="story" data-theme="light">
          <p className="label">{c.approachTitle}</p>
          <p className="story__lead js-words">{c.approach}</p>
        </section>

        <section className="qproc dark" data-theme="dark">
          <div className="qproc__head"><Words as="h2" text={c.processTitle} /><p className="label">{steps.length} steps · One standard</p></div>
          <div className="qproc__grid">
            <div className="qproc__media" aria-hidden="true">
              {steps.map((s, i) => <img key={i} src={img(s.image)} alt={s.title || `Quality step ${i + 1}`} style={{ opacity: i === 0 ? 1 : 0 }} />)}
              <span className="qproc__num">01</span>
            </div>
            <ol className="qproc__list">
              <div className="qproc__line"><i /></div>
              {steps.map((s, i) => (
                <li className={`qstep ${i === 0 ? 'is-on' : ''}`} key={i}>
                  <span className="qstep__n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    {s.image && <img className="qstep__img" src={img(s.image)} alt={`Ozora Zylife - ${s.title}`} loading="lazy" />}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="qstd" data-theme="light">
          <div className="qstd__media">
            <figure className="qstd__a"><img src={img(home.allopathyImage)} alt="Allopathy tablets and capsules" loading="lazy" /></figure>
            <figure className="qstd__b"><img src={img(home.ayurvedaImage)} alt="Ayurvedic herbs" loading="lazy" /></figure>
          </div>
          <div className="qstd__copy">
            <Words as="h2" text={c.standardTitle} />
            <p data-fade="">{c.standard}</p>
          </div>
        </section>

        <section className="qpack" data-theme="light">
          <Words as="h2" text={c.packagingTitle} />
          <ul>{(c.packaging || []).map((t, i) => <li key={i}><span className="qpack__tick" aria-hidden="true">✓</span>{t}</li>)}</ul>
        </section>

        <CtaBand title={c.ctaText}>
          <Btn to="/certifications" variant="dark">View Certifications</Btn>
        </CtaBand>
      </div>
    </div>
  );
}
