import React, { useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap, reduced, revealLines, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Words, waLink, telLink, mailLink, isPlaceholder } from '../site.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { WaIcon } from '../components/Layout.jsx';

export default function Contact() {
  const c = useContent('contact'), s = useContent('settings');
  useSeo(c.seoTitle, c.seoDescription);
  const [params] = useSearchParams();
  const root = useRef(null);
  const { pageReady } = useTransition();

  useLayoutEffect(() => {
    const el = root.current;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.phead h1 .wm > span');
      if (!reduced) {
        gsap.set(words, { yPercent: 110 });
        gsap.set(el.querySelectorAll('.cgrid > *'), { y: 60, opacity: 0 });
      }
      revealLines(el.querySelector('.cmap'));
      magnetic(el);
      themeTriggers(el);
    }, el);
    pageReady(() => ctx.add(() => {
      if (reduced) return;
      gsap.timeline()
        .to(el.querySelectorAll('.phead h1 .wm > span'), { yPercent: 0, stagger: 0.08, duration: 1.3, ease: 'expo.out' })
        .fromTo('.phead__sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, 0.25)
        .to(el.querySelectorAll('.cgrid > *'), { y: 0, opacity: 1, stagger: 0.12, duration: 1.2, ease: 'expo.out' }, 0.35);
    }));
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const details = [['Address', s.address], ['Phone', s.phone, telLink(s)], ['WhatsApp', s.whatsapp, waLink(s)], ['Email', s.email, mailLink(s)], ['Business hours', s.hours]];
  const mapOk = !isPlaceholder(s.mapQuery);
  return (
    <div ref={root}>
      <section className="phead" data-theme="light">
        <p className="label"><span className="dot" />&nbsp; Contact us</p>
        <Words as="h1" text={c.headline} />
        <p className="phead__sub lede">{c.sub}</p>
      </section>

      <section className="contact" data-theme="light">
        <div className="cgrid">
          <div className="cform">
            <h2 className="cform__t">Send us an enquiry</h2>
            <EnquiryForm copy={c} initialProduct={params.get('product') || ''} initialType={params.get('type') || ''} />
          </div>
          <aside className="cside dark">
            <h2 className="cform__t">Contact details</h2>
            <dl className="cdl">
              {details.map(([k, v, href]) => (
                <div key={k}><dt className="label">{k}</dt><dd>{href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{v}</a> : v}</dd></div>
              ))}
            </dl>
            <div className="cquick">
              <a className="btn btn--white" href={telLink(s) || '#'} aria-disabled={!telLink(s)} onClick={e => !telLink(s) && e.preventDefault()}>Call Us <span className="arr">→</span></a>
              <a className="btn btn--warm" href={waLink(s)} target="_blank" rel="noreferrer"><WaIcon /> Chat on WhatsApp</a>
              <a className="btn" href={mailLink(s) || '#'} aria-disabled={!mailLink(s)} onClick={e => !mailLink(s) && e.preventDefault()}>Email Us <span className="arr">→</span></a>
            </div>
          </aside>
        </div>
      </section>

      <section className="cmap" data-theme="light">
        <div className="cmap__frame" data-clip="">
          {mapOk ? (
            <iframe title="Ozora Zylife location on Google Maps" src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="cmap__ph"><span className="cmap__pin" aria-hidden="true" /><p className="lede">Map location: {s.mapQuery}</p><p>The map appears here once the office address is added from the admin panel.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}
