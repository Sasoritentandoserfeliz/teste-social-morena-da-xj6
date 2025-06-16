import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Donation } from '../types';
import { fileService } from '../services/fileService';
import { 
  Plus, 
  Package, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  MapPin,
  Gift
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { donations, institutions } = useData();
  const navigate = useNavigate();
  
  const [userDonations, setUserDonations] = useState<Donation[]>([]);

  useEffect(() => {
    if (user) {
      const filtered = donations.filter(donation => donation.donorId === user.id);
      setUserDonations(filtered);
    }
  }, [user, donations]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'scheduled':
        return <Calendar className="text-blue-500" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'scheduled':
        return 'Agendada';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstitutionName = (institutionId?: string) => {
    if (!institutionId) return 'Não definida';
    const institution = institutions.find(inst => inst.id === institutionId);
    return institution?.name || 'Instituição não encontrada';
  };

  const stats = {
    total: userDonations.length,
    pending: userDonations.filter(d => d.status === 'pending').length,
    scheduled: userDonations.filter(d => d.status === 'scheduled').length,
    delivered: userDonations.filter(d => d.status === 'delivered').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas doações e acompanhe o impacto das suas contribuições.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gift className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de doações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/donor/create-donation')}
              className="bg-green-600 hover:bg-green-700 text-white p-6 h-auto flex flex-col items-center space-y-2"
            >
              <Plus size={32} />
              <span className="text-lg font-medium">Nova doação</span>
              <span className="text-sm opacity-90">Cadastre uma nova doação</span>
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="p-6 h-auto flex flex-col items-center space-y-2"
            >
              <MapPin size={32} />
              <span className="text-lg font-medium">Encontrar instituições</span>
              <span className="text-sm opacity-70">Veja instituições próximas</span>
            </Button>

            <Button
              onClick={() => navigate('/donor/history')}
              variant="outline"
              className="p-6 h-auto flex flex-col items-center space-y-2"
            >
              <Package size={32} />
              <span className="text-lg font-medium">Histórico completo</span>
              <span className="text-sm opacity-70">Veja todas as suas doações</span>
            </Button>
          </div>
        </div>

        {/* Recent Donations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Suas doações</h2>
            <Button
              onClick={() => navigate('/donor/create-donation')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2" size={16} />
              Nova doação
            </Button>
          </div>

          {userDonations.length === 0 ? (
            <Card className="p-12 text-center">
              <Gift className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma doação ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Comece fazendo sua primeira doação e ajude quem precisa!
              </p>
              <Button
                onClick={() => navigate('/donor/create-donation')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2" size={16} />
                Criar primeira doação
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {userDonations.map((donation) => (
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
                        <span>
                          <strong>Instituição:</strong> {getInstitutionName(donation.institutionId)}
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
                    </div>

                    {/* Donation Images */}
                    {donation.images.length > 0 && (
                      <div className="ml-6">
                        <div className="w-20 h-20 rounded-lg overflow-hidden">
                          <img
                            src={fileService.getImage(donation.images[0]) || '/placeholder-image.jpg'}
                            alt="Doação"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {donation.images.length > 1 && (
                          <p className="text-xs text-gray-500 text-center mt-1">
                            +{donation.images.length - 1} foto{donation.images.length > 2 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                    {donation.status === 'pending' && (
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        size="sm"
                      >
                        Agendar entrega
                      </Button>
                    )}
                    
                    {donation.status === 'delivered' && (
                      <Button
                        onClick={() => {
                          // Navigate to rating page
                          console.log('Rate institution');
                        }}
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        <Star className="mr-1" size={14} />
                        Avaliar
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