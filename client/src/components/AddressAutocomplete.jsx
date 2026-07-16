import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const AddressAutocomplete = ({ value, onChange, onSelect, label, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { setInputValue(value || ''); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    setIsLoading(true);
    try {
      const res = await api.get('/address/search', { params: { q: query } });
      const data = res.data.data || [];
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]); setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange && onChange(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (newValue.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(() => { fetchSuggestions(newValue); }, 600);
  };

  const handleSelectSuggestion = (suggestion) => {
    const road = suggestion.address?.road || '';
    const houseNumber = suggestion.address?.house_number || '';
    const street = [road, houseNumber].filter(Boolean).join(' ');
    const formattedAddress = suggestion.display_name;
    const addressData = {
      formattedAddress, street,
      city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '',
      state: suggestion.address?.state || '',
      zip: suggestion.address?.postcode || '',
      country: suggestion.address?.country || '',
      coordinates: { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) },
    };
    setInputValue(formattedAddress);
    onChange && onChange(formattedAddress);
    onSelect && onSelect(addressData);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder || 'Busca tu dirección...'}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="flex items-start gap-2 px-4 py-3 hover:bg-muted cursor-pointer text-sm text-muted-foreground"
            >
              <span className="mt-0.5">📍</span>
              <span className="leading-tight">{suggestion.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;