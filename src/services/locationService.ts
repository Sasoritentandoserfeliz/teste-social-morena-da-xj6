import { LocationData } from '../types';

class LocationService {
  private readonly STORAGE_KEY = 'benigna_user_location';

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get address from coordinates
            const address = await this.reverseGeocode(latitude, longitude);
            
            const locationData: LocationData = {
              latitude,
              longitude,
              address: address.display_name,
              city: address.city || address.town || address.village,
              state: address.state
            };
            
            resolve(locationData);
          } catch (error) {
            // Return location without address if reverse geocoding fails
            resolve({ latitude, longitude });
          }
        },
        (error) => {
          let message = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              message = 'Tempo limite para obter localização';
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async geocodeAddress(address: string): Promise<LocationData> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=br`
      );
      
      if (!response.ok) {
        throw new Error('Erro na busca do endereço');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Endereço não encontrado');
      }
      
      const result = data[0];
      
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        state: result.address?.state
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  private async reverseGeocode(latitude: number, longitude: number): Promise<any> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Erro na busca reversa');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  saveLocation(location: LocationData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(location));
  }

  getSavedLocation(): LocationData | null {
    try {
      const locationJson = localStorage.getItem(this.STORAGE_KEY);
      return locationJson ? JSON.parse(locationJson) : null;
    } catch (error) {
      console.error('Error getting saved location:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();