import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap, reduced, revealLines, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, Btn } from '../site.jsx';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { CtaBand } from '../components/Layout.jsx';

const TABS = ['All', 'Allopathy', 'Ayurveda'];

export default function Products() {
  const c = useContent('products');
  useSeo(c.seoTitle, c.seoDescription);
  const [params, setParams] = useSearchParams();
  const cat = TABS.includes(params.get('category')) ? params.get('category') : 'All';
  const [q, setQ] = useState('');
  const [all, setAll] = useState(null);
  const root = useRef(null), grid = useRef(null), tabsRef = useRef(null);
  const { pageReady } = useTransition();

  useEffect(() => { api('/products').then(setAll).catch(() => setAll([])); }, []);

  const list = useMemo(() => (all || []).filter(p =>
    (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())), [all, cat, q]);
  const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t, (all || []).filter(p => t === 'All' || p.category === t).length])), [all]);

  /* page setup */
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.phead h1 .wm > span');
      if (!reduced) gsap.set(words, { yPercent: 110 });
      revealLines(el.querySelector('.ctaband'));
      magnetic(el);
      themeTriggers(el);
      pageReady(() => {
        ctx.add(() => {
          if (reduced) return;
          gsap.timeline()
            .to(words, { yPercent: 0, stagger: 0.05, duration: 1.2, ease: 'expo.out' })
            .fromTo(el.querySelectorAll('.phead__sub, .ptools'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'expo.out', clearProps: 'all' }, 0.2);
        });
      });
    }, el);
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* animate products cards once loaded or filter changes */
  const first = useRef(true);
  useLayoutEffect(() => {
    const t = tabsRef.current?.querySelector('.is-on'), ind = tabsRef.current?.querySelector('.ptabs__ind');
    if (t && ind) gsap.to(ind, { x: t.offsetLeft, width: t.offsetWidth, duration: first.current ? 0 : 0.6, ease: 'expo.out' });
    if (!all) return;
    if (grid.current) {
      if (first.current) {
        first.current = false;
        if (!reduced) {
          gsap.fromTo(grid.current.querySelectorAll('.pcard'), { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 1.1, ease: 'expo.out', clearProps: 'all' });
        }
      } else {
        if (!reduced) {
          gsap.fromTo(grid.current.querySelectorAll('.pcard'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: 'expo.out', overwrite: true, clearProps: 'all' });
        }
      }
    }
  }, [cat, q, all]);

  const setCat = t => { const p = new URLSearchParams(params); if (t === 'All') p.delete('category'); else p.set('category', t); setParams(p, { replace: true }); };

  return (
    <div ref={root}>
      <section className="phead" data-theme="light">
        <Words as="h1" text={c.headline} data-noauto="" />
        <p className="phead__sub lede">{c.sub}</p>
      </section>

      <section className="plist" data-theme="light">
        <div className="ptools">
          <div className="ptabs" role="tablist" aria-label="Filter by category" ref={tabsRef}>
            <span className="ptabs__ind" aria-hidden="true" />
            {TABS.map(t => (
              <button key={t} role="tab" aria-selected={cat === t} className={cat === t ? 'is-on' : ''} onClick={() => setCat(t)}>
                {t} <sup>{counts[t] ?? ''}</sup>
              </button>
            ))}
          </div>
          <label className="psearch">
            <span className="sr-only">{c.searchPlaceholder}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" /></svg>
            <input type="search" placeholder={c.searchPlaceholder} value={q} onChange={e => setQ(e.target.value)} />
          </label>
        </div>

        <div className="pgrid" ref={grid}>
          {list.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
        {all && list.length === 0 && (
          <div className="pempty">
            <p className="lede">{c.noResults}</p>
            <button className="btn" onClick={() => { setQ(''); setCat('All'); }}>Browse all products <span className="arr">→</span></button>
          </div>
        )}
      </section>

      <CtaBand title={c.ctaText}>
        <Btn to="/contact?type=Pharmacy%20or%20bulk%20supply" variant="dark">Send an Enquiry</Btn>
      </CtaBand>
    </div>
  );
}
