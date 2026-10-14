import { useEffect, useMemo, useState } from 'react';
import { api, money, Product } from '../api';
import { SHOP } from '../config';
import { Thumb } from '../components';
import { useCart } from '../state';

export default function Menu() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const { lines, add, setQty } = useCart();

  useEffect(() => {
    api<Product[]>('/products').then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const cats = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items]);
  const shown = items.filter(i => (cat === 'All' || i.category === cat) && i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <section className="hero">
        <h1>Fresh sweets &amp; snacks, made daily in Ayyappanthangal</h1>
        <p>Order online, we deliver hot. Call us anytime on <a href={`tel:${SHOP.phoneRaw}`}>{SHOP.phone}</a>.</p>
      </section>

      <div className="toolbar">
        <div className="chips">
          {cats.map(c => <button key={c} className={c === cat ? 'chip on' : 'chip'} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <input placeholder="Search sweets, snacks..." value={q} onChange={e => setQ(e.target.value)} aria-label="Search menu" />
      </div>

      {loading && <p className="note">Loading menu...</p>}
      {error && <p className="alert">{error}</p>}
      {!loading && !error && shown.length === 0 && <p className="note">No items found. Please check again soon.</p>}

      <div className="grid">
        {shown.map(p => {
          const line = lines.find(l => l.product.id === p.id);
          return (
            <article key={p.id} className="card">
              <div className="pic"><Thumb src={p.imageUrl} name={p.name} /></div>
              <div className="body">
                <h3>{p.name}</h3>
                <p className="desc">{p.description}</p>
                <div className="row">
                  <span className="price">{money(p.price)}</span>
                  {line ? (
                    <div className="stepper">
                      <button onClick={() => setQty(p.id, line.qty - 1)} aria-label="Decrease">-</button>
                      <span>{line.qty}</span>
                      <button onClick={() => setQty(p.id, line.qty + 1)} aria-label="Increase">+</button>
                    </div>
                  ) : <button className="btn small" onClick={() => add(p)}>Add to cart</button>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
