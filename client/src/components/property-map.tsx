import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    initPropertyMap?: () => void;
  }
}

interface PropertyMapProps {
  latitude?: string | number | null;
  longitude?: string | number | null;
  name: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  name,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng =
      typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const init = () => {
      try {
        if (!window.google || !mapRef.current) {
          throw new Error('Google Maps not available');
        }
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
        });
        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: name,
        });
        setLoaded(true);
      } catch {
        setError(true);
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY || ''}&callback=initPropertyMap`;
      script.async = true;
      script.defer = true;
      window.initPropertyMap = init;
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    } else {
      init();
    }

    return () => {
      if ((window as any).initPropertyMap) {
        delete (window as any).initPropertyMap;
      }
    };
  }, [latitude, longitude, name]);

  if (!latitude || !longitude) {
    return <p className="text-sm text-gray-500">Location not available</p>;
  }

  return (
    <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <MapPin className="w-5 h-5 mr-2" /> Map unavailable
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
