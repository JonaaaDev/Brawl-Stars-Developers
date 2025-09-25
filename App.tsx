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

  const renderDetectionStatus = () => {
    switch (detectionStatus) {
      case 'detecting':
        return <p className="text-blue-600 h-6 text-sm mt-4 animate-pulse">Detecting your country...</p>;
      case 'failed':
        return <p className="text-red-500 h-6 text-sm mt-4">{error}</p>;
      case 'saved':
      case 'idle':
      default:
        return <div className="h-6 mt-4"></div>; // Placeholder to prevent layout shift
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
        
        <div className="text-center">
          {renderDetectionStatus()}
        </div>

        <div className="mt-6">
            <CountryList countries={countries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;
