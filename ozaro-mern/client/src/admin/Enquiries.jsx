import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useUi } from './ui.jsx';

const STATUSES = ['new', 'contacted', 'closed'];

export default function Enquiries() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const { toast, confirm } = useUi();
  const load = () => api(`/enquiries${filter ? `?status=${filter}` : ''}`, { auth: true }).then(setItems).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (e, patch) => {
    try { const r = await api(`/enquiries/${e._id}`, { method: 'PUT', auth: true, body: patch }); setItems(x => x.map(y => (y._id === r._id ? r : y))); if (open?._id === r._id) setOpen(r); toast('Updated'); }
    catch (err) { toast(err.message, 'err'); }
  };
  const remove = async e => {
    if (!(await confirm({ title: 'Delete this enquiry?', text: `From ${e.name}. This cannot be undone.`, ok: 'Delete', danger: true }))) return;
    try { await api(`/enquiries/${e._id}`, { method: 'DELETE', auth: true }); setOpen(null); load(); toast('Deleted'); } catch (err) { toast(err.message, 'err'); }
  };
  const exportCsv = () => {
    const cols = ['createdAt', 'name', 'phone', 'email', 'business', 'type', 'product', 'message', 'status'];
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...(items || []).map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'ozora-enquiries.csv'; a.click();
  };

  return (
    <div>
      <div className="ahead"><h1>Enquiries</h1><button className="abtn" onClick={exportCsv} disabled={!items?.length}>Export CSV</button></div>
      <div className="afilters">
        {['', ...STATUSES].map(s => <button key={s} className={`achip ${filter === s ? 'is-on' : ''}`} onClick={() => setFilter(s)}>{s || 'All'}</button>)}
      </div>
      {!items ? <p className="amuted">Loading…</p> : items.length === 0 ? <div className="acard"><p>No enquiries yet.</p></div> : (
        <div className="acard acard--flush">
          <table className="atable">
            <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Type</th><th>Product</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>{items.map(e => (
              <tr key={e._id} className={e.status === 'new' ? 'is-new' : ''}>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td><button className="alink" onClick={() => setOpen(e)}>{e.name}</button>{e.business && <div className="amuted">{e.business}</div>}</td>
                <td><a href={`tel:${e.phone}`}>{e.phone}</a><div><a href={`mailto:${e.email}`}>{e.email}</a></div></td>
                <td>{e.type}</td><td>{e.product || '—'}</td>
                <td><select className="ainp ainp--sm" value={e.status} onChange={ev => update(e, { status: ev.target.value })} aria-label="Status">{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                <td className="aact"><button className="abtn abtn--sm" onClick={() => setOpen(e)}>Open</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="adm-modal" role="dialog" aria-modal="true" onClick={ev => ev.target === ev.currentTarget && setOpen(null)}>
          <div className="adm-modal__box adm-modal__box--lg">
            <h3>{open.name}</h3>
            <dl className="adl">
              <div><dt>Phone</dt><dd><a href={`tel:${open.phone}`}>{open.phone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${open.email}`}>{open.email}</a></dd></div>
              <div><dt>Business</dt><dd>{open.business || '—'}</dd></div>
              <div><dt>Enquiry type</dt><dd>{open.type}</dd></div>
              <div><dt>Product</dt><dd>{open.product || '—'}</dd></div>
              <div><dt>Received</dt><dd>{new Date(open.createdAt).toLocaleString()}</dd></div>
            </dl>
            <p className="amsg">{open.message}</p>
            <label className="afld"><span className="afld__l">Internal notes</span>
              <textarea className="ainp" rows={3} defaultValue={open.notes} onBlur={ev => ev.target.value !== open.notes && update(open, { notes: ev.target.value })} /></label>
            <div className="adm-modal__btns">
              <button className="abtn abtn--danger" onClick={() => remove(open)}>Delete</button>
              <span style={{ flex: 1 }} />
              {STATUSES.filter(s => s !== open.status).map(s => <button key={s} className="abtn" onClick={() => update(open, { status: s })}>Mark {s}</button>)}
              <button className="abtn abtn--primary" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
