import React, { useState } from 'react';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import LogSheets from './components/LogSheets';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTripSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/plan-trip/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to plan trip');
      }
      
      const data = await response.json();
      setTripData(data);
    } catch (err) {
      setError('Error planning trip. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetTrip = () => {
    setTripData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ELD Compliance Trip Planner
          </h1>
          <p className="text-lg text-gray-600">
            Plan your route with automatic Hours of Service compliance
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!tripData && !loading && (
          <div className="max-w-2xl mx-auto">
            <TripForm onSubmit={handleTripSubmit} />
          </div>
        )}

        {tripData && !loading && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <button
                onClick={resetTrip}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Plan New Trip
              </button>
            </div>
            
            <RouteMap route={tripData.route} />
            <LogSheets dailyLogs={tripData.daily_logs} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
