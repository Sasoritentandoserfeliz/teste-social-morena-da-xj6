import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { 
  Building, 
  Heart, 
  Package, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Edit3,
  Save,
  X,
  Calendar,
  TrendingUp,
  Users,
  Gift
} from 'lucide-react';
import { WorkingHours } from '../types';
import Swal from 'sweetalert2';

export const InstitutionDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { donations, deliveries, refreshData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    phone: '',
    workingHours: [] as WorkingHours[]
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        description: user.description || '',
        phone: user.phone || '',
        workingHours: user.workingHours || []
      });
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (!user || user.type !== 'institution') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Acesso negado</h2>
            <p className="text-gray-600 mt-2">Esta página é apenas para instituições.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter donations and deliveries for this institution
  const institutionDonations = donations.filter(donation => 
    donation.institutionId === user.id
  );

  const institutionDeliveries = deliveries.filter(delivery => 
    institutionDonations.some(donation => donation.id === delivery.donationId)
  );

  const stats = {
    totalDonations: institutionDonations.length,
    availableDonations: institutionDonations.filter(d => d.status === 'available').length,
    reservedDonations: institutionDonations.filter(d => d.status === 'reserved').length,
    completedDonations: institutionDonations.filter(d => d.status === 'completed').length,
    totalDeliveries: institutionDeliveries.length,
    completedDeliveries: institutionDeliveries.filter(d => d.status === 'completed').length
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        name: editForm.name,
        description: editForm.description,
        phone: editForm.phone,
        workingHours: editForm.workingHours
      };

      updateUser(updatedUser);
      setIsEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'Perfil atualizado!',
        text: 'Suas informações foram salvas com sucesso.',
        confirmButtonColor: '#10B981',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao salvar',
        text: 'Não foi possível atualizar o perfil. Tente novamente.',
        confirmButtonColor: '#10B981'
      });
    }
  };

  const handleWorkingHoursChange = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setEditForm(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center">
                  <Building className="text-green-600" size={32} />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">Dashboard da Instituição</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user.verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verificada
                </span>
              )}
              {user.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-500" size={16} />
                  <span className="text-sm font-medium">{user.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({user.totalRatings})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Doações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
              <Gift className="text-green-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-blue-600">{stats.availableDonations}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservadas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.reservedDonations}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedDonations}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Informações da Instituição</h2>
                <Button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                >
                  {isEditing ? (
                    <>
                      <Save size={16} className="mr-2" />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} className="mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Instituição
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome da instituição"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-500" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva a missão e atividades da instituição..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900">{user.description}</p>
                  )}
                </div>

                {/* Address */}
                {user.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <div className="flex items-start space-x-2">
                      <MapPin size={16} className="text-gray-500 mt-1" />
                      <div className="text-gray-900">
                        <p>{user.address.street}, {user.address.number}</p>
                        {user.address.complement && <p>{user.address.complement}</p>}
                        <p>{user.address.neighborhood} - {user.address.city}/{user.address.state}</p>
                        <p>CEP: {user.address.zipCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Funcionamento
                  </label>
                  <div className="space-y-3">
                    {(isEditing ? editForm.workingHours : user.workingHours || []).map((day, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20">
                          <span className="text-sm font-medium text-gray-700">
                            {dayNames[day.dayOfWeek]}
                          </span>
                        </div>
                        
                        {isEditing ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={day.isOpen}
                                onChange={(e) => handleWorkingHoursChange(index, 'isOpen', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-600">Aberto</span>
                            </div>
                            
                            {day.isOpen && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="time"
                                  value={day.openTime}
                                  onChange={(e) => handleWorkingHoursChange(index, 'openTime', e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <span className="text-gray-500">às</span>
                                <input
                                  type="time"
                                  value={day.closeTime}
                                  onChange={(e) => handleWorkingHoursChange(index, 'closeTime', e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {day.isOpen ? (
                              <span className="text-sm text-gray-900">
                                {day.openTime} às {day.closeTime}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">Fechado</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save size={16} className="mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
              
              <div className="space-y-4">
                {institutionDonations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Package className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {donation.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {donation.category} • {new Date(donation.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        donation.status === 'available' ? 'bg-blue-100 text-blue-800' :
                        donation.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {donation.status === 'available' ? 'Disponível' :
                         donation.status === 'reserved' ? 'Reservada' : 'Concluída'}
                      </span>
                    </div>
                  </div>
                ))}

                {institutionDonations.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Nenhuma doação recebida ainda</p>
                    <p className="text-sm text-gray-400 mt-1">
                      As doações aparecerão aqui quando os doadores as direcionarem para sua instituição
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};