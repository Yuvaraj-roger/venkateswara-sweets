import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money, Order } from '../api';
import { useAuth, useCart } from '../state';

export default function CartPage() {
  const { lines, total, setQty, clear } = useCart();
  const { session } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (lines.length === 0)
    return <section className="panel"><h2>Your cart is empty</h2><p><Link to="/">Pick something sweet from the menu</Link></p></section>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a 10 digit phone number');
    if (address.trim().length < 5) return setError('Enter your full delivery address');
    setBusy(true);
    try {
      await api<Order>('/orders', {
        method: 'POST',
        body: { items: lines.map(l => ({ productId: l.product.id, quantity: l.qty })), address, phone, note },
      });
      clear();
      nav('/orders');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="two">
      <section className="panel">
        <h2>Your cart</h2>
        {lines.map(l => (
          <div key={l.product.id} className="line">
            <div><strong>{l.product.name}</strong><br /><small>{money(l.product.price)} each</small></div>
            <div className="stepper">
              <button onClick={() => setQty(l.product.id, l.qty - 1)} aria-label="Decrease">-</button>
              <span>{l.qty}</span>
              <button onClick={() => setQty(l.product.id, l.qty + 1)} aria-label="Increase">+</button>
            </div>
            <strong>{money(l.product.price * l.qty)}</strong>
          </div>
        ))}
        <div className="line total"><span>Total</span><strong>{money(total)}</strong></div>
      </section>

      <section className="panel">
        <h2>Delivery details</h2>
        {!session ? (
          <p>Please <Link to="/login" state={{ from: '/cart' }}>login or create an account</Link> to place your order.</p>
        ) : (
          <form onSubmit={submit} noValidate>
            <label>Phone<input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="10 digit mobile number" /></label>
            <label>Delivery address<textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="House no, street, area" /></label>
            <label>Note (optional)<input value={note} onChange={e => setNote(e.target.value)} placeholder="Less sugar, call before delivery..." /></label>
            {error && <p className="alert">{error}</p>}
            <button className="btn" disabled={busy}>{busy ? 'Placing order...' : `Place order - ${money(total)}`}</button>
            <p className="note">Payment: Cash on delivery</p>
          </form>
        )}
      </section>
    </div>
  );
}
