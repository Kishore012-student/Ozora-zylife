import React, { useState } from 'react';
import { api } from '../api.js';
import { useUi, Field } from './ui.jsx';

export default function Account() {
  const [f, setF] = useState({ current: '', next: '', again: '' });
  const { toast } = useUi();
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  const save = async e => {
    e.preventDefault();
    if (f.next !== f.again) { toast('New passwords do not match', 'err'); return; }
    try { await api('/auth/password', { method: 'POST', auth: true, body: { current: f.current, next: f.next } }); toast('Password updated'); setF({ current: '', next: '', again: '' }); }
    catch (err) { toast(err.message, 'err'); }
  };
  return (
    <form onSubmit={save} style={{ maxWidth: 520 }}>
      <div className="ahead"><h1>Change password</h1></div>
      <section className="acard"><div className="aform aform--1">
        <Field label="Current password" wide><input className="ainp" type="password" value={f.current} onChange={set('current')} required autoComplete="current-password" /></Field>
        <Field label="New password" wide hint="At least 8 characters"><input className="ainp" type="password" value={f.next} onChange={set('next')} required minLength={8} autoComplete="new-password" /></Field>
        <Field label="Repeat new password" wide><input className="ainp" type="password" value={f.again} onChange={set('again')} required autoComplete="new-password" /></Field>
        <button className="abtn abtn--primary">Update password</button>
      </div></section>
    </form>
  );
}
