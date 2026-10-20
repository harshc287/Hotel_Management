
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Cart from './pages/Cart';
// import OrderDetails from './pages/OrderDetails';
// import ManagerDashboard from './pages/ManagerDashboard';
// import QRMenu from './pages/QRMenu';
// import NotFound from './pages/NotFound';
// export default function App(){return <BrowserRouter><AuthProvider><SocketProvider><Navbar/><Routes>
// <Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/cart" element={<Cart/>}/><Route path="/qr/:token" element={<QRMenu/>}/><Route path="/orders/:id" element={<ProtectedRoute/>}><Route index element={<OrderDetails/>}/></Route><Route element={<ProtectedRoute roles={['manager','admin']}/> }><Route path="/manager" element={<ManagerDashboard/>}/></Route><Route path="*" element={<NotFound/>}/>
// </Routes><footer className="app-footer"><div className="container"><span>Table & Thyme</span><span>Good food brings us together.</span></div></footer></SocketProvider></AuthProvider></BrowserRouter>}
import { Link, Route, Routes } from 'react-router-dom';
import HealthCheck from './pages/public/HealthCheck.jsx';

function Home() {
  return (
    <div className="container">
      <h1>Restaurant Management System</h1>
      <p>Phase 1: repo, server, client, database, environment wiring.</p>
      <ul>
        <li><Link to="/health">Health check (server + DB)</Link></li>
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <nav className="topnav">
        <Link to="/">Home</Link>
        <Link to="/health">Health</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<HealthCheck />} />
          <Route path="*" element={<p className="container">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}