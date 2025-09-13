import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different statuses
const createStatusIcon = (status) => {
  const statusColors = {
    off_duty: 'gray',
    sleeper_berth: 'purple',
    driving: 'blue',
    on_duty_not_driving: 'orange'
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${statusColors[status]}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const TripDashboard = ({ tripData }) => {
  const [activeDay, setActiveDay] = useState(0);
  
  // Extract data from props
  const { trip, route, log_entries, daily_logs } = tripData;
  
  // Prepare route coordinates for the map
  const routeCoordinates = route.waypoints.map(wp => [wp.coordinates[0], wp.coordinates[1]]);
  
  // Find stops with non-driving activities
  const stops = log_entries
    .filter(entry => entry.duty_status !== 'driving')
    .map(entry => {
      const waypoint = route.waypoints.find(wp => 
        wp.name.toLowerCase().includes(entry.location.toLowerCase().split(',')[0])
      );
      return {
        ...entry,
        coordinates: waypoint ? waypoint.coordinates : null
      };
    })
    .filter(stop => stop.coordinates !== null);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Trip Logs Dashboard</h1>
      
      {/* Trip Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Trip Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-medium">{trip.pickup_location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="font-medium">{trip.dropoff_location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Location</p>
            <p className="font-medium">{trip.current_location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Cycle Hours</p>
            <p className="font-medium">{trip.current_cycle_hours}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Distance</p>
            <p className="font-medium">{route.total_distance} miles</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Duration</p>
            <p className="font-medium">{route.total_duration} hours</p>
          </div>
        </div>
      </div>
      
      {/* Map Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Route Map</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer 
            center={routeCoordinates[0]} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Route line */}
            <Polyline positions={routeCoordinates} color="blue" weight={4} />
            
            {/* Waypoint markers */}
            {route.waypoints.map((waypoint, index) => (
              <Marker 
                key={index} 
                position={[waypoint.coordinates[0], waypoint.coordinates[1]]}
                icon={L.icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>
                  <div>
                    <strong>{waypoint.name}</strong>
                    {index === 0 && <p>Start Location</p>}
                    {index === route.waypoints.length - 1 && <p>Destination</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Stop markers with status information */}
            {stops.map((stop, index) => (
              <Marker 
                key={`stop-${index}`} 
                position={[stop.coordinates[0], stop.coordinates[1]]}
                icon={createStatusIcon(stop.duty_status)}
              >
                <Popup>
                  <div>
                    <p className="font-semibold">{stop.location}</p>
                    <p className="capitalize">{stop.duty_status.replace(/_/g, ' ')}</p>
                    <p className="text-sm">{stop.remarks}</p>
                    <p className="text-xs text-gray-500">
                      {stop.start_time} - {stop.end_time}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Driving Route</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm">Off Duty</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm">Sleeper Berth</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm">On Duty (Not Driving)</span>
          </div>
        </div>
      </div>
      
      {/* Daily Log Sheets */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Log Sheets</h2>
        
        {/* Day Selector */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {daily_logs.map((dayLog, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeDay === index
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {new Date(dayLog.date_start).toLocaleDateString()}
            </button>
          ))}
        </div>
        
        {/* Display active day's log sheet */}
        <DailyLogSheet dayLog={daily_logs[activeDay]} />
      </div>
    </div>
  );
};



const DailyLogSheet = ({ dayLog }) => {
  const statusColors = {
    off_duty: "bg-gray-200 text-gray-800",
    sleeper_berth: "bg-purple-200 text-purple-800",
    driving: "bg-blue-200 text-blue-800",
    on_duty_not_driving: "bg-orange-200 text-orange-800",
  };

  const statusLabels = {
    off_duty: "Off Duty",
    sleeper_berth: "Sleeper Berth",
    driving: "Driving",
    on_duty_not_driving: "On Duty (Not Driving)",
  };

  const generateTimeGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const entries = dayLog.entries || [];

    return hours.map((hour) => {
      const hourString = hour.toString().padStart(2, "0") + ":00";
      const entry = entries.find((e) => {
        const startHour = parseInt(e.start_time.split(":")[0]);
        const endHour = parseInt(e.end_time.split(":")[0]);
        return hour >= startHour && hour < endHour;
      });

      return {
        hour: hourString,
        status: entry?.duty_status || "off_duty",
        location: entry?.location || "",
        remarks: entry?.remarks || "",
      };
    });
  };

  const timeGrid = generateTimeGrid();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Daily Log Sheet - {new Date(dayLog.date_start).toLocaleDateString()}
          </h3>
          <div className="text-sm text-gray-500">DOT Compliant ELD Record</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dayLog.totals).map(([status, hours]) => (
            <div
              key={status}
              className={`p-3 rounded-lg ${statusColors[status]}`}
            >
              <div className="text-xs font-medium">{statusLabels[status]}</div>
              <div className="text-lg font-bold">{hours.toFixed(1)}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid Visualization */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">24-Hour Grid</h4>
        <div className="grid grid-cols-12 gap-1">
          {timeGrid.map((slot, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {index % 2 === 0 ? slot.hour : ""}
              </div>
              <div
                className={`h-8 rounded ${
                  statusColors[slot.status]
                } border border-gray-300 flex items-center justify-center`}
                title={`${slot.hour}: ${statusLabels[slot.status]} - ${
                  slot.location
                }`}
              >
                <div className="text-xs font-medium">
                  {statusLabels[slot.status].split(" ")[0].charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(statusLabels).map(([key, label]) => (
            <div key={key} className="flex items-center">
              <div
                className={`w-4 h-4 rounded ${statusColors[key]} mr-2`}
              ></div>
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      

      {/* Detailed Log Entries */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Detailed Log Entries</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Time Period</th>
                <th className="px-3 py-2 text-left">Duty Status</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {(dayLog.entries || []).map((entry, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-mono">
                    {entry.start_time} - {entry.end_time}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusColors[entry.duty_status]
                      }`}
                    >
                      {statusLabels[entry.duty_status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{entry.location}</td>
                  <td className="px-3 py-2 font-mono">{entry.duration}h</td>
                  <td className="px-3 py-2 text-gray-600">{entry.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripDashboard;