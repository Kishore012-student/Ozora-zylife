import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, reduced, revealLines, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, Btn } from '../site.jsx';
import { api, img } from '../api.js';
import { CtaBand } from '../components/Layout.jsx';

const isPdf = f => /\.pdf($|\?)/i.test(f || '');

function DocCard({ d }) {
  const licence = d.kind === 'licence';
  const rows = licence
    ? [['Licence type', d.title], ['Licence number', d.number], ['Issued by', d.issuedBy], ['Valid until', d.validUntil]]
    : [['Certificate name', d.title], ['Issued by', d.issuedBy], ['Valid until', d.validUntil]];
  return (
    <article className="doc">
      <div className="doc__prev" data-cursor={d.file ? 'Open' : undefined}>
        {d.file && !isPdf(d.file) ? <img src={img(d.file)} alt={d.title} loading="lazy" /> : (
          <div className="doc__ph" aria-hidden="true">
            <svg viewBox="0 0 64 80" width="56"><path d="M6 2h36l16 16v58a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="#277161" strokeWidth="2.5" /><path d="M42 2v16h16" fill="none" stroke="#277161" strokeWidth="2.5" /><circle cx="32" cy="46" r="10" fill="#f38021" /><path d="M14 64h36M14 70h24" stroke="#277161" strokeWidth="2.5" /></svg>
            <span className="label">{d.file ? 'PDF document' : 'Preview coming soon'}</span>
          </div>
        )}
      </div>
      <dl className="doc__meta">
        {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || '—'}</dd></div>)}
      </dl>
      {d.file
        ? <a className="btn btn--solid" href={img(d.file)} target="_blank" rel="noreferrer">{licence ? 'View Licence' : 'View Certificate'} <span className="arr">→</span></a>
        : <span className="btn is-disabled" aria-disabled="true">{licence ? 'View Licence' : 'View Certificate'}</span>}
    </article>
  );
}

export default function Certifications() {
  const c = useContent('certifications');
  useSeo(c.seoTitle, c.seoDescription);
  const [docs, setDocs] = useState(null);
  const root = useRef(null);
  const { pageReady } = useTransition();
  useEffect(() => { api('/credentials').then(setDocs).catch(() => setDocs([])); }, []);

  useLayoutEffect(() => {
    if (!docs) return;
    const el = root.current;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.phead h1 .wm > span');
      if (!reduced) {
        gsap.set(words, { yPercent: 110 });
        el.querySelectorAll('.docs').forEach(g => gsap.from(g.querySelectorAll('.doc'), { y: 100, rotateX: -12, opacity: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 85%' } }));
      }
      revealLines(el.querySelector('.after-hero'));
      magnetic(el);
      themeTriggers(el);
    }, el);
    pageReady(() => ctx.add(() => {
      if (reduced) return;
      gsap.timeline()
        .to(el.querySelectorAll('.phead h1 .wm > span'), { yPercent: 0, stagger: 0.06, duration: 1.3, ease: 'expo.out' })
        .fromTo('.phead__sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, 0.3)
        .fromTo('.seal', { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: 1.6, ease: 'expo.out' }, 0.2);
    }));
    return () => ctx.revert();
  }, [docs]); // eslint-disable-line react-hooks/exhaustive-deps

  const certs = (docs || []).filter(d => d.kind === 'certificate'), lic = (docs || []).filter(d => d.kind === 'licence');
  return (
    <div ref={root}>
      <section className="phead phead--seal" data-theme="light">
        <p className="label"><span className="dot" />&nbsp; Certifications and licences</p>
        <Words as="h1" text={c.headline} />
        <p className="phead__sub lede">{c.sub}</p>
        <div className="seal" aria-hidden="true">
          <svg viewBox="0 0 200 200"><defs><path id="sealpath" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
            <circle cx="100" cy="100" r="98" fill="#277161" /><circle cx="100" cy="100" r="56" fill="#f38021" />
            <text fill="#fff" fontSize="15" letterSpacing="4" fontFamily="Switzer, sans-serif"><textPath href="#sealpath">CERTIFIED · LICENSED · TRANSPARENT · </textPath></text>
            <path d="M78 101l15 15 30-32" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </section>

      <div className="after-hero">
        <section className="docsec" data-theme="light">
          <div className="docsec__head"><Words as="h2" text="Certifications" /><p>{c.certIntro}</p></div>
          {certs.length ? <div className="docs">{certs.map(d => <DocCard d={d} key={d._id} />)}</div> : <p className="docs__empty">Certificates will be published here soon.</p>}
        </section>
        <section className="docsec docsec--alt dark" data-theme="dark">
          <div className="docsec__head"><Words as="h2" text="Licences" /><p>{c.licenceIntro}</p></div>
          {lic.length ? <div className="docs">{lic.map(d => <DocCard d={d} key={d._id} />)}</div> : <p className="docs__empty">Licences will be published here soon.</p>}
        </section>
        <section className="docnote" data-theme="light"><p className="label">Note</p><p className="lede" data-fade="">{c.note}</p></section>
        <CtaBand title={c.ctaText}><Btn to="/contact" variant="dark">Contact Us</Btn></CtaBand>
      </div>
    </div>
  );
}
