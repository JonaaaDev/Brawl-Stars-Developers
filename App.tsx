import React, { useState, useEffect } from 'react';
import { saveCountry, onCountriesChange } from './services/firebaseService';
import type { Country } from './types';
import CountryList from './components/CountryList';

const App: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [detectionStatus, setDetectionStatus] = useState<string>('idle'); // idle, detecting, saved, failed
  const [error, setError] = useState<string | null>(null);

  // Effect for listening to country list changes from Firebase
  useEffect(() => {
    const unsubscribe = onCountriesChange((newCountries) => {
      setCountries(newCountries);
      setIsLoading(false);
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Effect for detecting and saving the country automatically
  useEffect(() => {
    const detectAndSaveCountry = async () => {
      // Check if country was already saved in this session to prevent duplicates
      if (localStorage.getItem('countrySaved') === 'true') {
        setDetectionStatus('saved');
        return;
      }

      setDetectionStatus('detecting');
      setError(null);

      try {
        // Use a reliable, public IP geolocation API to find the user's country
        const response = await fetch('https://get.geojs.io/v1/ip/country.json');
        if (!response.ok) {
          throw new Error('Failed to fetch location data.');
        }
        const data = await response.json();
        
        if (data && data.name) {
          await saveCountry(data.name);
          localStorage.setItem('countrySaved', 'true');
          setDetectionStatus('saved');
        } else {
          throw new Error('Could not determine country from location data.');
        }
      } catch (err: any) {
        console.error("Detection or save failed:", err);
        setError(err.message || 'An error occurred during detection.');
        setDetectionStatus('failed');
      }
    };

    detectAndSaveCountry();
  }, []); // Empty dependency array ensures this runs only once on component mount

  const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.704 4.343a9 9 0 0110.592 0M9.5 20.25a9.005 9.005 0 005 0M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
    </svg>
  );

  const renderDetectionStatus = () => {
    switch (detectionStatus) {
      case 'detecting':
        return <p className="text-blue-600 h-6 text-sm mt-4 animate-pulse">Detecting your country...</p>;
      case 'saved':
        return <p className="text-green-600 h-6 text-sm mt-4">Your country has been logged. Thank you for visiting!</p>;
      case 'failed':
        return <p className="text-red-500 h-6 text-sm mt-4">{error}</p>;
      case 'idle':
      default:
        return <div className="h-6 mt-4"></div>; // Placeholder to prevent layout shift
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
            <GlobeIcon />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Real-time Visitor Log
          </h1>
          <p className="mt-2 text-gray-600">
            This app automatically detects and saves the country of each new visitor.
          </p>
        </div>
        
        <div className="text-center">
          {renderDetectionStatus()}
        </div>

        <div className="mt-6">
            <div className="border-t border-gray-200 mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Countries Visited</h2>
            <CountryList countries={countries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;