import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Institution, Donation } from '../types';
import { ArrowLeft, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import Swal from 'sweetalert2';

export const ScheduleDelivery: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const { user } = useAuth();
  const { institutions, donations, updateDonation } = useData();
  const navigate = useNavigate();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (institutionId) {
      const inst = institutions.find(inst => inst.id === institutionId);
      setInstitution(inst || null);
    }

    if (user) {
      const filtered = donations.filter(d => d.donorId === user.id && d.status === 'pending');
      setUserDonations(filtered);
    }
  }, [institutionId, institutions, user, donations]);

  useEffect(() => {
    if (selectedDate && institution) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      
      const workingHours = institution.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
      
      if (workingHours && workingHours.isOpen) {
        const times = generateTimeSlots(workingHours.openTime, workingHours.closeTime);
        setAvailableTimes(times);
      } else {
        setAvailableTimes([]);
      }
    }
  }, [selectedDate, institution]);

  const generateTimeSlots = (openTime: string, closeTime: string): string[] => {
    const times: string[] = [];
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      times.push(timeString);
      
      currentMinute += 30; // 30-minute intervals
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }
    
    return times;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDonation || !selectedDate || !selectedTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    setIsLoading(true);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      // Update donation with institution and schedule
      const donation = userDonations.find(d => d.id === selectedDonation);
      if (donation && institutionId) {
        const updatedDonation = {
          ...donation,
          institutionId,
          status: 'scheduled' as const,
          scheduledDate: scheduledDateTime,
          updatedAt: new Date()
        };
        
        updateDonation(updatedDonation);
        
        Swal.fire({
          icon: 'success',
          title: 'Entrega agendada!',
          text: `Sua entrega foi agendada para ${scheduledDateTime.toLocaleDateString('pt-BR')} às ${selectedTime}.`,
          confirmButtonColor: '#2E7D32'
        }).then(() => {
          navigate('/donor/dashboard');
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível agendar a entrega. Tente novamente.',
        confirmButtonColor: '#2E7D32'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Instituição não encontrada</h1>
          </div>
        </div>
      </div>
    );
  }

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Agendar entrega</h1>
          <p className="text-gray-600 mt-2">
            Agende a entrega da sua doação para <strong>{institution.name}</strong>
          </p>
        </div>

        <Card className="p-8">
          {userDonations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma doação pendente
              </h3>
              <p className="text-gray-600 mb-6">
                Você precisa criar uma doação antes de agendar uma entrega.
              </p>
              <Button
                onClick={() => navigate('/donor/create-donation')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Criar doação
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Donation Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a doação
                </label>
                <Select
                  value={selectedDonation}
                  onChange={(e) => setSelectedDonation(e.target.value)}
                  options={userDonations.map(donation => ({
                    value: donation.id,
                    label: `${donation.category} - ${donation.subcategory} (${donation.quantity} ${donation.quantity === 1 ? 'item' : 'itens'})`
                  }))}
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da entrega
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  {availableTimes.length === 0 ? (
                    <p className="text-red-600 text-sm">
                      A instituição não funciona neste dia. Selecione outra data.
                    </p>
                  ) : (
                    <Select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      options={availableTimes.map(time => ({
                        value: time,
                        label: time
                      }))}
                    />
                  )}
                </div>
              )}

              {/* Institution Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MapPin className="mr-2" size={16} />
                  Informações da instituição
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Endereço:</strong> {institution.address.street}, {institution.address.number}</p>
                  <p>{institution.address.neighborhood}, {institution.address.city} - {institution.address.state}</p>
                  <p className="flex items-center">
                    <Phone className="mr-1" size={14} />
                    <strong>Telefone:</strong> {institution.phone}
                  </p>
                </div>
              </div>

              {/* Working Hours Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Clock className="mr-2" size={16} />
                  Horário de funcionamento
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {institution.workingHours.map((hours) => (
                    <div key={hours.dayOfWeek} className="flex justify-between">
                      <span>{dayNames[hours.dayOfWeek]}</span>
                      <span>{hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Fechado'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading || !selectedDonation || !selectedDate || !selectedTime || availableTimes.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? 'Agendando...' : 'Agendar entrega'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};