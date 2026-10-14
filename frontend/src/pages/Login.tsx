import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api, Session } from '../api';
import { useAuth } from '../state';

export default function Login() {
  const { session, login } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to={session.role === 'ADMIN' ? '/admin' : from || '/'} replace />;

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError('Enter a valid email');
    if (f.password.length < 6) return setError('Password must be at least 6 characters');
    if (mode === 'register') {
      if (f.name.trim().length < 2) return setError('Enter your name');
      if (!/^\d{10}$/.test(f.phone)) return setError('Phone must be 10 digits');
    }
    setBusy(true);
    try {
      const body = mode === 'login' ? { email: f.email, password: f.password } : f;
      const s = await api<Session>(`/auth/${mode}`, { method: 'POST', body });
      login(s); // role comes from the server; admin goes to dashboard automatically
      nav(s.role === 'ADMIN' ? '/admin' : from || '/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel narrow">
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <form onSubmit={submit} noValidate>
        {mode === 'register' && <>
          <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Phone<input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" /></label>
        </>}
        <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p className="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
      <p className="note">
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <button className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Create an account' : 'Login'}
        </button>
      </p>
    </section>
  );
}
