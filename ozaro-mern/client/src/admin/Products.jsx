import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, img } from '../api.js';
import { useUi, Field, Gallery } from './ui.jsx';

const FORMS = ['Tablet', 'Capsule', 'Syrup', 'Oil', 'Powder', 'Other'];
const EMPTY = { name: '', category: 'Allopathy', shortDescription: '', description: '', composition: '', dosageForm: 'Tablet', packSize: '', storage: '', prescription: 'Required', images: [], featured: false, status: 'published', order: 0 };

export function ProductList() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const { toast, confirm } = useUi();
  const load = () => api('/products?all=1', { auth: true }).then(setItems).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => (items || []).filter(p => (!cat || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())), [items, q, cat]);

  const remove = async p => {
    if (!(await confirm({ title: `Delete “${p.name}”?`, text: 'This removes the product from the website permanently.', ok: 'Delete', danger: true }))) return;
    try { await api(`/products/${p._id}`, { method: 'DELETE', auth: true }); toast('Product deleted'); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const toggle = async (p, patch) => {
    try { await api(`/products/${p._id}`, { method: 'PUT', auth: true, body: patch }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };

  return (
    <div>
      <div className="ahead"><h1>Products</h1><Link className="abtn abtn--primary" to="/admin/products/new">+ Add product</Link></div>
      <div className="afilters">
        <input className="ainp" placeholder="Search by product name" value={q} onChange={e => setQ(e.target.value)} aria-label="Search products" />
        <select className="ainp" value={cat} onChange={e => setCat(e.target.value)} aria-label="Category">
          <option value="">All categories</option><option>Allopathy</option><option>Ayurveda</option>
        </select>
      </div>
      {!items ? <p className="amuted">Loading…</p> : list.length === 0 ? <div className="acard"><p>No products found.</p></div> : (
        <div className="acard acard--flush">
          <table className="atable">
            <thead><tr><th>Product</th><th>Category</th><th>Form · Pack</th><th>Featured</th><th>Status</th><th>Order</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p._id}>
                  <td><div className="aprod">{p.images?.[0] ? <img src={img(p.images[0])} alt="" /> : <span className="aprod__ph" />}<Link to={`/admin/products/${p._id}`}>{p.name}</Link></div></td>
                  <td><span className={`apill apill--${p.category === 'Ayurveda' ? 'ayur' : 'allo'}`}>{p.category}</span></td>
                  <td>{[p.dosageForm, p.packSize].filter(Boolean).join(' · ')}</td>
                  <td><button className={`aswitch ${p.featured ? 'is-on' : ''}`} onClick={() => toggle(p, { featured: !p.featured })} aria-pressed={p.featured} aria-label="Featured on home page"><i /></button></td>
                  <td><button className={`apill apill--${p.status}`} onClick={() => toggle(p, { status: p.status === 'published' ? 'draft' : 'published' })} title="Click to toggle">{p.status}</button></td>
                  <td>{p.order}</td>
                  <td className="aact"><Link className="abtn abtn--sm" to={`/admin/products/${p._id}`}>Edit</Link><button className="abtn abtn--sm abtn--danger" onClick={() => remove(p)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const { toast, confirm } = useUi();
  const [f, setF] = useState(isNew ? EMPTY : null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isNew) { setF(EMPTY); return; }
    api(`/admin/products/${id}`, { auth: true }).then(p => setF({ ...EMPTY, ...p })).catch(e => setErr(e.message));
  }, [id, isNew]);

  if (err) return <p className="aerr">{err}</p>;
  if (!f) return <p className="amuted">Loading…</p>;
  const set = k => e => setF(s => ({ ...s, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  const save = async e => {
    e.preventDefault();
    if (!f.name.trim()) { toast('Product name is required', 'err'); return; }
    setSaving(true);
    try {
      const body = { ...f, order: Number(f.order) || 0 };
      const r = isNew ? await api('/products', { method: 'POST', auth: true, body }) : await api(`/products/${id}`, { method: 'PUT', auth: true, body });
      toast(isNew ? 'Product created' : 'Changes saved');
      if (isNew) nav(`/admin/products/${r._id}`, { replace: true }); else setF({ ...EMPTY, ...r });
    } catch (e2) { toast(e2.message, 'err'); } finally { setSaving(false); }
  };
  const remove = async () => {
    if (!(await confirm({ title: `Delete “${f.name}”?`, text: 'This removes the product from the website permanently.', ok: 'Delete', danger: true }))) return;
    try { await api(`/products/${id}`, { method: 'DELETE', auth: true }); toast('Product deleted'); nav('/admin/products'); } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <form onSubmit={save}>
      <div className="ahead">
        <div><Link to="/admin/products" className="aback">← Products</Link><h1>{isNew ? 'Add product' : f.name || 'Edit product'}</h1></div>
        <div className="ahead__btns">
          {!isNew && f.slug && <Link className="abtn abtn--ghost" to={`/products/${f.slug}`} target="_blank">Preview ↗</Link>}
          {!isNew && <button type="button" className="abtn abtn--danger" onClick={remove}>Delete</button>}
          <button className="abtn abtn--primary" disabled={saving}>{saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}</button>
        </div>
      </div>
      <div className="agrid2">
        <section className="acard">
          <h2>Product details</h2>
          <div className="aform">
            <Field label="Product name *" wide><input className="ainp" value={f.name} onChange={set('name')} required /></Field>
            <Field label="Category"><select className="ainp" value={f.category} onChange={set('category')}><option>Allopathy</option><option>Ayurveda</option></select></Field>
            <Field label="Dosage form"><select className="ainp" value={f.dosageForm} onChange={set('dosageForm')}>{FORMS.map(x => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Pack size" hint="For example 10 x 10, 100 ml"><input className="ainp" value={f.packSize} onChange={set('packSize')} /></Field>
            <Field label="Prescription"><select className="ainp" value={f.prescription} onChange={set('prescription')}><option>Required</option><option>Not required</option></select></Field>
            <Field label="Short description" wide hint="Shown under the product name"><textarea className="ainp" rows={2} value={f.shortDescription} onChange={set('shortDescription')} /></Field>
            <Field label="Composition" wide><textarea className="ainp" rows={2} value={f.composition} onChange={set('composition')} /></Field>
            <Field label="Storage" wide><input className="ainp" value={f.storage} onChange={set('storage')} /></Field>
            <Field label="Full description" wide hint="Use a blank line to start a new paragraph"><textarea className="ainp" rows={7} value={f.description} onChange={set('description')} /></Field>
          </div>
        </section>
        <div>
          <section className="acard">
            <h2>Image gallery</h2>
            <p className="amuted">The first image is the main image. Use the arrows to reorder.</p>
            <Gallery value={f.images} onChange={set('images')} />
          </section>
          <section className="acard">
            <h2>Visibility</h2>
            <div className="aform">
              <Field label="Status"><select className="ainp" value={f.status} onChange={set('status')}><option value="published">Published</option><option value="draft">Draft (hidden)</option></select></Field>
              <Field label="Display order" hint="Lower numbers show first"><input className="ainp" type="number" value={f.order} onChange={set('order')} /></Field>
              <label className="acheck afld--wide"><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Show in “Featured products” on the home page</label>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
