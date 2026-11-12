import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { api, setToken } from '../api.js';
import { stopLenis } from '../motion.js';
import { UiProvider } from './ui.jsx';
import Dashboard from './Dashboard.jsx';
import { ProductList, ProductForm } from './Products.jsx';
import Credentials from './Credentials.jsx';
import Enquiries from './Enquiries.jsx';
import ContentEditor from './ContentEditor.jsx';
import Account from './Account.jsx';
import { PAGES } from './schemas.js';
import './admin.css';

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  useEffect(() => { stopLenis(); document.title = 'Admin | Ozora Zylife'; document.documentElement.classList.add('is-admin'); return () => document.documentElement.classList.remove('is-admin'); }, []);
  const logout = () => { setToken(null); setAdmin(null); };
  return (
    <UiProvider>
      {admin ? <Shell admin={admin} onLogout={logout} /> : <Login onLogin={setAdmin} />}
    </UiProvider>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const r = await api('/auth/login', { method: 'POST', body: { email, password } }); setToken(r.token); onLogin(r.admin); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <div className="alogin">
      <form className="alogin__box" onSubmit={submit}>
        <div className="abrand"><span className="dot" />Ozora Zylife</div>
        <h1>Admin sign in</h1>
        <p className="amuted">Manage products, certificates, enquiries and page content.</p>
        <label className="afld"><span className="afld__l">Email</span><input className="ainp" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label className="afld"><span className="afld__l">Password</span><input className="ainp" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        {err && <p className="aerr" role="alert">{err}</p>}
        <button className="abtn abtn--primary abtn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="alogin__back">← Back to website</Link>
      </form>
    </div>
  );
}

function Shell({ admin, onLogout }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className={`ashell ${open ? 'is-open' : ''}`}>
      <aside className="aside">
        <div className="abrand"><span className="dot" />Ozora Zylife <small>Admin</small></div>
        <nav onClick={close}>
          <NavLink end to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/certifications">Certifications &amp; Licences</NavLink>
          <NavLink to="/admin/enquiries">Enquiries</NavLink>
          <p className="aside__h">Pages</p>
          {PAGES.map(p => <NavLink key={p.key} to={`/admin/pages/${p.key}`}>{p.label}</NavLink>)}
          <p className="aside__h">Account</p>
          <NavLink to="/admin/account">Password</NavLink>
        </nav>
        <div className="aside__foot">
          <span className="amuted">{admin.email}</span>
          <Link className="abtn abtn--sm abtn--ghost" to="/" target="_blank" rel="noreferrer">View site ↗</Link>
          <button className="abtn abtn--sm" onClick={onLogout}>Log out</button>
        </div>
      </aside>
      <div className="amain">
        <header className="atop">
          <button className="atop__menu" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">☰</button>
          <span className="abrand"><span className="dot" />Admin</span>
        </header>
        <div className="acontent">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="certifications" element={<Credentials />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="pages/:key" element={<ContentEditor />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </div>
      </div>
      {open && <div className="ascrim" onClick={close} />}
    </div>
  );
}
