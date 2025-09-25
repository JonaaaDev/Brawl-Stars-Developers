
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

      const fetchGeolocation = async () => {
        // Attempt 1: Primary provider (ipapi.co)
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (!response.ok) throw new Error(`ipapi.co responded with status: ${response.status}`);
          const data = await response.json();
          if (data.error) throw new Error(`ipapi.co error: ${data.reason}`);
          if (data.country_name) {
            return { countryName: data.country_name, postalCode: data.postal };
          }
        } catch (err) {
          console.warn('Provider 1 (ipapi.co) failed:', err);
        }

        // Attempt 2: Fallback provider (freegeoip.app)
        try {
          const response = await fetch('https://freegeoip.app/json/');
          if (!response.ok) throw new Error(`freegeoip.app responded with status: ${response.status}`);
          const data = await response.json();
          if (data.country_name) {
            return { countryName: data.country_name, postalCode: data.zip_code };
          }
        } catch (err) {
          console.warn('Provider 2 (freegeoip.app) failed:', err);
        }
        
        // Attempt 3: Final fallback provider (ipwho.is)
        try {
          const response = await fetch('https://ipwho.is/');
          if (!response.ok) throw new Error(`ipwho.is responded with status: ${response.status}`);
          const data = await response.json();
          if (data.success && data.country) {
              return { countryName: data.country, postalCode: data.postal };
          }
          if (!data.success) throw new Error(`ipwho.is error: ${data.message}`);
        } catch (err) {
          console.warn('Provider 3 (ipwho.is) failed:', err);
        }

        // If all failed
        throw new Error('Could not fetch location data. Please check your network connection and disable any ad-blockers.');
      };

      try {
        const { countryName, postalCode } = await fetchGeolocation();

        // Get battery level and charging status
        let batteryLevel: number | undefined = undefined;
        let isCharging: boolean | undefined = undefined;
        if ('getBattery' in navigator) {
          try {
            const battery = await (navigator as any).getBattery();
            batteryLevel = Math.round(battery.level * 100);
            isCharging = battery.charging;
          } catch (batteryError) {
            console.warn("Could not retrieve battery status:", batteryError);
          }
        } else {
          console.warn("Battery Status API is not supported in this browser.");
        }
        
        await saveCountry(countryName.trim(), batteryLevel, isCharging, postalCode);
        setDetectionStatus('saved');
        
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
