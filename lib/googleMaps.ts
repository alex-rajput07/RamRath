import fetch from 'node-fetch';

export async function getDirections(from:string, to:string) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY not set');
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.routes || json.routes.length === 0) {
    return { error: 'no_route', raw: json };
  }
  const route = json.routes[0];
  const leg = route.legs && route.legs[0];
  const distance_m = leg.distance.value;
  const duration_text = leg.duration.text;
  return { distance_km: distance_m/1000, duration_text, route_polyline: route.overview_polyline?.points };
}
