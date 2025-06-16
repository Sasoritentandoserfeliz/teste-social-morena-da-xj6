import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Map } from '../components/Map';
import { InstitutionCard } from '../components/InstitutionCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { useLocation } from '../contexts/LocationContext';
import { useData } from '../contexts/DataContext';
import { Institution, FilterOptions } from '../types';
import { locationService } from '../services/locationService';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { fileService } from '../services/fileService';
import { MapPin, Search, Filter, Heart } from 'lucide-react';
import Swal from 'sweetalert2';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userLocation, requestLocation, setManualLocation, isLoading: locationLoading } = useLocation();
  const { institutions, categories } = useData();
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);

  // Initialize sample data on first load
  useEffect(() => {
    dataService.initializeSampleData();
    authService.initializeSampleData();
    fileService.initializeFolders();
  }, []);

  const handleRequestLocation = async () => {
    const success = await requestLocation();
    if (!success) {
      Swal.fire({
        icon: 'warning',
        title: 'Localização não disponível',
        text: 'Não foi possível obter sua localização. Você pode inserir seu endereço manualmente.',
        confirmButtonColor: '#2E7D32',
        showCancelButton: true,
        confirmButtonText: 'Inserir endereço',
        cancelButtonText: 'Continuar sem localização'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowAddressInput(true);
        }
      });
    }
  };

  const handleManualAddress = async () => {
    if (!manualAddress.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Endereço obrigatório',
        text: 'Por favor, insira um endereço válido.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    const success = await setManualLocation(manualAddress);
    if (success) {
      setShowAddressInput(false);
      setManualAddress('');
      Swal.fire({
        icon: 'success',
        title: 'Localização definida!',
        text: 'Agora você pode ver as instituições próximas.',
        confirmButtonColor: '#2E7D32',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Endereço não encontrado',
        text: 'Não foi possível encontrar o endereço informado. Verifique e tente novamente.',
        confirmButtonColor: '#2E7D32'
      });
    }
  };

  const filteredInstitutions = useMemo(() => {
    let filtered = [...institutions];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(inst => 
        inst.name.toLowerCase().includes(query) ||
        inst.address.city.toLowerCase().includes(query) ||
        inst.address.neighborhood.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(inst => 
        inst.acceptedCategories.includes(filters.category!)
      );
    }

    // Distance filter
    if (filters.maxDistance && userLocation) {
      filtered = filtered.filter(inst => {
        const distance = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          inst.address.latitude,
          inst.address.longitude
        );
        return distance <= filters.maxDistance!;
      });
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(inst => inst.rating >= filters.minRating!);
    }

    // Open now filter
    if (filters.openNow) {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      filtered = filtered.filter(inst => {
        const todayHours = inst.workingHours.find(wh => wh.dayOfWeek === currentDay);
        if (!todayHours || !todayHours.isOpen) return false;
        
        const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);
        
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;
        
        return currentTime >= openTime && currentTime <= closeTime;
      });
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        const distanceA = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.address.latitude,
          a.address.longitude
        );
        const distanceB = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.address.latitude,
          b.address.longitude
        );
        return distanceA - distanceB;
      });
    }

    return filtered;
  }, [institutions, filters, userLocation]);

  const handleInstitutionClick = (institution: Institution) => {
    navigate(`/institution/${institution.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="mx-auto mb-6 text-white" size={64} />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Não sabe onde doar?
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-orange-300 mb-8">
              A gente te ajuda!
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Conectamos doadores com instituições próximas que realmente precisam da sua ajuda.
            </p>
            
            {!userLocation ? (
              <div className="space-y-4">
                {!showAddressInput ? (
                  <Button
                    onClick={handleRequestLocation}
                    disabled={locationLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                  >
                    <MapPin className="mr-2" size={20} />
                    {locationLoading ? 'Obtendo localização...' : 'Permitir localização'}
                  </Button>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <Input
                      type="text"
                      placeholder="Digite seu endereço (ex: Rua das Flores, 123, São Paulo)"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="bg-white text-gray-900"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleManualAddress}
                        className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                      >
                        Buscar
                      </Button>
                      <Button
                        onClick={() => setShowAddressInput(false)}
                        variant="outline"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-green-100">
                  Ou{' '}
                  <button
                    onClick={() => setShowAddressInput(!showAddressInput)}
                    className="underline hover:text-white"
                  >
                    {showAddressInput ? 'use sua localização' : 'digite seu endereço'}
                  </button>
                </p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-100 mb-2">📍 Sua localização:</p>
                <p className="font-medium">{userLocation.city}, {userLocation.state}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                >
                  <Filter size={16} />
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      type="text"
                      placeholder="Nome ou cidade..."
                      value={filters.searchQuery || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <Select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                    options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                  />
                </div>

                {/* Distance */}
                {userLocation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distância máxima
                    </label>
                    <Select
                      value={filters.maxDistance?.toString() || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        maxDistance: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      options={[
                        { value: '1', label: '1 km' },
                        { value: '2', label: '2 km' },
                        { value: '5', label: '5 km' },
                        { value: '10', label: '10 km' },
                        { value: '20', label: '20 km' }
                      ]}
                    />
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação mínima
                  </label>
                  <Select
                    value={filters.minRating?.toString() || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      minRating: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    options={[
                      { value: '3', label: '3+ estrelas' },
                      { value: '4', label: '4+ estrelas' },
                      { value: '4.5', label: '4.5+ estrelas' }
                    ]}
                  />
                </div>

                {/* Open Now */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="openNow"
                    checked={filters.openNow || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, openNow: e.target.checked || undefined }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="openNow" className="text-sm text-gray-700">
                    Aberto agora
                  </label>
                </div>

                {/* Clear Filters */}
                <Button
                  onClick={() => setFilters({})}
                  variant="outline"
                  className="w-full"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Map and Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Instituições próximas
              </h3>
              <Map
                userLocation={userLocation}
                institutions={filteredInstitutions}
                onInstitutionClick={handleInstitutionClick}
                height="400px"
              />
            </div>

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredInstitutions.length} instituições encontradas
                </h3>
              </div>

              {filteredInstitutions.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma instituição encontrada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros ou expandir a área de busca.
                  </p>
                  <Button
                    onClick={() => setFilters({})}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredInstitutions.map((institution) => (
                    <InstitutionCard
                      key={institution.id}
                      institution={institution}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};