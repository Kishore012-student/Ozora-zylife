import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- smooth scroll (singleton) ---------- */
let lenis = null;
const raf = t => lenis && lenis.raf(t * 1000);
export function startLenis() {
  if (lenis || reduced) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(raf); lenis.destroy(); lenis = null;
}
export const getLenis = () => lenis;
export function scrollTo(target, immediate = false) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (lenis) lenis.scrollTo(el ?? target, { duration: 1.6, immediate });
  else if (el && el.scrollIntoView) el.scrollIntoView();
  else window.scrollTo(0, typeof target === 'number' ? target : 0);
}

/* ---------- reusable reveals (call inside a gsap.context) ---------- */
export function revealLines(root) {
  if (reduced) return;
  root.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.closest('[data-noauto]')) return;
    gsap.fromTo(el.querySelectorAll('.wm > span'), { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.035, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  root.querySelectorAll('[data-fade]').forEach(el => {
    gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  root.querySelectorAll('[data-clip]').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0 round 20px)' }, { clipPath: 'inset(0% 0 0 0 round 20px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    const im = el.querySelector('img');
    if (im) gsap.fromTo(im, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
}
export function wordScrub(el) {
  if (!el) return;
  if (!el.dataset.split) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w.replace(/</g, '&lt;')}</span>`).join(' ');
    el.dataset.split = '1';
  }
  const ws = el.querySelectorAll('.w');
  if (reduced) { ws.forEach(w => (w.style.opacity = 1)); return; }
  gsap.fromTo(ws, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
}
export function fitText(el) {
  if (!el) return () => {};
  const fit = () => {
    el.style.transform = 'none'; el.style.height = ''; el.style.transformOrigin = 'left top';
    const s = Math.min(1, el.parentElement.clientWidth / el.scrollWidth);
    el.style.transform = `scale(${s})`; el.style.height = `${el.scrollHeight * s}px`;
  };
  fit(); window.addEventListener('resize', fit); document.fonts?.ready.then(fit);
  return () => window.removeEventListener('resize', fit);
}
export function magnetic(root) {
  if (!fine || reduced) return;
  root.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,.45)' }));
  });
}
/** Nav colour follows section theme. Call AFTER pins are created. */
export function themeTriggers(root) {
  const nav = document.querySelector('.nav');
  const set = dark => { nav?.classList.toggle('is-light', dark); };
  set(false);
  root.querySelectorAll('[data-theme]').forEach(sec => {
    const tg = sec.parentElement?.classList.contains('pin-spacer') ? sec.parentElement : sec;
    ScrollTrigger.create({ trigger: tg, start: 'top 40px', end: 'bottom 40px', onToggle: s => s.isActive && set(sec.dataset.theme === 'dark') });
  });
}
