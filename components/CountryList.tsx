
import React from 'react';
import type { Country } from '../types';

interface CountryListProps {
  countries: Country[];
  isLoading: boolean;
}

const CountryList: React.FC<CountryListProps> = ({ countries, isLoading }) => {

  const CountryCard: React.FC<{ country: Country }> = ({ country }) => (
    <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center transition-transform transform hover:scale-105">
        <span className="text-lg text-gray-700 font-medium">{country.name}</span>
        <span className="text-xs text-gray-400">{new Date(country.createdAt).toLocaleString()}</span>
    </li>
  );

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
        <p className="text-gray-400 text-sm mt-1">Be the first to add one!</p>
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
