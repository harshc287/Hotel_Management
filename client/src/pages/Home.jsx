
import { useEffect, useState } from 'react';
import { ArrowDown, Clock3, ChefHat, Sparkles, ShoppingBag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MenuCard from '../components/MenuCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [items, setItems] = useState([]); const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('rms_cart') || '[]'));
  const [params] = useSearchParams(); const { user } = useAuth();
  const restaurantId = params.get('restaurantId');
  useEffect(() => {
    async function load() {
      try {
        let id = restaurantId;
        if (!id) {
          const { data } = await api.get('/restaurants/public/demo-restaurant');
          setRestaurant(data.restaurant); id = data.restaurant._id;
        }
        const { data } = await api.get('/menu', { params: { restaurantId: id } });
        setItems(data.items); setRestaurant(prev => prev || { _id: id, name: 'Restaurant Menu' });
      } catch (e) { setError(e.response?.data?.message || 'Could not load the menu. Seed the demo database or use a restaurantId query parameter.'); }
      finally { setLoading(false); }
    }
    load();
  }, [restaurantId]);
  const add = item => {
    const next = [...cart]; const found = next.find(x => x._id === item._id);
    if (found) found.quantity += 1; else next.push({ ...item, quantity: 1 });
    setCart(next); localStorage.setItem('rms_cart', JSON.stringify(next));
  };
  return <main>
    <section className="hero"><div className="container hero-inner"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15}/> GOOD FOOD. GOOD MOMENTS.</div><h1>A little taste of<br/><span>something special.</span></h1><p>Thoughtfully prepared favourites, made fresh and served with a little extra love.</p><div className="hero-actions"><a className="btn btn-gold btn-lg" href="#menu">Explore the menu <ArrowDown size={17}/></a><span className="hero-note"><Clock3 size={16}/> Freshly made to order</span></div></div><div className="hero-visual"><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="hero-dish">🍲</div><div className="floating-card"><span>✦</span><div><strong>Made with care</strong><small>Every single plate</small></div></div><div className="hero-stamp">FRESH<br/>DAILY</div></div></div><div className="hero-bottom"><span>SEASONAL INGREDIENTS</span><span>·</span><span>MADE FRESH</span><span>·</span><span>ALWAYS DELICIOUS</span></div></section>
    <section className="container menu-section" id="menu"><div className="section-heading"><div><div className="eyebrow dark"><ChefHat size={15}/> FROM OUR KITCHEN</div><h2>{restaurant?.name || 'Our menu'}<span>.</span></h2><p>A few favourites we think you’ll love.</p></div><div className="cart-pill"><ShoppingBag size={17}/><span>{cart.reduce((n,x) => n+x.quantity,0)} items in your bag</span></div></div>
    {loading ? <div className="screen-center">Preparing the menu…</div> : error ? <div className="alert alert-warning">{error}</div> : items.length ? <div className="row g-4">{items.map(item => <div className="col-sm-6 col-lg-4" key={item._id}><MenuCard item={item} onAdd={add}/></div>)}</div> : <div className="empty-state">The menu is being prepared. Please check back soon.</div>}
    <div className="order-bar"><div><strong>Ready when you are.</strong><span>Review your selection and place an order.</span></div><Link className="btn btn-gold" to="/cart">View cart ({cart.reduce((n,x) => n+x.quantity,0)})</Link></div>
    {user?.role === 'manager' && <div className="manager-shortcut mt-4"><strong>Manager workspace</strong><p>Manage your restaurant orders and menu.</p><Link to="/manager" className="btn btn-dark">Open dashboard</Link></div>}
    </section>
  </main>;
}
