import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reduced, fine, revealLines, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, Btn, TLink, sentences, waLink } from '../site.jsx';
import { api, img } from '../api.js';
import { createHero } from '../hero3d.js';
import ProductCard from '../components/ProductCard.jsx';
import { CtaBand } from '../components/Layout.jsx';

export default function Home() {
  const c = useContent('home'), settings = useContent('settings');
  const [featured, setFeatured] = useState(null);
  const root = useRef(null);
  const { pageReady } = useTransition();
  useSeo(c.seoTitle, c.seoDescription);

  useEffect(() => { api('/products?featured=1').then(setFeatured).catch(() => setFeatured([])); }, []);

  const head = sentences(c.heroHeadline);
  const lead = head.length > 1 ? head.slice(0, -1) : head;
  const close = head.length > 1 ? head[head.length - 1] : '';

  useLayoutEffect(() => {
    if (!featured) return;
    const el = root.current;
    const heroEl = el.querySelector('.hero');
    const three = createHero(el.querySelector('#gl'), heroEl);
    const S = three.S;
    const heroWords = heroEl.querySelectorAll('.hero__title .wm > span');
    const meta = heroEl.querySelectorAll('.hero__meta > *');

    const unFloat = floatingImage(el);
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.set(heroWords, { yPercent: 110 });
        gsap.set(meta, { opacity: 0, y: 20 });
        const mm = gsap.matchMedia();
        /* hero scrub */
        mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, ({ conditions: { desk } }) => {
          S.shiftX = desk ? 0.7 : 0;
          const b1 = heroEl.querySelectorAll('.hero__b1'), b2 = heroEl.querySelector('.hero__b2'), b3 = heroEl.querySelector('.hero__b3');
          gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: heroEl, start: 'top top', end: desk ? '+=340%' : '+=230%', pin: true, scrub: 1, anticipatePin: 1 } })
            .to(heroEl.querySelector('.js-cue'), { scaleX: 1, duration: 0.2 }, 0)
            .to(S, { rotZ: 0, spin: Math.PI * 1.1, camZ: desk ? 6.6 : 8.4, duration: 0.25 }, 0)
            .to(b1, { opacity: 0, y: -60, duration: 0.14 }, 0.04)
            .to(S, { open: 1, duration: 0.2 }, 0.2)
            .to(S, { burst: 1, duration: 0.25 }, 0.26)
            .to(S, { shiftX: desk ? -1.35 : 0, duration: 0.2 }, 0.28)
            .fromTo(b2, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.36)
            .to(b2, { opacity: 0, y: -40, duration: 0.08 }, 0.56)
            .to(S, { helix: 1, hide: 1, duration: 0.3 }, 0.55)
            .to(S, { shiftX: desk ? 1.75 : 0, camZ: desk ? 8.2 : 10.5, duration: 0.3 }, 0.55)
            .to(S, { hz: desk ? 0 : Math.PI / 2, shiftY: desk ? 0 : 1.6, duration: 0.3 }, 0.55)
            .fromTo(b3, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.1 }, 0.8)
            .to({}, { duration: 0.1 }, 0.9);
        });

        /* range panels: clip reveal + parallax */
        el.querySelectorAll('.range__panel').forEach((p, i) => {
          gsap.fromTo(p, { clipPath: 'inset(100% 0 0 0 round 24px)' }, { clipPath: 'inset(0% 0 0 0 round 24px)', duration: 1.5, delay: i * 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.range__grid', start: 'top 85%' } });
          gsap.fromTo(p.querySelector('img'), { yPercent: -8, scale: 1.2 }, { yPercent: 8, scale: 1.1, ease: 'none', scrollTrigger: { trigger: p, scrub: true } });
        });

        /* featured: horizontal pin on desktop */
        mm.add('(min-width: 901px)', () => {
          const sec = el.querySelector('.feat'), track = sec.querySelector('.feat__track');
          const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
          if (dist() < 40) return;
          const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true } });
          gsap.to(sec.querySelector('.feat__bar i'), { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${dist()}`, scrub: true } });
          sec.querySelectorAll('.pcard').forEach(card => {
            gsap.from(card.querySelector('.pcard__img'), { clipPath: 'inset(0 0 0 100% round 18px)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, containerAnimation: tw, start: 'left 90%' } });
          });
        });
        mm.add('(max-width: 900px)', () => {
          gsap.from(el.querySelectorAll('.feat .pcard'), { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.feat__track', start: 'top 85%' } });
        });

        /* why rows */
        gsap.from(el.querySelectorAll('.area'), { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.areas__list', start: 'top 85%' } });

        /* certification iris */
        mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, ({ conditions: { desk } }) => {
          gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.plant', start: 'top top', end: desk ? '+=160%' : '+=90%', pin: true, scrub: 1 } })
            .fromTo('.plant__frame', { clipPath: desk ? 'inset(22% 30% 22% 30% round 24px)' : 'inset(25% 10% 25% 10% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.7 }, 0)
            .fromTo('.plant__frame img', { scale: 1.25 }, { scale: 1, duration: 0.7 }, 0)
            .to('.js-side-l', { xPercent: -140, opacity: 0, duration: 0.5 }, 0)
            .to('.js-side-r', { xPercent: 140, opacity: 0, duration: 0.5 }, 0)
            .fromTo('.plant__copy', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.65)
            .to({}, { duration: 0.15 });
        });

        /* marquee linked to scroll velocity */
        const mq = el.querySelector('.js-mq');
        const loop = gsap.to(mq, { xPercent: -33.333, duration: 24, ease: 'none', repeat: -1 });
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
          const v = self.getVelocity();
          loop.timeScale(gsap.utils.clamp(-6, 6, 1 + v / 250) || 1);
          gsap.to(mq, { skewX: gsap.utils.clamp(-12, 12, v / -120), duration: 0.4, overwrite: 'auto', onComplete: () => gsap.to(mq, { skewX: 0, duration: 0.8 }) });
          gsap.delayedCall(0.25, () => gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 0.8, overwrite: true }));
        } });
      }
      revealLines(el.querySelector('.after-hero'));
      magnetic(el);
      themeTriggers(el);
    }, el);

    pageReady(() => {
      if (reduced) return;
      ctx.add(() => {
        gsap.timeline()
          .to(S, { intro: 1, duration: 1.8, ease: 'expo.out' }, 0)
          .fromTo(S, { ispin: -Math.PI * 1.4 }, { ispin: 0, duration: 2.2, ease: 'expo.out' }, 0)
          .to(heroWords, { yPercent: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out' }, 0.15)
          .to(meta, { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: 'expo.out' }, 0.6);
      });
    });
    return () => { ctx.revert(); three.destroy(); unFloat(); };
  }, [featured]); // eslint-disable-line react-hooks/exhaustive-deps

  const why = c.why || [];
  return (
    <div ref={root}>
      {/* HERO */}
      <section className="hero" data-theme="light" aria-label="Introduction">
        <canvas id="gl" aria-hidden="true" />
        <div className="hero__copy">
          <div className="hero__beat hero__b1" style={{ position: 'static' }}>
            <h1 className="hero__title" data-noauto="">
              <Words lines={lead} as="span" />
              {close && <span className="sr-only"> {close}</span>}
            </h1>
          </div>
          <div className="hero__meta hero__b1">
          </div>
        </div>
        <div className="hero__beat hero__b2">
          <p className="lede">{c.heroSub}</p>
        </div>
        <div className="hero__beat hero__b3">
          <p className="label">Ozora Zylife</p>
          <h2 aria-hidden={!!close}>{close || c.rangeTitle}</h2>
          <div className="ctas">
            <Btn to="/products" variant="solid">Explore Products</Btn>
            <Btn to="/contact?type=Product%20enquiry">Send an Enquiry</Btn>
          </div>
        </div>
      </section>

      <div className="after-hero">
        {/* OUR RANGE */}
        <section className="range" data-theme="light">
          <div className="range__head">
            <Words as="h2" text={c.rangeTitle} />
          </div>
          <div className="range__grid">
            {[['Allopathy', c.allopathyText, c.allopathyImage], ['Ayurveda', c.ayurvedaText, c.ayurvedaImage]].map(([name, text, im]) => (
              <TLink key={name} to={`/products?category=${name}`} className="range__panel" data-cursor="Explore">
                <img src={img(im)} alt={`${name} range`} loading="lazy" />
                <div className="range__copy">
                  <h3>{name}</h3>
                  <p>{text}</p>
                  <span className="range__link">View {name} products <span className="arr">→</span></span>
                </div>
              </TLink>
            ))}
          </div>
          <div className="range__all" data-fade=""><Btn to="/products">View all products</Btn></div>
        </section>

        {/* FEATURED */}
        <section className="feat dark" data-theme="dark">
          <div className="feat__head">
            <Words as="h2" text={c.featuredTitle} />
            <p>{c.featuredIntro}</p>
          </div>
          <div className="feat__track">
            {(featured || []).map(p => <ProductCard key={p._id} p={p} />)}
            <TLink to="/products" className="feat__more" data-cursor="All">
              <span className="label">Full range</span>
              <span className="feat__more-t">View all products <span className="arr">→</span></span>
            </TLink>
          </div>
          <div className="feat__bar"><i /></div>
        </section>

        {/* WHY */}
        <section className="areas" data-theme="light">
          <div className="areas__head">
            <Words as="h2" text={c.whyTitle} />
          </div>
          <div className="areas__list">
            {why.map((w, i) => (
              <div className="area" data-img={i} key={i}>
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <h3>{w.title}</h3>
                <p className="area__text">{w.text}</p>
                {w.image && <div className="mimg"><img src={img(w.image)} alt={w.title || 'Why choose Ozora Zylife'} loading="lazy" /></div>}
              </div>
            ))}
          </div>
        </section>
        <div className="float-img" aria-hidden="true">{why.map((w, i) => <img key={i} src={img(w.image)} alt={w.title || 'Feature preview'} />)}</div>

        {/* CERTIFICATIONS STRIP */}
        <section className="plant" data-theme="dark">
          <span className="plant__side l js-side-l">Certified.</span>
          <span className="plant__side r js-side-r">Licensed.</span>
          <div className="plant__frame"><img src={img(c.certImage)} alt={c.certTitle || 'Ozora Zylife manufacturing and certifications'} loading="lazy" /></div>
          <div className="plant__copy">
            <h2>{c.certTitle}</h2>
            <div><p>{c.certText}</p><div style={{ marginTop: '1.5rem' }}><Btn to="/certifications" variant="white">View Certifications</Btn></div></div>
          </div>
        </section>

        <section className="marquee" data-theme="light" aria-hidden="true">
          <div className="marquee__row js-mq">{[0, 1, 2].map(i => <span key={i}>Allopathy <i className="dot" /> Ayurveda <i className="dot" /></span>)}</div>
        </section>

        <CtaBand title={c.ctaTitle} text={c.ctaText}>
          <Btn to="/contact" variant="dark">Contact Us</Btn>
          <Btn href={waLink(settings)}>Chat on WhatsApp</Btn>
        </CtaBand>
      </div>
    </div>
  );
}

function floatingImage(el) {
  const fl = el.querySelector('.float-img');
  if (!fl || !fine || reduced) return () => {};
  const imgs = fl.querySelectorAll('img');
  let x = -500, y = -500, tx = -500, ty = -500;
  let activeItem = null;

  const show = (idx) => {
    imgs.forEach((im, i) => im.classList.toggle('on', String(i) === String(idx)));
    fl.classList.add('is-visible');
  };

  const hide = () => {
    activeItem = null;
    fl.classList.remove('is-visible');
  };

  const onPointerMove = (e) => {
    tx = e.clientX;
    ty = e.clientY;
    // Check if cursor is directly over an .area item
    const area = e.target.closest?.('.area');
    if (area && el.contains(area)) {
      if (activeItem !== area) {
        activeItem = area;
        show(area.dataset.img);
      }
    } else {
      if (activeItem) {
        hide();
      }
    }
  };

  const tick = () => {
    const px = x;
    x += (tx - x) * 0.15;
    y += (ty - y) * 0.15;
    gsap.set(fl, {
      x: x + 40,
      y: y - 180,
      rotation: gsap.utils.clamp(-12, 12, (x - px) * 0.6)
    });
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', hide, { passive: true });
  gsap.ticker.add(tick);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', hide);
    gsap.ticker.remove(tick);
    fl.classList.remove('is-visible');
  };
}
