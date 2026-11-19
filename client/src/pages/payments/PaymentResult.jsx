import { useNavigate } from 'react-router-dom';
export default function PaymentResult() {
  const nav = useNavigate();
  return <div className="card mx-auto max-w-md text-center mt-10"><div className="card-body"><h2 className="text-xl font-bold text-emerald-600">Payment Successful</h2><button className="btn-primary mt-4" onClick={() => nav('/orders')}>View Orders</button></div></div>;
}