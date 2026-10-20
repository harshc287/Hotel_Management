
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
export default function QRMenu(){const {token}=useParams();const [info,setInfo]=useState(null);const [error,setError]=useState('');
useEffect(()=>{api.get(`/tables/qr/${token}`).then(r=>setInfo(r.data)).catch(e=>setError(e.response?.data?.message||'This QR code is invalid or disabled'));},[token]);
return <div className="container page-container">{error?<div className="empty-state"><h2>QR code unavailable</h2><p>{error}</p></div>:!info?<div className="screen-center">Validating table QR…</div>:<div className="checkout-card"><div className="eyebrow dark">WELCOME TO</div><h1>{info.restaurant.name}</h1><p>Table {info.table.tableNumber}</p><p>Table verified. To place a dine-in order, add items from the menu and submit this table token with the order. The standard cart UI currently supports delivery checkout; the dine-in token checkout is an integration step.</p><button className="btn btn-gold" onClick={()=>{sessionStorage.setItem('rms_table_token',token);sessionStorage.setItem('rms_restaurant_id',info.restaurant._id);window.location.href=`/?restaurantId=${info.restaurant._id}`;}}>Browse menu</button></div>}</div>}
