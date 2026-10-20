// Route & ETA service. Uses Google Distance Matrix if MAPS_API_KEY is set;
// otherwise returns a clearly-labelled straight-line fallback.

const GOOGLE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

export async function calculateRoute({ origin, destination, mode = 'driving' }) {
  if (!origin || !destination) {
    throw Object.assign(new Error('origin and destination required'), { status: 400 });
  }
  assertLatLng(origin);
  assertLatLng(destination);

  const apiKey = process.env.MAPS_API_KEY;
  if (apiKey) {
    const url = new URL(GOOGLE_URL);
    url.searchParams.set('origins', `${origin.lat},${origin.lng}`);
    url.searchParams.set('destinations', `${destination.lat},${destination.lng}`);
    url.searchParams.set('mode', mode);
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      return straightLineFallback(origin, destination, `provider ${res.status}`);
    }
    const data = await res.json();
    const element = data?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      return straightLineFallback(origin, destination, element?.status || 'no_route');
    }
    return {
      fallback: false,
      distanceMeters: element.distance.value,
      durationSeconds: element.duration.value,
      etaIso: new Date(Date.now() + element.duration.value * 1000).toISOString(),
    };
  }

  return straightLineFallback(origin, destination, 'no_api_key');
}

function straightLineFallback(origin, destination, reason) {
  const d = haversineMeters(origin, destination);
  // 30 km/h average for urban fallback; label it clearly.
  const seconds = Math.round((d / 1000 / 30) * 3600);
  return {
    fallback: true,
    fallbackReason: reason,
    distanceMeters: Math.round(d),
    durationSeconds: seconds,
    etaIso: new Date(Date.now() + seconds * 1000).toISOString(),
    note: 'Straight-line estimate — not traffic-aware. Configure MAPS_API_KEY for real routes.',
  };
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function assertLatLng(p) {
  if (
    typeof p.lat !== 'number' ||
    typeof p.lng !== 'number' ||
    p.lat < -90 ||
    p.lat > 90 ||
    p.lng < -180 ||
    p.lng > 180
  ) {
    throw Object.assign(new Error('Invalid lat/lng'), { status: 400 });
  }
}