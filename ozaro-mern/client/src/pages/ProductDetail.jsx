import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gsap, reduced, revealLines, magnetic, themeTriggers } from '../motion.js';
import { useContent, useTransition, useSeo, Btn, TLink, waLink } from '../site.jsx';
import { api, img } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const c = useContent('products'), settings = useContent('settings');
  const [p, setP] = useState(null);
  const [err, setErr] = useState(null);
  const [active, setActive] = useState(0);
  const root = useRef(null), mainImg = useRef(null);
  const { pageReady } = useTransition();

  useEffect(() => { setP(null); setErr(null); setActive(0); api(`/products/${slug}`).then(setP).catch(setErr); }, [slug]);
  useSeo(
    p ? `${p.name} | ${p.category} | Ozora Zylife` : err ? 'Product not found | Ozora Zylife' : null,
    p ? `${p.name} by Ozora Zylife. ${[p.dosageForm, p.packSize].filter(Boolean).join(', ')}. View composition and details, and send an enquiry.` : null,
  );

  useLayoutEffect(() => {
    if (!p && !err) return;
    const el = root.current;
    const ctx = gsap.context(() => {
      if (!p) return;
      const intro = el.querySelectorAll('.pd__info > *');
      if (!reduced) { gsap.set(intro, { y: 40, opacity: 0 }); gsap.set('.pd__main', { clipPath: 'inset(100% 0 0 0 round 24px)' }); }
      revealLines(el.querySelector('.pd__more'));
      magnetic(el);
      themeTriggers(el);
      if (!reduced) gsap.from(el.querySelectorAll('.pd__table tr'), { x: -30, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.pd__table', start: 'top 90%' } });
    }, el);
    pageReady(() => ctx.add(() => {
      if (reduced || !p) return;
      gsap.timeline()
        .to('.pd__main', { clipPath: 'inset(0% 0 0 0 round 24px)', duration: 1.4, ease: 'expo.out' })
        .from('.pd__main img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0)
        .to(el.querySelectorAll('.pd__info > *'), { y: 0, opacity: 1, stagger: 0.07, duration: 1, ease: 'expo.out' }, 0.15);
    }));
    return () => ctx.revert();
  }, [p, err]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = i => {
    if (i === active) return;
    if (reduced || !mainImg.current) { setActive(i); return; }
    gsap.to(mainImg.current, { opacity: 0, scale: 1.04, duration: 0.25, ease: 'power2.in', onComplete: () => { setActive(i); gsap.fromTo(mainImg.current, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }); } });
  };

  if (err) {
    return (
      <div ref={root}>
        <section className="phead" data-theme="light">
          <h1>Product not found.</h1>
          <p className="phead__sub lede">This product may have been removed or renamed.</p>
          <div style={{ marginTop: '2rem' }}><Btn to="/products" variant="solid">Browse all products</Btn></div>
        </section>
      </div>
    );
  }
  if (!p) return <div ref={root} className="pd-loading" />;

  const images = p.images?.length ? p.images : [];
  const rows = [['Composition', p.composition], ['Dosage form', p.dosageForm], ['Pack size', p.packSize], ['Storage', p.storage], ['Prescription', p.prescription]].filter(r => r[1]);
  const enquireTo = `/contact?type=${encodeURIComponent('Product enquiry')}&product=${encodeURIComponent(p.name)}`;

  return (
    <div ref={root}>
      <section className="pd" data-theme="light">
        <nav className="crumbs label" aria-label="Breadcrumb"><TLink to="/products">Products</TLink><span>/</span><TLink to={`/products?category=${p.category}`}>{p.category}</TLink></nav>
        <div className="pd__grid">
          <div className="pd__gallery">
            <div className="pd__main">
              {images.length ? <img ref={mainImg} src={img(images[active])} alt={p.name} /> : <div className="pcard__ph" aria-hidden="true"><span className="dot" /></div>}
            </div>
            {images.length > 1 && (
              <div className="pd__thumbs" role="list">
                {images.map((src, i) => (
                  <button key={src + i} role="listitem" className={i === active ? 'is-on' : ''} onClick={() => pick(i)} aria-label={`Show image ${i + 1} of ${p.name}`}>
                    <img src={img(src)} alt={`${p.name} - thumbnail ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="pd__info">
            <span className={`tag tag--${p.category === 'Ayurveda' ? 'ayur' : 'allo'} tag--static`}>{p.category}</span>
            <h1>{p.name}</h1>
            {p.shortDescription && <p className="lede">{p.shortDescription}</p>}
            <table className="pd__table"><tbody>{rows.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table>
            <div className="pd__btns">
              <Btn to={enquireTo} variant="solid">Enquire Now</Btn>
              <Btn href={waLink(settings, `Hello Ozora Zylife, I would like to know more about ${p.name}.`)}>Chat on WhatsApp</Btn>
            </div>
          </div>
        </div>
      </section>

      <section className="pd__more" data-theme="light">
        {p.description && (
          <div className="pd__desc">
            <p className="label">Description</p>
            <div>{p.description.split(/\n+/).map((t, i) => <p key={i}>{t}</p>)}</div>
          </div>
        )}
        <aside className="pd__note" role="note">
          <p className="label">Important note</p>
          <p>{c.importantNote}</p>
        </aside>
      </section>

      <section className="pd__enq dark" data-theme="dark">
        <div>
          <h2>{c.enquiryTitle}</h2>
          <p>{c.enquiryText}</p>
        </div>
        <div className="ctas">
          <Btn to={enquireTo} variant="white">Enquire Now</Btn>
          <Btn href={waLink(settings, `Hello Ozora Zylife, I would like to know more about ${p.name}.`)}>Chat on WhatsApp</Btn>
        </div>
      </section>

      {p.related?.length > 0 && (
        <section className="related" data-theme="light">
          <h2>{c.relatedTitle}</h2>
          <div className="pgrid">{p.related.map(r => <ProductCard key={r._id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
