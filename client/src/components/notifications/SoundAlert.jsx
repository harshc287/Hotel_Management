import { useState } from 'react';

export default function SoundAlert() {
  const [enabled, setEnabled] = useState(false);
  if (enabled) return null;
  return (
    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 flex justify-between items-center mb-4">
      <span>Sound alerts are disabled by the browser.</span>
      <button 
        onClick={() => { 
          new Audio('/sounds/waiter-alert.mp3').play()
            .then(() => setEnabled(true))
            .catch(console.error); 
        }} 
        className="btn-secondary btn-sm"
      >
        Enable Sounds
      </button>
    </div>
  );
}