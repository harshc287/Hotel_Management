
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Login() {
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 const {login}=useAuth(); const navigate=useNavigate();
 async function submit(e){e.preventDefault();setError('');setBusy(true);try{const u=await login(email,password);navigate(u.role==='manager'?'/manager':'/');}catch(err){setError(err.response?.data?.message||'Could not sign in');}finally{setBusy(false);}}
 return <div className="auth-wrap"><form className="auth-card" onSubmit={submit}><div className="eyebrow dark">WELCOME BACK</div><h1>Good to see you.</h1><p>Sign in to continue to your table.</p>{error&&<div className="alert alert-danger">{error}</div>}<label>Email address</label><input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><label>Password</label><input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="btn btn-gold w-100 mt-4" disabled={busy}>{busy?'Signing in…':'Sign in'}</button><div className="auth-foot">New here? <Link to="/register">Create an account</Link></div></form></div>;
}
