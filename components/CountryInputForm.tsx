
import React, { useState } from 'react';

interface CountryInputFormProps {
  onAddCountry: (countryName: string) => Promise<void>;
  isSaving: boolean;
}

const CountryInputForm: React.FC<CountryInputFormProps> = ({ onAddCountry, isSaving }) => {
  const [countryName, setCountryName] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!countryName.trim() || isSaving) return;
    try {
      await onAddCountry(countryName);
      setCountryName(''); // Clear input on successful submission
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={countryName}
          onChange={(e) => setCountryName(e.target.value)}
          placeholder="Enter a country name..."
          className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={isSaving}
        />
        <button
          type="submit"
          disabled={isSaving || !countryName.trim()}
          className="absolute inset-y-0 right-0 flex items-center px-6 text-white font-bold bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default CountryInputForm;
