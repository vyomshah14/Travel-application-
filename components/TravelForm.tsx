import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, CalendarDays, ChevronDown, Loader2 } from 'lucide-react';
import { FormState } from '../types';

interface TravelFormProps {
  onSubmit: (data: FormState) => void;
  isLoading: boolean;
}

// Curated list of popular destinations for autocomplete
const POPULAR_LOCATIONS = [
  { city: "Paris", country: "France" },
  { city: "Nice", country: "France" },
  { city: "Lyon", country: "France" },
  { city: "Marseille", country: "France" },
  { city: "London", country: "United Kingdom" },
  { city: "Edinburgh", country: "United Kingdom" },
  { city: "Manchester", country: "United Kingdom" },
  { city: "New York", country: "USA" },
  { city: "Los Angeles", country: "USA" },
  { city: "San Francisco", country: "USA" },
  { city: "Chicago", country: "USA" },
  { city: "Miami", country: "USA" },
  { city: "Las Vegas", country: "USA" },
  { city: "Tokyo", country: "Japan" },
  { city: "Kyoto", country: "Japan" },
  { city: "Osaka", country: "Japan" },
  { city: "Rome", country: "Italy" },
  { city: "Florence", country: "Italy" },
  { city: "Venice", country: "Italy" },
  { city: "Milan", country: "Italy" },
  { city: "Barcelona", country: "Spain" },
  { city: "Madrid", country: "Spain" },
  { city: "Seville", country: "Spain" },
  { city: "Dubai", country: "UAE" },
  { city: "Abu Dhabi", country: "UAE" },
  { city: "Singapore", country: "Singapore" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Rotterdam", country: "Netherlands" },
  { city: "Bangkok", country: "Thailand" },
  { city: "Phuket", country: "Thailand" },
  { city: "Chiang Mai", country: "Thailand" },
  { city: "Sydney", country: "Australia" },
  { city: "Melbourne", country: "Australia" },
  { city: "Istanbul", country: "Turkey" },
  { city: "Antalya", country: "Turkey" },
  { city: "Prague", country: "Czech Republic" },
  { city: "Vienna", country: "Austria" },
  { city: "Lisbon", country: "Portugal" },
  { city: "Porto", country: "Portugal" },
  { city: "Berlin", country: "Germany" },
  { city: "Munich", country: "Germany" },
  { city: "Hamburg", country: "Germany" },
  { city: "Santorini", country: "Greece" },
  { city: "Athens", country: "Greece" },
  { city: "Mykonos", country: "Greece" },
  { city: "Bali", country: "Indonesia" },
  { city: "Jakarta", country: "Indonesia" },
  { city: "Hong Kong", country: "China" },
  { city: "Seoul", country: "South Korea" },
  { city: "Busan", country: "South Korea" },
  { city: "Rio de Janeiro", country: "Brazil" },
  { city: "Sao Paulo", country: "Brazil" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Johannesburg", country: "South Africa" },
  { city: "Cairo", country: "Egypt" },
  { city: "Marrakech", country: "Morocco" },
  { city: "Toronto", country: "Canada" },
  { city: "Vancouver", country: "Canada" },
  { city: "Montreal", country: "Canada" },
  { city: "Mumbai", country: "India" },
  { city: "Delhi", country: "India" },
  { city: "Jaipur", country: "India" },
  { city: "Cancun", country: "Mexico" },
  { city: "Mexico City", country: "Mexico" },
];

export const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormState>({ city: '', country: '', duration: '' });
  const [activeField, setActiveField] = useState<string | null>(null);
  
  // Autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<{ city: string; country: string }[]>([]);
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Refs for clicking outside
  const cityWrapperRef = useRef<HTMLDivElement>(null);
  const countryWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler to close dropdowns
    function handleClickOutside(event: MouseEvent) {
      if (cityWrapperRef.current && !cityWrapperRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (countryWrapperRef.current && !countryWrapperRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, city: value }));
    
    if (value.trim().length > 0) {
      // Filter logic:
      // 1. Matches city name
      // 2. If country is already typed, match that too
      const filtered = POPULAR_LOCATIONS.filter(loc => {
        const matchCity = loc.city.toLowerCase().startsWith(value.toLowerCase());
        const matchCountry = formData.country 
          ? loc.country.toLowerCase() === formData.country.toLowerCase() || loc.country.toLowerCase().includes(formData.country.toLowerCase())
          : true;
        return matchCity && matchCountry;
      });
      setCitySuggestions(filtered);
      setShowCityDropdown(true);
    } else {
      setCitySuggestions([]);
      setShowCityDropdown(false);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, country: value }));

    if (value.trim().length > 0) {
      // Get unique countries matching input
      const uniqueCountries = Array.from(new Set(
        POPULAR_LOCATIONS
          .map(loc => loc.country)
          .filter(c => c.toLowerCase().startsWith(value.toLowerCase()))
      ));
      setCountrySuggestions(uniqueCountries);
      setShowCountryDropdown(true);
    } else {
      setCountrySuggestions([]);
      setShowCountryDropdown(false);
    }
  };

  const selectCity = (city: string, country: string) => {
    setFormData(prev => ({ ...prev, city, country })); // Auto-fetch country
    setShowCityDropdown(false);
    setShowCountryDropdown(false);
  };

  const selectCountry = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setShowCountryDropdown(false);
  };
  
  const handleCityFocus = () => {
    setActiveField('city');
    // If we have a country selected, show cities for that country even if input is empty?
    if (formData.country && !formData.city) {
      const filtered = POPULAR_LOCATIONS.filter(loc => 
        loc.country.toLowerCase() === formData.country.toLowerCase()
      );
      setCitySuggestions(filtered);
      setShowCityDropdown(true);
    } else if (formData.city) {
       setShowCityDropdown(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Close dropdowns immediately to prevent visual overlap
    setShowCityDropdown(false);
    setShowCountryDropdown(false);
    setActiveField(null);

    if (formData.city.trim() && formData.country.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40 relative z-20">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tighter">TravelGenie</h2>
        <p className="text-gray-600 text-lg font-light">Discover your next adventure with AI-curated guides.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* City Input */}
        {/* Z-index logic: The active field must be z-50 to stack above subsequent fields */}
        <div 
          ref={cityWrapperRef} 
          className={`relative group transition-all duration-300 ${activeField === 'city' || showCityDropdown ? 'z-50 transform -translate-y-1' : 'z-30'}`}
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <MapPin className={`h-5 w-5 transition-colors duration-300 ${activeField === 'city' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-4 py-5 border border-gray-200 rounded-2xl leading-5 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            placeholder="City (e.g., Paris)"
            value={formData.city}
            onChange={handleCityChange}
            onFocus={handleCityFocus}
            onBlur={() => setActiveField(null)}
            required
            disabled={isLoading}
            autoComplete="off"
          />
          {showCityDropdown && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              <ul>
                {citySuggestions.map((item, idx) => (
                  <li 
                    key={`${item.city}-${idx}`}
                    onMouseDown={() => selectCity(item.city, item.country)}
                    className="px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex flex-col border-b border-gray-50 last:border-0"
                  >
                    <span className="font-bold text-gray-800">{item.city}</span>
                    <span className="text-xs text-gray-500">{item.country}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Country Input */}
        <div 
          ref={countryWrapperRef} 
          className={`relative group transition-all duration-300 ${activeField === 'country' || showCountryDropdown ? 'z-50 transform -translate-y-1' : 'z-20'}`}
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <MapPin className={`h-5 w-5 transition-colors duration-300 ${activeField === 'country' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-4 py-5 border border-gray-200 rounded-2xl leading-5 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            placeholder="Country (e.g., France)"
            value={formData.country}
            onChange={handleCountryChange}
            onFocus={() => {
              setActiveField('country');
              if (formData.country) setShowCountryDropdown(true);
            }}
            onBlur={() => setActiveField(null)}
            required
            disabled={isLoading}
            autoComplete="off"
          />
          {showCountryDropdown && countrySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              <ul>
                {countrySuggestions.map((country, idx) => (
                  <li 
                    key={idx}
                    onMouseDown={() => selectCountry(country)}
                    className="px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 font-medium text-gray-800"
                  >
                    {country}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Duration Input */}
        <div className={`relative group transition-all duration-300 ${activeField === 'duration' ? 'z-50 transform -translate-y-1' : 'z-10'}`}>
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <CalendarDays className={`h-5 w-5 transition-colors duration-300 ${activeField === 'duration' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <input
            type="number"
            min="1"
            max="14"
            className="block w-full pl-14 pr-4 py-5 border border-gray-200 rounded-2xl leading-5 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            placeholder="Duration (Days)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            onFocus={() => setActiveField('duration')}
            onBlur={() => setActiveField(null)}
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center py-5 px-6 border border-transparent rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 transform relative z-10 ${
            isLoading 
              ? 'bg-gray-800 cursor-not-allowed opacity-90' 
              : 'bg-gray-900 hover:bg-black hover:-translate-y-1 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-900/20'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white animate-pulse">
                Curating Experience...
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Start Journey
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
