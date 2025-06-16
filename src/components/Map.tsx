import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User } from '../types';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = L.divIcon({
  html: `
    <div style="
      background-color: #3B82F6;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const institutionIcon = L.divIcon({
  html: `
    <div style="
      background-color: #10B981;
      width: 35px;
      height: 35px;
      border-radius: 8px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],
  popupAnchor: [0, -17.5]
});

interface MapProps {
  institutions: User[];
  userLocation?: { lat: number; lng: number };
  onInstitutionClick?: (institution: User) => void;
}

export const Map: React.FC<MapProps> = ({ 
  institutions, 
  userLocation, 
  onInstitutionClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        userLocation || [-23.5505, -46.6333], // Default to São Paulo
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add user location marker
    if (userLocation && mapInstanceRef.current) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userIcon 
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-blue-600">Sua localização</h3>
            <p class="text-sm text-gray-600">Você está aqui</p>
          </div>
        `);
      
      markersRef.current.push(userMarker);
    }

    // Add institution markers
    institutions.forEach(institution => {
      if (institution.address?.latitude && institution.address?.longitude && mapInstanceRef.current) {
        const marker = L.marker(
          [institution.address.latitude, institution.address.longitude],
          { icon: institutionIcon }
        )
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-3 min-w-[200px]">
              <div class="flex items-center mb-2">
                ${institution.profileImage ? 
                  `<img src="${institution.profileImage}" alt="${institution.name}" class="w-8 h-8 rounded-full mr-2 object-cover">` : 
                  '<div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2"><svg width="16" height="16" fill="#10B981" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></div>'
                }
                <h3 class="font-semibold text-green-600">${institution.name}</h3>
              </div>
              <p class="text-sm text-gray-600 mb-2">${institution.description || 'Instituição beneficente'}</p>
              <div class="text-xs text-gray-500 mb-2">
                <p>${institution.address.street}, ${institution.address.number}</p>
                <p>${institution.address.neighborhood} - ${institution.address.city}/${institution.address.state}</p>
              </div>
              ${institution.phone ? `<p class="text-xs text-gray-500 mb-2">📞 ${institution.phone}</p>` : ''}
              ${institution.rating > 0 ? 
                `<div class="flex items-center text-xs">
                  <span class="text-yellow-500">⭐</span>
                  <span class="ml-1">${institution.rating.toFixed(1)} (${institution.totalRatings} avaliações)</span>
                </div>` : 
                '<p class="text-xs text-gray-500">Sem avaliações ainda</p>'
              }
              <button 
                onclick="window.selectInstitution('${institution.id}')" 
                class="mt-2 w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Ver detalhes
              </button>
            </div>
          `);

        markersRef.current.push(marker);
      }
    });

    // Set up global function for institution selection
    (window as any).selectInstitution = (institutionId: string) => {
      const institution = institutions.find(inst => inst.id === institutionId);
      if (institution && onInstitutionClick) {
        onInstitutionClick(institution);
      }
    };

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => {
          mapInstanceRef.current?.removeLayer(marker);
        });
        markersRef.current = [];
      }
    };
  }, [institutions, userLocation, onInstitutionClick]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
};