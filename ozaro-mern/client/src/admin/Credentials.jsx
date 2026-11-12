import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useUi, Field, FileInput } from './ui.jsx';

const blank = kind => ({ kind, title: '', number: '', issuedBy: '', validUntil: '', file: '', status: 'published', order: 0 });

export default function Credentials() {
  const [items, setItems] = useState(null);
  const [edit, setEdit] = useState(null);
  const { toast, confirm } = useUi();
  const load = () => api('/credentials?all=1', { auth: true }).then(setItems).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async e => {
    e.preventDefault();
    try {
      const body = { ...edit, order: Number(edit.order) || 0 };
      if (edit._id) await api(`/credentials/${edit._id}`, { method: 'PUT', auth: true, body });
      else await api('/credentials', { method: 'POST', auth: true, body });
      toast('Saved'); setEdit(null); load();
    } catch (e2) { toast(e2.message, 'err'); }
  };
  const remove = async d => {
    if (!(await confirm({ title: `Delete “${d.title}”?`, text: 'It will be removed from the Certifications page.', ok: 'Delete', danger: true }))) return;
    try { await api(`/credentials/${d._id}`, { method: 'DELETE', auth: true }); toast('Deleted'); load(); } catch (e) { toast(e.message, 'err'); }
  };
  const set = k => e => setEdit(s => ({ ...s, [k]: e?.target ? e.target.value : e }));

  const group = (kind, title) => (
    <section className="acard acard--flush">
      <div className="ahead ahead--sm ahead--pad"><h2>{title}</h2><button className="abtn abtn--sm abtn--primary" onClick={() => setEdit(blank(kind))}>+ Add {kind}</button></div>
      <table className="atable">
        <thead><tr><th>{kind === 'licence' ? 'Licence type' : 'Certificate name'}</th>{kind === 'licence' && <th>Number</th>}<th>Issued by</th><th>Valid until</th><th>File</th><th>Status</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {(items || []).filter(d => d.kind === kind).map(d => (
            <tr key={d._id}>
              <td>{d.title}</td>{kind === 'licence' && <td>{d.number}</td>}<td>{d.issuedBy}</td><td>{d.validUntil}</td>
              <td>{d.file ? 'Uploaded' : <span className="amuted">None</span>}</td>
              <td><span className={`apill apill--${d.status}`}>{d.status}</span></td>
              <td className="aact"><button className="abtn abtn--sm" onClick={() => setEdit({ ...d })}>Edit</button><button className="abtn abtn--sm abtn--danger" onClick={() => remove(d)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <div>
      <div className="ahead"><h1>Certifications &amp; Licences</h1></div>
      <p className="amuted" style={{ marginBottom: '1.5rem' }}>Upload a clear image or PDF of each certificate and licence. Visitors can open the file from the Certifications page.</p>
      {!items ? <p className="amuted">Loading…</p> : <>{group('certificate', 'Certifications')}{group('licence', 'Licences')}</>}

      {edit && (
        <div className="adm-modal" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && setEdit(null)}>
          <form className="adm-modal__box adm-modal__box--lg" onSubmit={save}>
            <h3>{edit._id ? 'Edit' : 'Add'} {edit.kind}</h3>
            <div className="aform">
              <Field label={edit.kind === 'licence' ? 'Licence type *' : 'Certificate name *'} wide><input className="ainp" value={edit.title} onChange={set('title')} required /></Field>
              {edit.kind === 'licence' && <Field label="Licence number"><input className="ainp" value={edit.number} onChange={set('number')} /></Field>}
              <Field label="Issued by"><input className="ainp" value={edit.issuedBy} onChange={set('issuedBy')} /></Field>
              <Field label="Valid until"><input className="ainp" value={edit.validUntil} onChange={set('validUntil')} placeholder="e.g. 31 March 2028" /></Field>
              <Field label="Status"><select className="ainp" value={edit.status} onChange={set('status')}><option value="published">Published</option><option value="draft">Draft (hidden)</option></select></Field>
              <Field label="Display order"><input className="ainp" type="number" value={edit.order} onChange={set('order')} /></Field>
              <Field label="Certificate file (image or PDF)" wide><FileInput value={edit.file} onChange={set('file')} accept="image/*,application/pdf" label="Upload file" /></Field>
            </div>
            <div className="adm-modal__btns"><button type="button" className="abtn" onClick={() => setEdit(null)}>Cancel</button><button className="abtn abtn--primary">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
