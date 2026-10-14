import { FormEvent, useEffect, useState } from 'react';
import { api, money, Order, OrderStatus, Product } from '../api';
import { CATEGORIES } from '../config';
import { statusLabel, Thumb } from '../components';

const empty = { name: '', description: '', price: '', category: 'Sweets', imageUrl: '', available: true };
const STATUSES: OrderStatus[] = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function Admin() {
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  return (
    <section className="stack">
      <h2>Shop dashboard</h2>
      <div className="chips">
        <button className={tab === 'orders' ? 'chip on' : 'chip'} onClick={() => setTab('orders')}>Orders</button>
        <button className={tab === 'products' ? 'chip on' : 'chip'} onClick={() => setTab('products')}>Products</button>
      </div>
      {tab === 'orders' ? <OrdersTab /> : <ProductsTab />}
    </section>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const load = () => api<Order[]>('/admin/orders').then(o => { setOrders(o); setError(''); }).catch(e => setError(e.message));
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  async function setStatus(id: number, status: OrderStatus) {
    try { await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }); load(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="stack">
      {error && <p className="alert">{error}</p>}
      {orders.length === 0 && <p className="note">No orders yet. New orders appear here automatically.</p>}
      {orders.map(o => (
        <article key={o.id} className="panel">
          <div className="row">
            <strong>#{o.id} - {o.customerName}</strong>
            <select value={o.status} onChange={e => setStatus(o.id, e.target.value as OrderStatus)} aria-label="Order status">
              {STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </div>
          <small>{new Date(o.createdAt).toLocaleString('en-IN')} - <a href={`tel:${o.phone}`}>{o.phone}</a></small>
          <ul className="items">
            {o.items.map((i, k) => <li key={k}><span>{i.name} x {i.quantity}</span><span>{money(i.price * i.quantity)}</span></li>)}
          </ul>
          <div className="row"><span>{o.address}{o.note ? ` (Note: ${o.note})` : ''}</span><strong>{money(o.total)}</strong></div>
        </article>
      ))}
    </div>
  );
}

function ProductsTab() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => api<Product[]>('/admin/products').then(setItems).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(''); setMsg('');
    const price = Number(form.price);
    if (form.name.trim().length < 2) return setError('Enter the product name');
    if (!(price > 0)) return setError('Price must be greater than 0');
    try {
      const body = { ...form, price };
      if (editId) await api(`/admin/products/${editId}`, { method: 'PUT', body });
      else await api('/admin/products', { method: 'POST', body });
      setMsg(editId ? 'Product updated' : 'Product added');
      setForm(empty); setEditId(null); load();
    } catch (err) { setError((err as Error).message); }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api(`/admin/products/${p.id}`, { method: 'DELETE' }); setMsg('Product deleted'); load(); } catch (e) { setError((e as Error).message); }
  }

  function edit(p: Product) {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), category: p.category, imageUrl: p.imageUrl || '', available: p.available });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={save} noValidate>
        <h3>{editId ? 'Edit product' : 'Add a new product'}</h3>
        <div className="formgrid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Price (Rs.)<input type="number" min="0" step="0.5" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
          <label>Category
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Photo link (image URL)<input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></label>
        </div>
        <label>Description<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <label className="check"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} /> Available for customers</label>
        {error && <p className="alert">{error}</p>}
        {msg && <p className="ok">{msg}</p>}
        <div className="row">
          <button className="btn small">{editId ? 'Save changes' : 'Add product'}</button>
          {editId && <button type="button" className="btn ghost small" onClick={() => { setEditId(null); setForm(empty); }}>Cancel edit</button>}
        </div>
      </form>

      <div className="panel">
        {items.length === 0 && <p className="note">No products yet. Add your first one above.</p>}
        {items.map(p => (
          <div key={p.id} className="prow">
            <div className="mini"><Thumb src={p.imageUrl} name={p.name} /></div>
            <div className="grow"><strong>{p.name}</strong> <small>{p.category}{!p.available && ' - hidden'}</small><br /><small>{money(p.price)}</small></div>
            <button className="btn ghost small" onClick={() => edit(p)}>Edit</button>
            <button className="btn danger small" onClick={() => remove(p)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
