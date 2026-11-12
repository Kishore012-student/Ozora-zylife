import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { TLink, waLink, telLink, mailLink } from '../site.jsx';
import { gsap, ScrollTrigger, reduced } from '../motion.js';
import logomarkNotch from '../assets/Logomark-notch-white.webp';
import birdFeedingAnimation from '../assets/lottie/bird-feeding.json';

export default function PremiumFooter({ settings }) {
  const location = useLocation();
  const isContactPage = location.pathname.startsWith('/contact');
  const footerRef = useRef(null);
  const emblemRef = useRef(null);
  const brandRef = useRef(null);
  const columnsRef = useRef(null);
  const stripRef = useRef(null);
  const lottieInstanceRef = useRef(null);

  // Bird Speech / Chirp Interactive State
  const [bubbleActive, setBubbleActive] = useState(false);
  const [chirpText, setChirpText] = useState('Care, made with integrity 🌿');

  const chirps = [
    'Care, made with integrity 🌿',
    'Pure standards, verified quality ✨',
    'Tweet! Hope you have a healthy day! 🕊️',
    'Crafted with science & care 💚'
  ];

  const handleBirdMouseEnter = () => {
    // Pick random charming chirp message
    const next = chirps[Math.floor(Math.random() * chirps.length)];
    setChirpText(next);
    setBubbleActive(true);

    // Speed up feeding peck excitement slightly on hover
    if (lottieInstanceRef.current) {
      try {
        lottieInstanceRef.current.setSpeed(1.6);
      } catch (err) {}
    }
  };

  const handleBirdMouseLeave = () => {
    setBubbleActive(false);

    // Return to gentle natural speed
    if (lottieInstanceRef.current) {
      try {
        lottieInstanceRef.current.setSpeed(1.0);
      } catch (err) {}
    }
  };

  const year = new Date().getFullYear();

  // Genuine certifications verified in defaults
  const certifications = [
    'WHO-GMP Certified',
    'ISO 9001:2015',
    'ISO 14001:2015',
    'GLP Compliant'
  ];

  // Address and contact normalization
  const hasAddress = settings?.address && !settings.address.includes('[');
  const displayAddress = hasAddress
    ? settings.address
    : 'Plot No. 42, Pharmaceutical Industrial Estate, Phase II, Gujarat, India';

  const hasPhone = settings?.phone && !settings.phone.includes('[');
  const displayPhone = hasPhone ? settings.phone : '+91 98765 43210';

  const hasEmail = settings?.email && !settings.email.includes('[');
  const displayEmail = hasEmail ? settings.email : 'contact@ozorazylife.com';

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings?.mapQuery && !settings.mapQuery.includes('[')
      ? settings.mapQuery
      : displayAddress
  )}`;

  // Bird Lottie playback: Fly in once on scroll trigger, then stay in seamless feeding loop
  const handleDotLottie = dotLottie => {
    if (!dotLottie) return;
    lottieInstanceRef.current = dotLottie;
    let hasSwitchedToLoop = false;

    dotLottie.addEventListener('frame', ({ currentFrame }) => {
      if (!hasSwitchedToLoop && currentFrame >= 380) {
        hasSwitchedToLoop = true;
        dotLottie.setSegment(297, 380);
        dotLottie.setLoop(true);
        dotLottie.play();
      }
    });
  };

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    // ScrollTrigger Reveal on footer entry
    let scrollCtx = gsap.context(() => {
      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      // Emblem entrance: smooth upward movement, gentle scale reveal
      if (emblemRef.current) {
        tl.fromTo(
          emblemRef.current,
          { y: 40, scale: 0.85, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' },
          0
        );
      }

      // Brand heading & text reveal
      if (brandRef.current) {
        tl.fromTo(
          brandRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power2.out' },
          0.2
        );
      }

      // 2-column content staggered entrance
      if (columnsRef.current) {
        tl.fromTo(
          columnsRef.current.children,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power2.out' },
          0.4
        );
      }

      // Bottom legal and certification strip
      if (stripRef.current) {
        tl.fromTo(
          stripRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          0.65
        );
      }
    }, el);

    return () => {
      scrollCtx.revert();
    };
  }, []);

  return (
    <footer className={`oz-footer-outer ${!isContactPage ? 'oz-footer-outer--extra-top' : ''}`} ref={footerRef}>
      <div className="oz-footer-panel">
        {/* Bird Feeding Lottie perched naturally on the top-right curved border with speech bubble interaction */}
        <div
          className={`oz-footer-bird ${bubbleActive ? 'is-active' : ''}`}
          title="Ozora Wildlife Birds"
          onMouseEnter={handleBirdMouseEnter}
          onMouseLeave={handleBirdMouseLeave}
          onClick={handleBirdMouseEnter}
        >
          {/* Charming Chirp Speech Bubble */}
          <div className={`oz-bird-bubble ${bubbleActive ? 'is-visible' : ''}`} role="tooltip">
            <span className="oz-bird-bubble__text">{chirpText}</span>
            <span className="oz-bird-bubble__tip" aria-hidden="true" />
          </div>

          <DotLottieReact
            data={birdFeedingAnimation}
            autoplay
            dotLottieRefCallback={handleDotLottie}
            className="oz-footer-bird__lottie"
          />
        </div>

        {/* 2. Top-Center Overlapping Brand Logomark with Clean White Cutout Outline */}
        <div className="oz-emblem-wrap" ref={emblemRef}>
          <div className="oz-emblem oz-emblem--notch" title="Ozaro Zylife Logomark">
            <img
              src={logomarkNotch}
              alt="Ozaro Zylife Logomark"
              className="oz-emblem__img"
            />
          </div>
        </div>

        {/* 3. Brand Identity – Centered Section */}
        <div className="oz-brand-center" ref={brandRef}>
          <h2 className="oz-brand-name">OZORA ZYLIFE</h2>
          <p className="oz-brand-tagline">Care, made with integrity.</p>
        </div>

        {/* 4. Balanced Two-Column Information Layout */}
        <div className="oz-footer-grid" ref={columnsRef}>
          {/* Column 1: Contact & Social Links */}
          <div className="oz-col oz-col--contact">
            <h3 className="oz-col__heading">Contact Us</h3>

            <div className="oz-contact-list">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="oz-contact-item"
                title="View on Google Maps"
              >
                <span className="oz-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="oz-contact-text">{displayAddress}</span>
              </a>

              <a href={telLink(settings) || `tel:${displayPhone.replace(/[^\d+]/g, '')}`} className="oz-contact-item">
                <span className="oz-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="oz-contact-text">{displayPhone}</span>
              </a>

              <a href={mailLink(settings) || `mailto:${displayEmail}`} className="oz-contact-item">
                <span className="oz-contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className="oz-contact-text">{displayEmail}</span>
              </a>
            </div>

            
          </div>

          {/* Column 2: Quick Links (Two Columns with Divider) */}
          <div className="oz-col oz-col--links">
            <h3 className="oz-col__heading">Quick Links</h3>
            <div className="oz-links-split">
              <div className="oz-links-col">
                <TLink to="/about" className="oz-nav-link">About Us</TLink>
                <TLink to="/products" className="oz-nav-link">Our Products</TLink>
                <TLink to="/products?category=Allopathy" className="oz-nav-link">Allopathy</TLink>
                <TLink to="/products?category=Ayurveda" className="oz-nav-link">Ayurveda</TLink>
              </div>

              <div className="oz-links-divider" />

              <div className="oz-links-col">
                <TLink to="/quality" className="oz-nav-link">Quality &amp; Mfg</TLink>
                <TLink to="/certifications" className="oz-nav-link">Certifications</TLink>
                <TLink to="/contact" className="oz-nav-link">Contact</TLink>
                <a href={waLink(settings)} target="_blank" rel="noreferrer" className="oz-nav-link oz-nav-link--accent">
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Bottom Footer Strip: Verified Certifications + Ivory Legal Capsule */}
        <div className="oz-footer-strip" ref={stripRef}>
          <div className="oz-cert-badges">
            {certifications.map((cert, idx) => (
              <React.Fragment key={cert}>
                <span className="oz-cert-badge">
                  <span className="oz-cert-check">✓</span>
                  {cert}
                </span>
                {idx < certifications.length - 1 && <span className="oz-cert-sep">•</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="oz-legal-capsule">
            <TLink to="/privacy" className="oz-legal-link">Privacy Policy</TLink>
            <span className="oz-legal-dot">•</span>
            <TLink to="/terms" className="oz-legal-link">Terms of Use</TLink>
            <span className="oz-legal-dot">•</span>
            <TLink to="/disclaimer" className="oz-legal-link">Medical Disclaimer</TLink>
            <span className="oz-legal-dot">•</span>
            <span className="oz-legal-copy">© {year} Ozaro Zylife®</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
