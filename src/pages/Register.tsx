import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { validationService } from '../services/validationService';
import { addressService } from '../services/addressService';
import { fileService } from '../services/fileService';
import { FormField, WorkingHours } from '../types';
import { Heart, User, Mail, Lock, Phone, MapPin, Building, Upload, Eye, EyeOff } from 'lucide-react';
import InputMask from 'react-input-mask';
import Swal from 'sweetalert2';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState<'donor' | 'institution'>('donor');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: { value: '', error: '', touched: false, isValid: false },
    email: { value: '', error: '', touched: false, isValid: false },
    password: { value: '', error: '', touched: false, isValid: false },
    phone: { value: '', error: '', touched: false, isValid: false },
    cpf: { value: '', error: '', touched: false, isValid: false },
    cnpj: { value: '', error: '', touched: false, isValid: false },
    description: { value: '', error: '', touched: false, isValid: false },
    zipCode: { value: '', error: '', touched: false, isValid: false },
    street: { value: '', error: '', touched: false, isValid: false },
    number: { value: '', error: '', touched: false, isValid: false },
    complement: { value: '', error: '', touched: false, isValid: true },
    neighborhood: { value: '', error: '', touched: false, isValid: false },
    city: { value: '', error: '', touched: false, isValid: false },
    state: { value: '', error: '', touched: false, isValid: false }
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { dayOfWeek: 0, isOpen: false, openTime: '08:00', closeTime: '17:00' },
    { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayOfWeek: 6, isOpen: false, openTime: '08:00', closeTime: '17:00' }
  ]);

  const validateField = (name: string, value: string): FormField => {
    let validation;
    
    switch (name) {
      case 'name':
        validation = validationService.validateRequired(value, 'Nome');
        break;
      case 'email':
        validation = validationService.validateEmail(value);
        break;
      case 'password':
        validation = validationService.validatePassword(value);
        break;
      case 'phone':
        validation = validationService.validatePhone(value);
        break;
      case 'cpf':
        validation = userType === 'donor' ? validationService.validateCPF(value) : { isValid: true, message: '' };
        break;
      case 'cnpj':
        validation = userType === 'institution' ? validationService.validateCNPJ(value) : { isValid: true, message: '' };
        break;
      case 'description':
        validation = userType === 'institution' ? validationService.validateRequired(value, 'Descrição') : { isValid: true, message: '' };
        break;
      case 'zipCode':
        validation = userType === 'institution' ? validationService.validateZipCode(value) : { isValid: true, message: '' };
        break;
      case 'street':
      case 'number':
      case 'neighborhood':
      case 'city':
      case 'state':
        validation = userType === 'institution' ? validationService.validateRequired(value, name) : { isValid: true, message: '' };
        break;
      default:
        validation = { isValid: true, message: '' };
    }
    
    return {
      value,
      error: validation.isValid ? '' : validation.message,
      touched: true,
      isValid: validation.isValid
    };
  };

  const handleInputChange = (name: string, value: string) => {
    const field = validateField(name, value);
    setFormData(prev => ({
      ...prev,
      [name]: field
    }));
  };

  const handleBlur = (name: string) => {
    const field = formData[name as keyof typeof formData];
    if (!field.touched) {
      setFormData(prev => ({
        ...prev,
        [name]: { ...field, touched: true }
      }));
    }
  };

  const handleZipCodeBlur = async () => {
    const zipCode = formData.zipCode.value.replace(/\D/g, '');
    
    if (zipCode.length === 8) {
      try {
        const addressData = await addressService.getAddressByZipCode(zipCode);
        
        if (addressData) {
          setFormData(prev => ({
            ...prev,
            street: { ...prev.street, value: addressData.logradouro, isValid: true },
            neighborhood: { ...prev.neighborhood, value: addressData.bairro, isValid: true },
            city: { ...prev.city, value: addressData.localidade, isValid: true },
            state: { ...prev.state, value: addressData.uf, isValid: true }
          }));
          
          Swal.fire({
            icon: 'success',
            title: 'CEP encontrado!',
            text: 'Endereço preenchido automaticamente.',
            confirmButtonColor: '#2E7D32',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'warning',
          title: 'CEP não encontrado',
          text: error.message || 'Preencha o endereço manualmente.',
          confirmButtonColor: '#2E7D32'
        });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          icon: 'warning',
          title: 'Arquivo muito grande',
          text: 'A imagem deve ter no máximo 5MB.',
          confirmButtonColor: '#2E7D32'
        });
        return;
      }
      
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkingHoursChange = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setWorkingHours(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const isFormValid = () => {
    const requiredFields = userType === 'donor' 
      ? ['name', 'email', 'password', 'phone', 'cpf']
      : ['name', 'email', 'password', 'phone', 'cnpj', 'description', 'zipCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    
    return requiredFields.every(field => {
      const formField = formData[field as keyof typeof formData];
      return formField.isValid && formField.value.trim() !== '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulário inválido',
        text: 'Por favor, corrija os erros antes de continuar.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    setIsLoading(true);

    try {
      let profileImagePath = '';
      
      // Upload profile image if provided
      if (profileImage) {
        const folder = userType === 'institution' ? 'institutions' : 'profiles';
        profileImagePath = await fileService.saveImage(profileImage, folder);
      }

      const userData: any = {
        name: formData.name.value,
        email: formData.email.value,
        password: formData.password.value,
        phone: formData.phone.value,
        type: userType,
        profileImage: profileImagePath
      };

      if (userType === 'donor') {
        userData.cpf = formData.cpf.value;
      } else {
        userData.cnpj = formData.cnpj.value;
        userData.description = formData.description.value;
        userData.address = {
          street: formData.street.value,
          number: formData.number.value,
          complement: formData.complement.value,
          neighborhood: formData.neighborhood.value,
          city: formData.city.value,
          state: formData.state.value,
          zipCode: formData.zipCode.value,
          latitude: -23.5505, // Default coordinates (São Paulo)
          longitude: -46.6333
        };
        userData.workingHours = workingHours;
        userData.acceptedCategories = [];
        userData.rating = 0;
        userData.totalRatings = 0;
        userData.verified = false;
      }

      const success = await register(userData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado!',
          text: `Bem-vindo${userType === 'institution' ? 'a' : ''} à Benigna!`,
          confirmButtonColor: '#2E7D32',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/');
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: error.message || 'Tente novamente mais tarde.',
        confirmButtonColor: '#2E7D32'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Heart className="mx-auto text-green-600 mb-4" size={48} />
          <h2 className="text-3xl font-bold text-gray-900">
            Criar conta
          </h2>
          <p className="mt-2 text-gray-600">
            Ou{' '}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              entre na sua conta existente
            </Link>
          </p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tipo de conta
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('donor')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                userType === 'donor'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="mx-auto mb-2" size={32} />
              <h4 className="font-medium">Doador</h4>
              <p className="text-sm text-gray-600 mt-1">
                Quero fazer doações
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setUserType('institution')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                userType === 'institution'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="mx-auto mb-2" size={32} />
              <h4 className="font-medium">Instituição</h4>
              <p className="text-sm text-gray-600 mt-1">
                Recebo doações
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações básicas
            </h3>
            
            <div className="space-y-4">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'institution' ? 'Logo da instituição' : 'Foto de perfil'}
                </label>
                <div className="flex items-center space-x-4">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <Upload className="text-gray-400" size={24} />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profileImage"
                    />
                    <label
                      htmlFor="profileImage"
                      className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Escolher imagem
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG até 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {userType === 'institution' ? 'Nome da instituição' : 'Nome completo'}
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name.value}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder={userType === 'institution' ? 'Ex: ONG Esperança' : 'Seu nome completo'}
                  error={formData.name.touched && !formData.name.isValid}
                  success={formData.name.touched && formData.name.isValid}
                />
                {formData.name.touched && formData.name.error && (
                  <p className="validation-message validation-error">
                    {formData.name.error}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email.value}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="seu@email.com"
                    className="pl-10"
                    error={formData.email.touched && !formData.email.isValid}
                    success={formData.email.touched && formData.email.isValid}
                  />
                </div>
                {formData.email.touched && formData.email.error && (
                  <p className="validation-message validation-error">
                    {formData.email.error}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password.value}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10"
                    error={formData.password.touched && !formData.password.isValid}
                    success={formData.password.touched && formData.password.isValid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password.touched && formData.password.error && (
                  <p className="validation-message validation-error">
                    {formData.password.error}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.phone.value}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="phone"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        error={formData.phone.touched && !formData.phone.isValid}
                        success={formData.phone.touched && formData.phone.isValid}
                      />
                    )}
                  </InputMask>
                </div>
                {formData.phone.touched && formData.phone.error && (
                  <p className="validation-message validation-error">
                    {formData.phone.error}
                  </p>
                )}
              </div>

              {/* CPF/CNPJ */}
              {userType === 'donor' ? (
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <InputMask
                    mask="999.999.999-99"
                    value={formData.cpf.value}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    onBlur={() => handleBlur('cpf')}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="cpf"
                        placeholder="000.000.000-00"
                        error={formData.cpf.touched && !formData.cpf.isValid}
                        success={formData.cpf.touched && formData.cpf.isValid}
                      />
                    )}
                  </InputMask>
                  {formData.cpf.touched && formData.cpf.error && (
                    <p className="validation-message validation-error">
                      {formData.cpf.error}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <InputMask
                    mask="99.999.999/9999-99"
                    value={formData.cnpj.value}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    onBlur={() => handleBlur('cnpj')}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        error={formData.cnpj.touched && !formData.cnpj.isValid}
                        success={formData.cnpj.touched && formData.cnpj.isValid}
                      />
                    )}
                  </InputMask>
                  {formData.cnpj.touched && formData.cnpj.error && (
                    <p className="validation-message validation-error">
                      {formData.cnpj.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Institution-specific fields */}
          {userType === 'institution' && (
            <>
              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sobre a instituição
                </h3>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description.value}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    onBlur={() => handleBlur('description')}
                    placeholder="Descreva a missão, visão e atividades da sua instituição..."
                    rows={4}
                    error={formData.description.touched && !formData.description.isValid}
                    success={formData.description.touched && formData.description.isValid}
                  />
                  {formData.description.touched && formData.description.error && (
                    <p className="validation-message validation-error">
                      {formData.description.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Endereço
                </h3>
                
                <div className="space-y-4">
                  {/* ZIP Code */}
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <div className="flex space-x-2">
                      <InputMask
                        mask="99999-999"
                        value={formData.zipCode.value}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        onBlur={() => {
                          handleBlur('zipCode');
                          handleZipCodeBlur();
                        }}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="zipCode"
                            placeholder="00000-000"
                            className="flex-1"
                            error={formData.zipCode.touched && !formData.zipCode.isValid}
                            success={formData.zipCode.touched && formData.zipCode.isValid}
                          />
                        )}
                      </InputMask>
                    </div>
                    {formData.zipCode.touched && formData.zipCode.error && (
                      <p className="validation-message validation-error">
                        {formData.zipCode.error}
                      </p>
                    )}
                  </div>

                  {/* Street and Number */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Rua
                      </label>
                      <Input
                        id="street"
                        type="text"
                        value={formData.street.value}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        onBlur={() => handleBlur('street')}
                        placeholder="Nome da rua"
                        error={formData.street.touched && !formData.street.isValid}
                        success={formData.street.touched && formData.street.isValid}
                      />
                      {formData.street.touched && formData.street.error && (
                        <p className="validation-message validation-error">
                          {formData.street.error}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      <Input
                        id="number"
                        type="text"
                        value={formData.number.value}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        onBlur={() => handleBlur('number')}
                        placeholder="123"
                        error={formData.number.touched && !formData.number.isValid}
                        success={formData.number.touched && formData.number.isValid}
                      />
                      {formData.number.touched && formData.number.error && (
                        <p className="validation-message validation-error">
                          {formData.number.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Complement */}
                  <div>
                    <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento (opcional)
                    </label>
                    <Input
                      id="complement"
                      type="text"
                      value={formData.complement.value}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      placeholder="Apto, sala, etc."
                    />
                  </div>

                  {/* Neighborhood, City, State */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <Input
                        id="neighborhood"
                        type="text"
                        value={formData.neighborhood.value}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        onBlur={() => handleBlur('neighborhood')}
                        placeholder="Bairro"
                        error={formData.neighborhood.touched && !formData.neighborhood.isValid}
                        success={formData.neighborhood.touched && formData.neighborhood.isValid}
                      />
                      {formData.neighborhood.touched && formData.neighborhood.error && (
                        <p className="validation-message validation-error">
                          {formData.neighborhood.error}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city.value}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        placeholder="Cidade"
                        error={formData.city.touched && !formData.city.isValid}
                        success={formData.city.touched && formData.city.isValid}
                      />
                      {formData.city.touched && formData.city.error && (
                        <p className="validation-message validation-error">
                          {formData.city.error}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state.value}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        onBlur={() => handleBlur('state')}
                        placeholder="SP"
                        maxLength={2}
                        error={formData.state.touched && !formData.state.isValid}
                        success={formData.state.touched && formData.state.isValid}
                      />
                      {formData.state.touched && formData.state.error && (
                        <p className="validation-message validation-error">
                          {formData.state.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Horário de funcionamento
                </h3>
                
                <div className="space-y-4">
                  {workingHours.map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="text-sm font-medium text-gray-700">
                          {dayNames[day.dayOfWeek]}
                        </span>
                      </div>
                      
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
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar conta'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};