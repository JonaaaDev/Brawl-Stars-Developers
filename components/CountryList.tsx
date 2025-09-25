
import React from 'react';
import type { Country } from '../types';

interface CountryListProps {
  countries: Country[];
  isLoading: boolean;
  visitorId: string | null;
}

const CountryList: React.FC<CountryListProps> = ({ countries, isLoading, visitorId }) => {

  const BatteryIndicator: React.FC<{ level: number; isCharging?: boolean }> = ({ level, isCharging }) => {
    const getBatteryColor = () => {
      if (level > 50) return 'bg-green-500';
      if (level > 20) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="flex items-center gap-2" title={`Battery: ${level}%${isCharging ? ' (Charging)' : ''}`}>
          <div className="w-6 h-3.5 border-2 border-gray-400 rounded-sm flex items-center p-0.5 relative">
              <div className={`h-full rounded-sm ${getBatteryColor()}`} style={{ width: `${level}%` }} />
              <div className="w-1 h-2 bg-gray-400 absolute -right-1.5 top-1/2 -translate-y-1/2 rounded-r-sm" />
          </div>
          <span className="text-xs text-gray-500 font-mono">{level}%</span>
          {isCharging && (
            <span className="text-xs text-yellow-600 font-semibold">Cargando...</span>
          )}
      </div>
    );
  };

  const CountryCard: React.FC<{ country: Country }> = ({ country }) => {
    const isVisitorEntry = country.id === visitorId;
    const cardClasses = `
      bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center transition-all
      ${isVisitorEntry ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
    `;

    return (
      <li className={cardClasses}>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-lg text-gray-700 font-medium">{country.name}</span>
            {isVisitorEntry && <span className="text-xs font-semibold text-blue-600 ml-2">(This is you)</span>}
            {country.postalCode && (
                <p className="text-sm text-gray-500">{country.postalCode}</p>
            )}
          </div>
          {typeof country.battery === 'number' && <BatteryIndicator level={country.battery} isCharging={country.isCharging} />}
        </div>
        <span className="text-xs text-gray-400">{new Date(country.createdAt).toLocaleString()}</span>
    </li>
    );
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-3 text-gray-500">Loading countries...</p>
        </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No countries have been added yet.</p>
        <p className="text-gray-400 text-sm mt-1">Awaiting the first visitor!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 w-full">
      {countries.map((country) => (
        <CountryCard key={country.id} country={country} />
      ))}
    </ul>
  );
};

export default CountryList;