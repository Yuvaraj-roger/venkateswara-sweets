import { ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SHOP } from './config';
import { useAuth, useCart } from './state';
import Menu from './pages/Menu';
import CartPage from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Admin from './pages/Admin';

function Guard({ role, children }: { role?: 'ADMIN'; children: ReactNode }) {
  const { session } = useAuth();
  const loc = useLocation();
  if (!session) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (role && session.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Navbar() {
  const { session, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <header className="top">
      <Link to="/" className="brand">
        <strong>{SHOP.name}</strong>
        <span>{SHOP.tamil}</span>
      </Link>
      <nav>
        <NavLink to="/" end>Menu</NavLink>
        <NavLink to="/cart">Cart{count > 0 && <b className="badge">{count}</b>}</NavLink>
        {session && <NavLink to="/orders">My orders</NavLink>}
        {session?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        {session
          ? <button className="link" onClick={() => { logout(); nav('/'); }}>Logout ({session.name.split(' ')[0]})</button>
          : <NavLink to="/login">Login</NavLink>}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<Guard><Orders /></Guard>} />
          <Route path="/admin" element={<Guard role="ADMIN"><Admin /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer>
        <p>{SHOP.name}</p>
        <p>{SHOP.address}</p>
        <p>Call: <a href={`tel:${SHOP.phoneRaw}`}>{SHOP.phone}</a></p>
      </footer>
    </>
  );
}
