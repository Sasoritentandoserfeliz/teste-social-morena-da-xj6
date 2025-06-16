import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationData } from '../types';
import { locationService } from '../services/locationService';

interface LocationContextType {
  userLocation: LocationData | null;
  requestLocation: () => Promise<boolean>;
  setManualLocation: (address: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load saved location
    const savedLocation = locationService.getSavedLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
  }, []);

  const requestLocation = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      locationService.saveLocation(location);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter localização');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setManualLocation = async (address: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await locationService.geocodeAddress(address);
      setUserLocation(location);
      locationService.saveLocation(location);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar endereço');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userLocation,
    requestLocation,
    setManualLocation,
    isLoading,
    error
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};