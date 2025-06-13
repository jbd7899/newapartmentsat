export interface GeoResult {
  lat: string;
  lon: string;
}

export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY || process.env.VITE_GOOGLE_API_KEY;
  if (!key) return null;

  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat: String(lat), lon: String(lng) };
    }
    return null;
  } catch {
    return null;
  }
}
