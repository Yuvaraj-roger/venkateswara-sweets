import { useState } from 'react';
import { OrderStatus } from './api';

export function Thumb({ src, name }: { src?: string; name: string }) {
  const [bad, setBad] = useState(false);
  return src && !bad
    ? <img src={src} alt={name} loading="lazy" onError={() => setBad(true)} />
    : <div className="ph" aria-hidden="true">{name.charAt(0)}</div>;
}

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'PLACED', label: 'Order placed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export function Tracker({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') return <p className="cancelled">This order was cancelled</p>;
  const at = STEPS.findIndex(s => s.key === status);
  return (
    <ol className="tracker">
      {STEPS.map((s, i) => (
        <li key={s.key} className={i < at ? 'done' : i === at ? 'now' : ''}>{s.label}</li>
      ))}
    </ol>
  );
}

export const statusLabel: Record<OrderStatus, string> = {
  PLACED: 'Placed', PREPARING: 'Preparing', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};
