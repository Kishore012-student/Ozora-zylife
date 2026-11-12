import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/stats', { auth: true }).then(setS).catch(e => setErr(e.message)); }, []);
  if (err) return <p className="aerr">{err}</p>;
  if (!s) return <p className="amuted">Loading…</p>;
  const cat = k => s.byCategory.find(c => c._id === k)?.count || 0;
  return (
    <div>
      <div className="ahead"><h1>Dashboard</h1><Link className="abtn abtn--primary" to="/admin/products/new">+ Add product</Link></div>
      <div className="astats">
        <Link to="/admin/products" className="astat"><b>{s.total}</b><span>Products</span><small>{s.published} published · {s.drafts} drafts</small></Link>
        <Link to="/admin/products" className="astat"><b>{cat('Allopathy')} / {cat('Ayurveda')}</b><span>Allopathy / Ayurveda</span><small>{s.featured} featured on home</small></Link>
        <Link to="/admin/enquiries" className="astat astat--o"><b>{s.newEnquiries}</b><span>New enquiries</span><small>{s.enquiries} total</small></Link>
        <Link to="/admin/certifications" className="astat"><b>{s.credentials}</b><span>Certificates &amp; licences</span><small>Shown on Certifications page</small></Link>
      </div>
      <section className="acard">
        <div className="ahead ahead--sm"><h2>Latest enquiries</h2><Link to="/admin/enquiries">View all →</Link></div>
        {s.recentEnquiries.length ? (
          <table className="atable"><thead><tr><th>Name</th><th>Type</th><th>Product</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>{s.recentEnquiries.map(e => (
              <tr key={e._id}><td>{e.name}</td><td>{e.type}</td><td>{e.product || '—'}</td><td><span className={`apill apill--${e.status}`}>{e.status}</span></td><td>{new Date(e.createdAt).toLocaleString()}</td></tr>
            ))}</tbody></table>
        ) : <p className="amuted">No enquiries yet. They appear here when someone submits the contact form.</p>}
      </section>
    </div>
  );
}
