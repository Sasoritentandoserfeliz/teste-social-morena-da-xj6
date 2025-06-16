import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Institution, LocationData } from '../types';
import { locationService } from '../services/locationService';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const institutionIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  userLocation: LocationData | null;
  institutions: Institution[];
  onInstitutionClick?: (institution: Institution) => void;
  height?: string;
  zoom?: number;
}

// Component to update map view when location changes
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const Map: React.FC<MapProps> = ({
  userLocation,
  institutions,
  onInstitutionClick,
  height = '400px',
  zoom = 13
}) => {
  const mapRef = useRef<any>(null);

  // Default center (São Paulo)
  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  const handleInstitutionClick = (institution: Institution) => {
    if (onInstitutionClick) {
      onInstitutionClick(institution);
    }
  };

  const getDistanceText = (institution: Institution): string => {
    if (!userLocation) return '';
    
    const distance = locationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      institution.address.latitude,
      institution.address.longitude
    );
    
    return distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Sua localização</strong>
                {userLocation.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    {userLocation.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Institution markers */}
        {institutions.map((institution) => (
          <Marker
            key={institution.id}
            position={[institution.address.latitude, institution.address.longitude]}
            icon={institutionIcon}
            eventHandlers={{
              click: () => handleInstitutionClick(institution)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">{institution.name}</h3>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    {institution.address.street}, {institution.address.number}
                  </p>
                  <p className="text-gray-600">
                    {institution.address.neighborhood}, {institution.address.city}
                  </p>
                  
                  {userLocation && (
                    <p className="text-green-600 font-medium">
                      📍 {getDistanceText(institution)} de distância
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span>{institution.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({institution.totalRatings} avaliações)</span>
                  </div>
                  
                  <div className="mt-3">
                    <p className="font-medium mb-1">Aceita:</p>
                    <div className="flex flex-wrap gap-1">
                      {institution.acceptedCategories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {category}
                        </span>
                      ))}
                      {institution.acceptedCategories.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{institution.acceptedCategories.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleInstitutionClick(institution)}
                  className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  Ver detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};