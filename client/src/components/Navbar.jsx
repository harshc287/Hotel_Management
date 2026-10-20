
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  return <nav className="navbar navbar-expand-lg navbar-dark app-navbar"><div className="container">
    <Link className="navbar-brand d-flex align-items-center gap-2" to="/"><span className="brand-icon"><UtensilsCrossed size={19}/></span><span>Table <em>& Thyme</em></span></Link>
    <div className="d-flex align-items-center gap-3">
      <NavLink className="nav-link d-none d-sm-block" to="/">Explore menu</NavLink>
      {user ? <><span className="user-chip"><UserRound size={15}/> {user.name}</span><button className="btn btn-outline-light btn-sm" onClick={() => { logout(); navigate('/'); }}><LogOut size={15} className="me-1"/>Logout</button></> : <><Link className="btn btn-outline-light btn-sm" to="/login">Login</Link><Link className="btn btn-gold btn-sm" to="/register">Get started</Link></>}
    </div>
  </div></nav>;
}
