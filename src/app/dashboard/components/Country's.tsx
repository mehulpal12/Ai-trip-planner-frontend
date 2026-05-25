"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Globe, ChevronDown, Check } from "lucide-react";
// Import data helpers from the package
import { Country, City } from "country-state-city";

interface LocationSearchProps {
  onLocationChange: (data: { country: string; destination: string }) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange }) => {
  // Country States
  const [countryInput, setCountryInput] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Destination States
  const [destinationInput, setDestinationInput] = useState("");
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Load all countries globally once
  const allCountries = Country.getAllCountries();

  // Filter countries based on user input
  const filteredCountries = countryInput.trim() === "" 
    ? allCountries.slice(0, 10) // Show top 10 initially
    : allCountries.filter(c => c.name.toLowerCase().includes(countryInput.toLowerCase())).slice(0, 10);

  // Filter cities dynamically based on whether a country is selected
  const filteredDestinations = useMemo(() => {
    if (selectedCountryCode) {
      // If country is picked, get cities of that specific country
      const countryCities = City.getCitiesOfCountry(selectedCountryCode) || [];
      return destinationInput.trim() === ""
        ? countryCities.slice(0, 15)
        : countryCities.filter(c => c.name.toLowerCase().includes(destinationInput.toLowerCase())).slice(0, 15);
    } else {
      // Fallback: If no country selected, show general popular global destinations
      const fallbackCities = [
        { name: "Paris", countryCode: "FR" },
        { name: "New York", countryCode: "US" },
        { name: "Tokyo", countryCode: "JP" },
        { name: "London", countryCode: "GB" },
        { name: "Dubai", countryCode: "AE" },
        { name: "Singapore", countryCode: "SG" }
      ];
      return destinationInput.trim() === ""
        ? fallbackCities
        : fallbackCities.filter(c => c.name.toLowerCase().includes(destinationInput.toLowerCase()));
    }
  }, [selectedCountryCode, destinationInput]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync structural changes upstream to parent form component
  const handleSelectCountry = (name: string, code: string) => {
    setCountryInput(name);
    setSelectedCountryCode(code);
    setShowCountryDropdown(false);
    // Clear structural destination choice when country shifts to avoid mismatch configurations
    setDestinationInput(""); 
    onLocationChange({ country: name, destination: "" });
  };

  const handleSelectDestination = (name: string) => {
    setDestinationInput(name);
    setShowDestinationDropdown(false);
    onLocationChange({ country: countryInput, destination: name });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full bg-[#080a10]/40 p-4 border border-white/[0.08] rounded-2xl">
      
      {/* 1. Country Input Field (Optional) */}
      <div ref={countryRef} className="relative flex-1 space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 block px-1">
          Country <span className="text-slate-500 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search country (e.g., France)..."
            value={countryInput}
            onFocus={() => setShowCountryDropdown(true)}
            onChange={(e) => {
              setCountryInput(e.target.value);
              if (e.target.value === "") setSelectedCountryCode(""); // reset scope if cleared
            }}
            className="w-full bg-[#0c0f17] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        </div>

        {/* Country Dropdown Menu */}
        {showCountryDropdown && filteredCountries.length > 0 && (
          <div className="absolute left-0 right-0 top-[105%] z-50 max-h-60 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0f17] p-1 shadow-2xl backdrop-blur-md">
            {filteredCountries.map((country) => (
              <button
                key={country.isoCode}
                type="button"
                onClick={() => handleSelectCountry(country.name, country.isoCode)}
                className="flex items-center justify-between w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-cyan-400 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </div>
                {selectedCountryCode === country.isoCode && <Check size={14} className="text-cyan-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Destination Input Field (Required) */}
      <div ref={destRef} className="relative flex-1 space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 block px-1">
          Destination <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            required
            placeholder={selectedCountryCode ? "Famous spots or cities..." : "Enter city name..."}
            value={destinationInput}
            onFocus={() => setShowDestinationDropdown(true)}
            onChange={(e) => setDestinationInput(e.target.value)}
            className="w-full bg-[#0c0f17] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Destination Dropdown Menu */}
        {showDestinationDropdown && filteredDestinations.length > 0 && (
          <div className="absolute left-0 right-0 top-[105%] z-50 max-h-60 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0f17] p-1 shadow-2xl backdrop-blur-md">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {selectedCountryCode ? "Suggested Local Cities" : "Popular Global Destinations"}
            </div>
            {filteredDestinations.map((city, idx) => (
              <button
                key={`${city.name}-${idx}`}
                type="button"
                onClick={() => handleSelectDestination(city.name)}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-cyan-400 rounded-lg transition-colors"
              >
                <MapPin size={14} className="text-slate-500" />
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};