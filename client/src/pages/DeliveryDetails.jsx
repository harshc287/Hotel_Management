import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deliveryService } from '../../services/deliveryService.js';
import { locationService } from '../../services/locationService.js';

export default function DeliveryDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const watchId = useRef(null);
  const orderId = id;

  const startSharing = async () => {
    try {
      await locationService.startConsent(orderId);
      setSharing(true);
      if ('geolocation' in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          async (pos) => await locationService.updateLocation(orderId, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
          (err) => setError(err.message),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      } else { setError('Geolocation not supported'); }
    } catch (err) { setError(err.message); }
  };

  const stopSharing = async () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null; setSharing(false);
    try { await locationService.stopConsent(orderId); } catch {}
  };

  useEffect(() => () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); }, []);

  const markDelivered = async () => {
    try { await deliveryService.updateStatus(id, 'DELIVERED'); await stopSharing(); nav('/delivery'); } catch (err) { alert(err.message); }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="card">
        <div className="card-body space-y-4">
          <h1 className="text-xl font-bold">Delivery Action</h1>
          {error && <div className="text-rose-600 text-sm">{error}</div>}
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
            <p>Location sharing: <strong>{sharing ? 'ON' : 'OFF'}</strong></p>
          </div>
          {!sharing ? <button className="btn-primary w-full" onClick={startSharing}>Start Location Sharing</button> : <button className="btn-danger w-full" onClick={stopSharing}>Stop Sharing</button>}
          <hr className="border-slate-100" />
          <button className="btn-success w-full" onClick={markDelivered}>Mark as Delivered</button>
        </div>
      </div>
    </div>
  );
}