import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Institution, Donation } from '../types';
import { 
  Package, 
  Calendar, 
  CheckCircle, 
  Clock,
  Star,
  MapPin,
  Settings,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const InstitutionDashboard: React.FC = () => {
  const { user } = useAuth();
  const { donations, institutions, updateDonation } = useData();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [institutionDonations, setInstitutionDonations] = useState<Donation[]>([]);

  useEffect(() => {
    if (user && user.type === 'institution') {
      const inst = institutions.find(inst => inst.id === user.id);
      setInstitution(inst || null);
      
      if (inst) {
        const filtered = donations.filter(donation => donation.institutionId === inst.id);
        setInstitutionDonations(filtered);
      }
    }
  }, [user, donations, institutions]);

  const handleConfirmDelivery = (donationId: string) => {
    const donation = institutionDonations.find(d => d.id === donationId);
    if (donation) {
      const updatedDonation = {
        ...donation,
        status: 'delivered' as const,
        deliveredDate: new Date(),
        updatedAt: new Date()
      };
      updateDonation(updatedDonation);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="text-blue-500" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'delivered':
        return 'Entregue';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: institutionDonations.length,
    scheduled: institutionDonations.filter(d => d.status === 'scheduled').length,
    delivered: institutionDonations.filter(d => d.status === 'delivered').length,
    rating: institution?.rating || 0
  };

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {institution.name} 🏢
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie as doações recebidas e mantenha seu perfil atualizado.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total recebido</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="p-6 h-auto flex flex-col items-center space-y-2"
            >
              <Settings size={32} />
              <span className="text-lg font-medium">Editar perfil</span>
              <span className="text-sm opacity-70">Atualize suas informações</span>
            </Button>

            <Button
              variant="outline"
              className="p-6 h-auto flex flex-col items-center space-y-2"
            >
              <MapPin size={32} />
              <span className="text-lg font-medium">Ver no mapa</span>
              <span className="text-sm opacity-70">Veja sua localização</span>
            </Button>

            <Button
              variant="outline"
              className="p-6 h-auto flex flex-col items-center space-y-2"
            >
              <Users size={32} />
              <span className="text-lg font-medium">Gerenciar categorias</span>
              <span className="text-sm opacity-70">Tipos de doação aceitos</span>
            </Button>
          </div>
        </div>

        {/* Donations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Doações recebidas</h2>
          </div>

          {institutionDonations.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma doação ainda
              </h3>
              <p className="text-gray-600">
                Quando alguém agendar uma entrega para sua instituição, ela aparecerá aqui.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {institutionDonations.map((donation) => (
                <Card key={donation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(donation.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                          {getStatusText(donation.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(donation.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {donation.category} - {donation.subcategory}
                      </h3>
                      
                      <p className="text-gray-600 mb-3">
                        {donation.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>
                          <strong>Quantidade:</strong> {donation.quantity} {donation.quantity === 1 ? 'item' : 'itens'}
                        </span>
                        <span>
                          <strong>Condição:</strong> {
                            donation.condition === 'new' ? 'Novo' :
                            donation.condition === 'used_good' ? 'Usado (bom estado)' :
                            'Usado (estado regular)'
                          }
                        </span>
                      </div>

                      {donation.scheduledDate && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <Calendar className="inline mr-1" size={14} />
                            <strong>Entrega agendada para:</strong>{' '}
                            {format(new Date(donation.scheduledDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}

                      {donation.deliveredDate && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            <CheckCircle className="inline mr-1" size={14} />
                            <strong>Entregue em:</strong>{' '}
                            {format(new Date(donation.deliveredDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                    {donation.status === 'scheduled' && (
                      <Button
                        onClick={() => handleConfirmDelivery(donation.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="mr-1" size={14} />
                        Confirmar entrega
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};