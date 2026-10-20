import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-8 text-white shadow">
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome to RMS</h1>
        <p className="mt-2 text-brand-50 max-w-2xl">Dine-in via QR, delivery, live tracking and payments.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/menu" className="btn bg-white text-slate-900 hover:bg-slate-100">Browse menu</Link>
          <Link to="/login" className="btn bg-white/10 text-white hover:bg-white/20">Staff sign in</Link>
        </div>
      </div>
    </div>
  );
}