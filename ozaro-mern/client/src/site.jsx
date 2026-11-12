import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api.js';

/* ---------------- site content (loaded once from the API) ---------------- */
const SiteCtx = createContext(null);
export function SiteProvider({ children }) {
  const [state, setState] = useState({ content: null, error: null });
  const load = useCallback(() => {
    setState(s => ({ ...s, error: null }));
    api('/content').then(content => setState({ content, error: null })).catch(error => setState({ content: null, error }));
  }, []);
  useEffect(load, [load]);
  return <SiteCtx.Provider value={{ ...state, reload: load }}>{children}</SiteCtx.Provider>;
}
export const useSite = () => useContext(SiteCtx);
export const useContent = key => useContext(SiteCtx)?.content?.[key] || null;

/* ---------------- page transitions ---------------- */
export const TransCtx = createContext({ go: () => {}, pageReady: () => {} });
export const useTransition = () => useContext(TransCtx);

/** Link that plays the curtain transition before navigating. */
export function TLink({ to, children, onClick, ...rest }) {
  const { go } = useTransition();
  return (
    <Link to={to} {...rest} onClick={e => {
      onClick?.(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault(); go(to);
    }}>{children}</Link>
  );
}

/** Button-styled transition link */
export function Btn({ to, href, children, variant = '', magnetic = true, ...rest }) {
  const cls = `btn ${variant ? `btn--${variant}` : ''}`.trim();
  const inner = <>{children} <span className="arr" aria-hidden="true">→</span></>;
  const m = magnetic ? { 'data-magnetic': '' } : {};
  if (href) return <a className={cls} href={href} target={/^https?:/.test(href) ? '_blank' : undefined} rel="noreferrer" {...m} {...rest}>{inner}</a>;
  return <TLink className={cls} to={to} {...m} {...rest}>{inner}</TLink>;
}

/* ---------------- text splitting for mask reveals ---------------- */
export function Words({ text, as: Tag = 'span', lines, ...rest }) {
  const render = (t, key) => {
    const words = String(t || '').split(/\s+/).filter(Boolean);
    return words.map((w, i) => (
      <React.Fragment key={`${key}-${i}`}><span className="wm"><span>{w}</span></span>{i < words.length - 1 ? ' ' : ''}</React.Fragment>
    ));
  };
  const parts = lines || [text];
  return (
    <Tag data-reveal="" {...rest}>
      {parts.map((p, i) => lines ? <span className="ln" key={i}>{render(p, i)}</span> : render(p, i))}
    </Tag>
  );
}
/** Split "A. B. C." into sentences — used for multi-line headlines edited as one string. */
export const sentences = s => String(s || '').split(/(?<=[.!?])\s+/).filter(Boolean);

/* ---------------- SEO ---------------- */
export function useSeo(title, description, image, url) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    if (currentUrl) {
      setMetaTag('property', 'og:url', currentUrl);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = currentUrl;
    }
    const defaultOg = `${typeof window !== 'undefined' ? window.location.origin : ''}/assets/Ozora%20Zylife%20Horizontal%20Logo%20Transparent1.webp`;
    const ogImg = image ? (image.startsWith('http') ? image : `${typeof window !== 'undefined' ? window.location.origin : ''}/${image.replace(/^\//, '')}`) : defaultOg;
    setMetaTag('property', 'og:image', ogImg);
    setMetaTag('name', 'twitter:image', ogImg);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'Ozora Zylife');
  }, [title, description, image, url]);
}

function setMetaTag(attrName, attrVal, contentVal) {
  if (typeof document === 'undefined') return;
  let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrVal);
    document.head.appendChild(tag);
  }
  tag.content = contentVal;
}

/* ---------------- contact helpers ---------------- */
export const isPlaceholder = v => !v || /\[.*\]/.test(v);
export const digits = v => String(v || '').replace(/[^\d]/g, '');
export function waLink(settings, text) {
  const n = isPlaceholder(settings?.whatsapp) ? '' : digits(settings.whatsapp);
  const msg = encodeURIComponent(text || settings?.whatsappMessage || 'Hello Ozora Zylife');
  return `https://wa.me/${n}?text=${msg}`;
}
export const telLink = s => (isPlaceholder(s?.phone) ? undefined : `tel:${String(s.phone).replace(/[^\d+]/g, '')}`);
export const mailLink = s => (isPlaceholder(s?.email) ? undefined : `mailto:${s.email}`);

/** Run once the page is ready: refresh triggers, then reveal (loader / curtain) and play intro. */
export function usePageReady(ready, deps = []) {
  const { pageReady } = useTransition();
  const fired = useRef(false);
  useEffect(() => { fired.current = false; }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return useCallback(intro => {
    if (!ready || fired.current) return;
    fired.current = true;
    pageReady(intro);
  }, [ready, pageReady]);
}
