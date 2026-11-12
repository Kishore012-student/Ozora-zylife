import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SiteProvider } from './site.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import About from './pages/About.jsx';
import Quality from './pages/Quality.jsx';
import Certifications from './pages/Certifications.jsx';
import Contact from './pages/Contact.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="adm-boot">Loading admin…</div>}>
        <Routes><Route path="/admin/*" element={<AdminApp />} /></Routes>
      </Suspense>
    );
  }
  return (
    <SiteProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/quality" element={<Quality />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="/disclaimer" element={<Legal doc="disclaimer" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </SiteProvider>
  );
}
