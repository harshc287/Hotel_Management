
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Register(){
 const [form,setForm]=useState({name:'',email:'',password:'',role:'customer',restaurantName:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false);const {register}=useAuth();const nav=useNavigate();
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{const u=await register(form);nav(u.role==='manager'?'/manager':'/');}catch(err){setError(err.response?.data?.message||'Could not create account');}finally{setBusy(false);}}
 return <div className="auth-wrap"><form className="auth-card" onSubmit={submit}><div className="eyebrow dark">COME ON IN</div><h1>Make yourself at home.</h1><p>Create your Table & Thyme account.</p>{error&&<div className="alert alert-danger">{error}</div>}<label>Full name</label><input className="form-control" name="name" value={form.name} onChange={change} required/><label>Email address</label><input className="form-control" name="email" type="email" value={form.email} onChange={change} required/><label>Password (minimum 8 characters)</label><input className="form-control" name="password" type="password" minLength="8" value={form.password} onChange={change} required/><label>Account type</label><select className="form-select" name="role" value={form.role} onChange={change}><option value="customer">Customer</option><option value="manager">Restaurant manager</option></select>{form.role==='manager'&&<><label>Restaurant name</label><input className="form-control" name="restaurantName" value={form.restaurantName} onChange={change} required/></>}<button className="btn btn-gold w-100 mt-4" disabled={busy}>{busy?'Creating account…':'Create account'}</button><div className="auth-foot">Already registered? <Link to="/login">Sign in</Link></div></form></div>;
}
