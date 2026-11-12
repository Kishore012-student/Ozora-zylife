import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useUi, FileInput } from './ui.jsx';
import { PAGES } from './schemas.js';

const VIEW = { home: '/', about: '/about', products: '/products', quality: '/quality', certifications: '/certifications', contact: '/contact', legal: '/privacy', settings: '/contact' };

function FieldEditor({ f, value, onChange }) {
  const t = f.type || 'text';
  const hasPh = typeof value === 'string' && /\[.*\]/.test(value);
  const wrap = el => (
    <div className={`afld afld--wide ${hasPh ? 'has-ph' : ''}`}>
      {f.label && <span className="afld__l">{f.label}{hasPh && <em className="aph">placeholder</em>}</span>}
      {el}
      {f.hint && <small className="afld__h">{f.hint}</small>}
    </div>
  );
  if (t === 'text') {
    const isPhoneField = f.k === 'phone' || f.k === 'whatsapp';
    const handleTextChange = e => {
      let val = e.target.value;
      if (isPhoneField) {
        // Enforce +91 and 10 digits only
        const cleaned = val.replace(/[^\d]/g, '');
        let ten = cleaned.startsWith('91') ? cleaned.slice(2, 12) : cleaned.slice(0, 10);
        val = ten ? `+91 ${ten}` : '+91 ';
      }
      onChange(val);
    };
    return wrap(
      <input
        className="ainp"
        type={isPhoneField ? 'tel' : 'text'}
        inputMode={isPhoneField ? 'numeric' : undefined}
        maxLength={isPhoneField ? 14 : undefined}
        value={value ?? ''}
        placeholder={isPhoneField ? '+91 9876543210' : ''}
        onChange={handleTextChange}
      />
    );
  }
  if (t === 'textarea') return wrap(<textarea className="ainp" rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} />);
  if (t === 'image') return wrap(<FileInput value={value} onChange={onChange} />);
  if (t === 'group') return <div className="agroup">{f.fields.map(sf => <FieldEditor key={sf.k} f={sf} value={value?.[sf.k]} onChange={v => onChange({ ...(value || {}), [sf.k]: v })} />)}</div>;

  const arr = Array.isArray(value) ? value : [];
  const move = (i, d) => { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  const del = i => onChange(arr.filter((_, j) => j !== i));
  const ctl = i => (
    <div className="alist__ctl">
      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
      <button type="button" onClick={() => move(i, 1)} disabled={i === arr.length - 1} aria-label="Move down">↓</button>
      <button type="button" onClick={() => del(i)} aria-label="Remove">✕</button>
    </div>
  );
  if (t === 'strings') return wrap(
    <div className="alist">
      {arr.map((s, i) => (
        <div className="alist__item" key={i}>
          <textarea className="ainp" rows={3} value={s} onChange={e => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} />
          {ctl(i)}
        </div>
      ))}
      <button type="button" className="abtn abtn--sm" onClick={() => onChange([...arr, ''])}>+ Add {f.item || 'item'}</button>
    </div>
  );
  if (t === 'list') return wrap(
    <div className="alist">
      {arr.map((obj, i) => (
        <div className="alist__item alist__item--obj" key={i}>
          <span className="alist__n">{String(i + 1).padStart(2, '0')}</span>
          <div className="alist__fields">
            {f.fields.map(sf => <FieldEditor key={sf.k} f={sf} value={obj?.[sf.k]} onChange={v => onChange(arr.map((x, j) => (j === i ? { ...x, [sf.k]: v } : x)))} />)}
          </div>
          {ctl(i)}
        </div>
      ))}
      <button type="button" className="abtn abtn--sm" onClick={() => onChange([...arr, Object.fromEntries(f.fields.map(sf => [sf.k, '']))])}>+ Add {f.item || 'item'}</button>
    </div>
  );
  return null;
}

export default function ContentEditor() {
  const { key } = useParams();
  const page = PAGES.find(p => p.key === key);
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, confirm } = useUi();

  useEffect(() => { setData(null); setDirty(false); if (page) api(`/content/${key}`).then(setData).catch(e => toast(e.message, 'err')); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const warn = e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!page) return <p>Unknown page.</p>;
  if (!data) return <p className="amuted">Loading…</p>;
  const set = (k, v) => { setData(d => ({ ...d, [k]: v })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try { setData(await api(`/content/${key}`, { method: 'PUT', auth: true, body: data })); setDirty(false); toast('Page content saved. Refresh the website to see it.'); }
    catch (e) { toast(e.message, 'err'); } finally { setSaving(false); }
  };
  const reset = async () => {
    if (!(await confirm({ title: 'Restore default content?', text: 'All edits on this page will be replaced by the original content.', ok: 'Restore', danger: true }))) return;
    try { setData(await api(`/content/${key}/reset`, { method: 'POST', auth: true })); setDirty(false); toast('Defaults restored'); } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <div>
      <div className="ahead ahead--sticky">
        <div><h1>{page.label}</h1>{data._updatedAt && <p className="amuted">Last saved {new Date(data._updatedAt).toLocaleString()}</p>}</div>
        <div className="ahead__btns">
          <Link className="abtn abtn--ghost" to={VIEW[key] || '/'} target="_blank">View page ↗</Link>
          <button className="abtn" onClick={reset}>Restore defaults</button>
          <button className="abtn abtn--primary" onClick={save} disabled={saving || !dirty}>{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
        </div>
      </div>
      {page.intro && <p className="amuted" style={{ marginBottom: '1.5rem' }}>{page.intro}</p>}
      {page.sections.map(s => (
        <section className="acard" key={s.title}>
          <h2>{s.title}</h2>
          {s.note && <p className="amuted">{s.note}</p>}
          <div className="aform">{s.fields.map(f => <FieldEditor key={f.k} f={f} value={data[f.k]} onChange={v => set(f.k, v)} />)}</div>
        </section>
      ))}
    </div>
  );
}
