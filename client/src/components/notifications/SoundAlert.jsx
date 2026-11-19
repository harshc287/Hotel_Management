
import { useState } from 'react';

export default function SoundAlert() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [error, setError] = useState('');

  const enableSounds = async () => {
    try {
      const audio = new Audio('/sounds/waiter-alert.mp3');

      await audio.play();

      setSoundEnabled(true);
      setError('');
    } catch (err) {
      console.error('Sound permission error:', err);
      setError('Could not play sound. Please check your browser settings.');
    }
  };

  if (soundEnabled) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      <div>
        <p>Sound alerts are currently disabled.</p>

        {error && (
          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={enableSounds}
        className="btn-secondary btn-sm shrink-0"
      >
        Enable Sounds
      </button>
    </div>
  );
}
