
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

  // Effect for detecting and saving the country and battery automatically on every visit
  useEffect(() => {
    const detectAndSaveData = async () => {
      setDetectionStatus('detecting');
      setError(null);

      try {
        // Fetch location data
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) {
          throw new Error('Failed to fetch location data.');
        }
        
        const locationData = await response.json();
        if (!locationData.success) {
            throw new Error(`API returned an error: ${locationData.message || 'Unknown API error'}`);
        }
        const countryName = locationData.country;

        // Get battery level
        let batteryLevel: number | undefined = undefined;
        if ('getBattery' in navigator) {
          try {
            // The getBattery function is not standard and may require a type assertion
            const battery = await (navigator as any).getBattery();
            batteryLevel = Math.round(battery.level * 100);
          } catch (batteryError) {
            console.warn("Could not retrieve battery status:", batteryError);
          }
        } else {
          console.warn("Battery Status API is not supported in this browser.");
        }
        
        if (countryName && countryName.trim()) {
          await saveCountry(countryName.trim(), batteryLevel);
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

    detectAndSaveData();
  }, []);

  // Effect to clear the success/error message after a delay
  useEffect(() => {
    if (detectionStatus === 'saved' || detectionStatus === 'failed') {
      const timer = setTimeout(() => {
        setDetectionStatus('idle');
      }, 4000); // Clear message after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [detectionStatus]);


  const renderDetectionStatus = () => {
    switch (detectionStatus) {
      case 'detecting':
        return <p className="text-blue-600 h-6 text-sm mt-4 animate-pulse">Logging your visit...</p>;
      case 'saved':
        return <p className="text-green-600 h-6 text-sm mt-4">Your visit has been logged. Welcome!</p>;
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