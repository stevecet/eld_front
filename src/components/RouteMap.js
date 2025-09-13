import { useEffect, useRef } from 'react';

const RouteMap = ({ route }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!route || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      const L = window.L;
      mapInstanceRef.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    const L = window.L;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (!layer._url) {
        map.removeLayer(layer);
      }
    });

    const waypoints = route.waypoints || [];
    const bounds = L.latLngBounds();

    waypoints.forEach((waypoint, index) => {
      const [lat, lng] = waypoint.coordinates.map(Number);
      bounds.extend([lat, lng]);
      
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>${waypoint.name}</b><br/>Stop ${index + 1}`);
    });

    if (route.geometry && route.geometry.coordinates) {
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      L.polyline(coordinates, {
        color: 'blue',
        weight: 4,
        opacity: 0.7
      }).addTo(map);
      
      coordinates.forEach(coord => bounds.extend(coord));
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

  }, [route]);

  if (!route) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Route Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Distance</div>
            <div className="text-2xl font-bold text-blue-900">{route.total_distance} miles</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Estimated Driving Time</div>
            <div className="text-2xl font-bold text-green-900">{route.total_duration} hours</div>
          </div>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="h-96 w-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default RouteMap;
