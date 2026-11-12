import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { api, img } from '../api.js';

/* ---------- toasts + confirm dialog ---------- */
const UiCtx = createContext(null);
export const useUi = () => useContext(UiCtx);

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const id = useRef(0);
  const toast = useCallback((msg, kind = 'ok') => {
    const t = { id: ++id.current, msg, kind };
    setToasts(x => [...x, t]);
    setTimeout(() => setToasts(x => x.filter(y => y.id !== t.id)), 3600);
  }, []);
  const confirm = useCallback(opts => new Promise(resolve => setDialog({ ...opts, resolve })), []);
  const close = v => { dialog?.resolve(v); setDialog(null); };
  return (
    <UiCtx.Provider value={{ toast, confirm }}>
      {children}
      <div className="adm-toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={`adm-toast adm-toast--${t.kind}`}>{t.msg}</div>)}</div>
      {dialog && (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="dlg-t" onClick={e => e.target === e.currentTarget && close(false)}>
          <div className="adm-modal__box">
            <h3 id="dlg-t">{dialog.title || 'Are you sure?'}</h3>
            {dialog.text && <p>{dialog.text}</p>}
            <div className="adm-modal__btns">
              <button className="abtn" onClick={() => close(false)} autoFocus>Cancel</button>
              <button className={`abtn ${dialog.danger ? 'abtn--danger' : 'abtn--primary'}`} onClick={() => close(true)}>{dialog.ok || 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </UiCtx.Provider>
  );
}

/* ---------- form controls ---------- */
export function Field({ label, hint, children, wide }) {
  return (
    <label className={`afld ${wide ? 'afld--wide' : ''}`}>
      <span className="afld__l">{label}</span>
      {children}
      {hint && <small className="afld__h">{hint}</small>}
    </label>
  );
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  return api('/upload', { method: 'POST', form, auth: true });
}

const isPdf = f => /\.pdf($|\?)/i.test(f || '');

/** Single image / file picker with upload + preview */
export function FileInput({ value, onChange, accept = 'image/*', label = 'Upload image' }) {
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  const pick = async e => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setBusy(true);
    try { const r = await uploadFile(f); onChange(r.url); toast('File uploaded'); }
    catch (err) { toast(err.message, 'err'); }
    finally { setBusy(false); }
  };
  return (
    <div className="afile">
      <div className="afile__prev">
        {value ? (isPdf(value) ? <span className="afile__pdf">PDF</span> : <img src={img(value)} alt="" />) : <span className="afile__none">No file</span>}
      </div>
      <div className="afile__ctl">
        <span className="abtn abtn--sm afile__btn">{busy ? 'Uploading…' : value ? 'Replace' : label}<input type="file" accept={accept} onChange={pick} disabled={busy} /></span>
        {value && <button type="button" className="abtn abtn--sm abtn--ghost" onClick={() => onChange('')}>Remove</button>}
        <input className="ainp ainp--sm" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="or paste a path / URL" aria-label="File path" />
      </div>
    </div>
  );
}

/** Multi-image gallery with upload, reorder and remove */
export function Gallery({ value = [], onChange }) {
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  const add = async e => {
    const files = [...(e.target.files || [])]; e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) urls.push((await uploadFile(f)).url);
      onChange([...value, ...urls]); toast(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch (err) { toast(err.message, 'err'); } finally { setBusy(false); }
  };
  const move = (i, d) => { const a = [...value]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  return (
    <div className="agal">
      {value.map((src, i) => (
        <div className="agal__item" key={src + i}>
          <img src={img(src)} alt="" />
          {i === 0 && <span className="agal__main">Main</span>}
          <div className="agal__ctl">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left">←</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move right">→</button>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove image">✕</button>
          </div>
        </div>
      ))}
      <label className="agal__add">
        <input type="file" accept="image/*" multiple onChange={add} disabled={busy} />
        <span>{busy ? 'Uploading…' : '+ Add images'}</span>
      </label>
    </div>
  );
}
