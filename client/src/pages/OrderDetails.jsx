
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
const steps=['PENDING_PAYMENT','PAID','CONFIRMED','PREPARING','READY','SERVED','COMPLETED'];
export default function OrderDetails(){const {id}=useParams();const [order,setOrder]=useState(null);const [error,setError]=useState('');
useEffect(()=>{api.get(`/orders/${id}`).then(r=>setOrder(r.data.order)).catch(e=>setError(e.response?.data?.message||'Could not load order'));},[id]);
if(error)return <div className="container page-container"><div className="alert alert-warning">{error}</div><Link to="/">Back to menu</Link></div>;
if(!order)return <div className="screen-center">Loading order…</div>;
return <div className="container page-container"><div className="eyebrow dark">ORDER CONFIRMATION</div><h1 className="page-title">Thanks for choosing us<span>.</span></h1><div className="checkout-card order-detail"><p className="muted">Order number</p><h2>{order.orderNumber}</h2><span className="status-chip">{order.status.replaceAll('_',' ')}</span><div className="bill-line mt-4"><span>Payment status</span><strong>{order.paymentStatus}</strong></div>{order.items.map(i=><div className="bill-line" key={i.menuItemId}><span>{i.quantity} × {i.name}</span><span>₹{i.lineTotal.toFixed(2)}</span></div>)}<div className="bill-total"><span>Total</span><strong>₹{order.total.toFixed(2)}</strong></div><div className="alert alert-info mt-3">This starter creates the order record but does not complete payment. Configure Razorpay Test Mode and finish webhook verification before accepting real payments.</div><Link className="btn btn-gold mt-2" to="/">Back to menu</Link></div></div>}
