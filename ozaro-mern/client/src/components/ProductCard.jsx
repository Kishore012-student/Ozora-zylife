import React from 'react';
import { TLink } from '../site.jsx';
import { img } from '../api.js';

export default function ProductCard({ p, className = '' }) {
  const cover = p.images?.[0];
  return (
    <article className={`pcard ${className}`}>
      <TLink to={`/products/${p.slug}`} className="pcard__link" data-cursor="View" aria-label={`View details of ${p.name}`}>
        <div className="pcard__img">
          {cover ? <img src={img(cover)} alt={p.name} loading="lazy" /> : <div className="pcard__ph" aria-hidden="true"><span className="dot" /></div>}
          <span className={`tag tag--${p.category === 'Ayurveda' ? 'ayur' : 'allo'}`}>{p.category}</span>
        </div>
        <div className="pcard__body">
          <h3 className="pcard__name">{p.name}</h3>
          <p className="pcard__meta">{[p.dosageForm, p.packSize].filter(Boolean).join(' · ')}</p>
          <span className="pcard__cta">View Details <span className="arr" aria-hidden="true">→</span></span>
        </div>
      </TLink>
    </article>
  );
}
