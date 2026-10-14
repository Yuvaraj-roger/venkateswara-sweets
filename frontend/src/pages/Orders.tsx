import { useEffect, useState } from 'react';
import { api, money, Order } from '../api';
import { statusLabel, Tracker } from '../components';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => api<Order[]>('/orders/my').then(o => { setOrders(o); setError(''); }).catch(e => setError(e.message)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    const t = setInterval(load, 10000); // live tracking refresh
    return () => clearInterval(t);
  }, []);

  async function cancel(id: number) {
    if (!confirm('Cancel this order?')) return;
    try { await api(`/orders/${id}/cancel`, { method: 'PATCH' }); load(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <section className="stack">
      <h2>My orders</h2>
      {loading && <p className="note">Loading...</p>}
      {error && <p className="alert">{error}</p>}
      {!loading && orders.length === 0 && <p className="note">You have not placed any orders yet.</p>}
      {orders.map(o => (
        <article key={o.id} className="panel">
          <div className="row">
            <strong>Order #{o.id}</strong>
            <span className={`tag ${o.status}`}>{statusLabel[o.status]}</span>
          </div>
          <small>{new Date(o.createdAt).toLocaleString('en-IN')}</small>
          <Tracker status={o.status} />
          <ul className="items">
            {o.items.map((i, k) => <li key={k}><span>{i.name} x {i.quantity}</span><span>{money(i.price * i.quantity)}</span></li>)}
          </ul>
          <div className="row"><span>Deliver to: {o.address}</span><strong>{money(o.total)}</strong></div>
          {o.status === 'PLACED' && <button className="btn ghost small" onClick={() => cancel(o.id)}>Cancel order</button>}
        </article>
      ))}
    </section>
  );
}
