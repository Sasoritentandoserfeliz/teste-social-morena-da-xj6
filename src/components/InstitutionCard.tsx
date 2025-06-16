import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Institution, LocationData } from '../types';
import { locationService } from '../services/locationService';
import { Button } from './ui/button';
import { MapPin, Star, Clock, Phone } from 'lucide-react';

interface InstitutionCardProps {
  institution: Institution;
  userLocation?: LocationData | null;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  userLocation
}) => {
  const navigate = useNavigate();

  const getDistance = (): string => {
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

  const isOpenNow = (): boolean => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todayHours = institution.workingHours.find(wh => wh.dayOfWeek === currentDay);
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const handleViewDetails = () => {
    navigate(`/institution/${institution.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {institution.name}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin size={16} />
              <span>{institution.address.neighborhood}, {institution.address.city}</span>
              {userLocation && (
                <span className="text-green-600 font-medium">
                  • {getDistance()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {institution.verified && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Verificada
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {institution.description}
      </p>

      {/* Rating and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-500 fill-current" size={16} />
            <span className="text-sm font-medium">{institution.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({institution.totalRatings})</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock size={16} className={isOpenNow() ? 'text-green-500' : 'text-red-500'} />
            <span className={`text-sm ${isOpenNow() ? 'text-green-600' : 'text-red-600'}`}>
              {isOpenNow() ? 'Aberto agora' : 'Fechado'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-gray-600">
          <Phone size={16} />
          <span className="text-sm">{institution.phone}</span>
        </div>
      </div>

      {/* Accepted Categories */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Aceita doações de:</p>
        <div className="flex flex-wrap gap-2">
          {institution.acceptedCategories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {category}
            </span>
          ))}
          {institution.acceptedCategories.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{institution.acceptedCategories.length - 3} mais
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleViewDetails}
          variant="outline"
          className="flex-1"
        >
          Ver detalhes
        </Button>
        
        <Button
          onClick={() => navigate(`/donor/schedule/${institution.id}`)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          Agendar entrega
        </Button>
      </div>
    </div>
  );
};