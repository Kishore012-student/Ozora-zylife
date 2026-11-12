import React, { useLayoutEffect } from 'react';
import { useTransition, useSeo, Btn } from '../site.jsx';
import { themeTriggers } from '../motion.js';

export default function NotFound() {
  const { pageReady } = useTransition();
  useSeo('Page not found | Ozora Zylife');
  useLayoutEffect(() => { themeTriggers(document.body); pageReady(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="phead" data-theme="light" style={{ minHeight: '80vh' }}>
      
    </section>
  );
}
