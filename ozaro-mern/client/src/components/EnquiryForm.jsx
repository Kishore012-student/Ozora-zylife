import React, { useState } from 'react';
import { api } from '../api.js';
import { TLink } from '../site.jsx';

const TYPES = ['Product enquiry', 'Pharmacy or bulk supply', 'General question'];

export default function EnquiryForm({ copy, initialProduct = '', initialType = '' }) {
  const [f, setF] = useState({
    name: '', phone: '+91 ', email: '', business: '',
    type: TYPES.includes(initialType) ? initialType : initialProduct ? 'Product enquiry' : '',
    product: initialProduct, message: '', website: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const [serverMsg, setServerMsg] = useState('');
  
  const set = k => e => {
    let val = e.target.value;
    if (k === 'phone') {
      // Force starts with +91 and strictly allow max 10 digits after +91
      const cleanedDigits = val.replace(/[^\d]/g, '');
      let tenDigits = '';
      if (cleanedDigits.startsWith('91')) {
        tenDigits = cleanedDigits.slice(2, 12);
      } else {
        tenDigits = cleanedDigits.slice(0, 10);
      }
      val = tenDigits ? `+91 ${tenDigits}` : '+91 ';
    }
    setF(s => ({ ...s, [k]: val }));
    if (errors[k]) setErrors(x => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Please enter your full name';
    const digitsOnly = f.phone.replace(/[^\d]/g, '');
    const mobileDigits = digitsOnly.startsWith('91') ? digitsOnly.slice(2) : digitsOnly;
    if (mobileDigits.length !== 10) e.phone = 'Please enter a valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Please enter a valid email address';
    if (!f.type) e.type = 'Please choose an enquiry type';
    if (!f.message.trim()) e.message = 'Please enter your message';
    setErrors(e); return !Object.keys(e).length;
  };
  const submit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending'); setServerMsg('');
    try { await api('/enquiries', { method: 'POST', body: f }); setStatus('ok'); }
    catch (err) { setStatus('error'); setServerMsg(err.status === 429 || err.status === 400 ? err.message : ''); }
  };

  if (status === 'ok') {
    return (
      <div className="form-done" role="status">
        <span className="form-done__mark" aria-hidden="true">✓</span>
        <p className="lede">{copy.success}</p>
        <button className="btn" onClick={() => { setF(s => ({ ...s, message: '' })); setStatus('idle'); }}>Send another enquiry <span className="arr">→</span></button>
      </div>
    );
  }

  const field = (k, label, props = {}, required = true) => (
    <label className={`fld ${errors[k] ? 'has-err' : ''}`}>
      <span>{label}{required ? ' *' : ''}</span>
      <input value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <em>{errors[k]}</em>}
    </label>
  );

  return (
    <form className="eform" onSubmit={submit} noValidate>
      <div className="eform__grid">
        {field('name', 'Full name', { autoComplete: 'name' })}
        {field('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', inputMode: 'numeric', placeholder: '+91 9876543210', maxLength: 14 })}
        {field('email', 'Email address', { type: 'email', autoComplete: 'email' })}
        {field('business', 'Business name', { autoComplete: 'organization' }, false)}
        <label className={`fld ${errors.type ? 'has-err' : ''}`}>
          <span>Enquiry type *</span>
          <select value={f.type} onChange={set('type')} aria-invalid={!!errors.type}>
            <option value="" disabled>Select an option</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          {errors.type && <em>{errors.type}</em>}
        </label>
        {field('product', 'Product name', {}, false)}
      </div>
      <label className={`fld ${errors.message ? 'has-err' : ''}`}>
        <span>Message *</span>
        <textarea rows={5} value={f.message} onChange={set('message')} aria-invalid={!!errors.message} />
        {errors.message && <em>{errors.message}</em>}
      </label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
      {status === 'error' && <p className="form-err" role="alert">{serverMsg || copy.error}</p>}
      <div className="eform__foot">
        <button className="btn btn--solid" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send Enquiry'} <span className="arr">→</span></button>
        <p className="eform__consent">{copy.consent.replace('Privacy Policy.', '')}<TLink to="/privacy">Privacy Policy</TLink>.</p>
      </div>
    </form>
  );
}
