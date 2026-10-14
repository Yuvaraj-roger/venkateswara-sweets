import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getSession, saveSession, Session, Product } from './api';

interface AuthCtx { session: Session | null; login: (s: Session) => void; logout: () => void }
const Auth = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Auth);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(getSession());
  const login = (s: Session) => { saveSession(s); setSession(s); };
  const logout = () => { saveSession(null); setSession(null); };
  return <Auth.Provider value={{ session, login, logout }}>{children}</Auth.Provider>;
}

export interface CartLine { product: Product; qty: number }
interface CartCtx {
  lines: CartLine[]; count: number; total: number;
  add: (p: Product) => void; setQty: (id: number, q: number) => void; clear: () => void;
}
const Cart = createContext<CartCtx>(null!);
export const useCart = () => useContext(Cart);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem('sweets_cart') || '[]'); } catch { return []; }
  });
  useEffect(() => localStorage.setItem('sweets_cart', JSON.stringify(lines)), [lines]);

  const add = (p: Product) => setLines(ls => ls.some(l => l.product.id === p.id)
    ? ls.map(l => l.product.id === p.id ? { ...l, qty: Math.min(l.qty + 1, 50) } : l)
    : [...ls, { product: p, qty: 1 }]);
  const setQty = (id: number, q: number) => setLines(ls => q <= 0
    ? ls.filter(l => l.product.id !== id)
    : ls.map(l => l.product.id === id ? { ...l, qty: Math.min(q, 50) } : l));
  const clear = () => setLines([]);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  return <Cart.Provider value={{ lines, count, total, add, setQty, clear }}>{children}</Cart.Provider>;
}
