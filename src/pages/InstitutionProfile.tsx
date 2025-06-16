import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Map } from '../components/Map';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Institution, Rating } from '../types';
import { fileService } from '../services/fileService';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  Heart
} from 'lucide-react';

export const InstitutionProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { institutions, ratings } = useData();
  const navigate = useNavigate();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [institutionRatings, setInstitutionRatings] = useState<Rating[]>([]);

  useEffect(() => {
    if (id) {
      const inst = institutions.find(inst => inst.id === id);
      setInstitution(inst || null);
      
      if (inst) {
        const instRatings = ratings.filter(rating => rating.institutionId === id);
        setInstitutionRatings(instRatings);
      }
    }
  }, [id, institutions, ratings]);

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Instituição não encontrada</h1>
            <Button
              onClick={() => navigate('/')}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const handleScheduleDelivery = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.type !== 'donor') {
      return;
    }
    
    navigate(`/donor/schedule/${institution.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <Card className="p-8">
              <div className="flex items-start space-x-6">
                {/* Institution Image */}
                <div className="flex-shrink-0">
                  {institution.profileImage ? (
                    <img
                      src={fileService.getImage(institution.profileImage) || '/placeholder-institution.jpg'}
                      alt={institution.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-green-100 flex items-center justify-center">
                      <Heart className="text-green-600" size={32} />
                    </div>
                  )}
                </div>

                {/* Institution Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {institution.name}
                    </h1>
                    {institution.verified && (
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full flex items-center">
                        <CheckCircle size={14} className="mr-1" />
                        Verificada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{institution.address.neighborhood}, {institution.address.city} - {institution.address.state}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock size={16} className={isOpenNow() ? 'text-green-500' : 'text-red-500'} />
                      <span className={isOpenNow() ? 'text-green-600' : 'text-red-600'}>
                        {isOpenNow() ? 'Aberto agora' : 'Fechado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-500 fill-current" size={20} />
                      <span className="text-lg font-semibold">{institution.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({institution.totalRatings} avaliações)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Phone size={16} />
                      <span>{institution.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail size={16} />
                      <span>{institution.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleScheduleDelivery}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  disabled={!user || user.type !== 'donor'}
                >
                  <Calendar className="mr-2" size={16} />
                  Agendar entrega
                </Button>
                
                <Button
                  onClick={() => window.open(`tel:${institution.phone}`, '_self')}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="mr-2" size={16} />
                  Ligar
                </Button>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre a instituição</h2>
              <p className="text-gray-700 leading-relaxed">
                {institution.description}
              </p>
            </Card>

            {/* Accepted Categories */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipos de doação aceitos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {institution.acceptedCategories.map((category) => (
                  <div
                    key={category}
                    className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-center font-medium"
                  >
                    {category}
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Avaliações ({institutionRatings.length})
              </h2>
              
              {institutionRatings.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma avaliação ainda
                  </h3>
                  <p className="text-gray-600">
                    Seja o primeiro a avaliar esta instituição após fazer uma doação.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {institutionRatings.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-700">{rating.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Location */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
              
              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {institution.address.street}, {institution.address.number}
                  </p>
                  {institution.address.complement && (
                    <p className="text-gray-600">{institution.address.complement}</p>
                  )}
                  <p className="text-gray-600">
                    {institution.address.neighborhood}
                  </p>
                  <p className="text-gray-600">
                    {institution.address.city} - {institution.address.state}
                  </p>
                  <p className="text-gray-600">
                    CEP: {institution.address.zipCode}
                  </p>
                </div>
              </div>

              <Map
                userLocation={null}
                institutions={[institution]}
                height="200px"
                zoom={15}
              />
            </Card>

            {/* Working Hours */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horário de funcionamento</h3>
              
              <div className="space-y-2">
                {institution.workingHours.map((hours) => (
                  <div key={hours.dayOfWeek} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {dayNames[hours.dayOfWeek]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Fechado'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações rápidas</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleScheduleDelivery}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!user || user.type !== 'donor'}
                >
                  <Calendar className="mr-2" size={16} />
                  Agendar entrega
                </Button>
                
                <Button
                  onClick={() => window.open(`tel:${institution.phone}`, '_self')}
                  variant="outline"
                  className="w-full"
                >
                  <Phone className="mr-2" size={16} />
                  Ligar agora
                </Button>
                
                <Button
                  onClick={() => window.open(`mailto:${institution.email}`, '_self')}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2" size={16} />
                  Enviar email
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};