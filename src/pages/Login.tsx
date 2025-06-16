import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { validationService } from '../services/validationService';
import { FormField } from '../types';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: { value: '', error: '', touched: false, isValid: false },
    password: { value: '', error: '', touched: false, isValid: false }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string): FormField => {
    let validation;
    
    switch (name) {
      case 'email':
        validation = validationService.validateEmail(value);
        break;
      case 'password':
        validation = validationService.validateRequired(value, 'Senha');
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

  const isFormValid = () => {
    return Object.values(formData).every(field => field.isValid && field.value.trim() !== '');
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
      const success = await login(formData.email.value, formData.password.value);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Login realizado!',
          text: 'Bem-vindo de volta!',
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
        title: 'Erro no login',
        text: error.message || 'Verifique suas credenciais e tente novamente.',
        confirmButtonColor: '#2E7D32'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Heart className="mx-auto text-green-600 mb-4" size={48} />
            <h2 className="text-3xl font-bold text-gray-900">
              Entrar na sua conta
            </h2>
            <p className="mt-2 text-gray-600">
              Ou{' '}
              <Link
                to="/register"
                className="text-green-600 hover:text-green-500 font-medium"
              >
                crie uma nova conta
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                    placeholder="Sua senha"
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
            </div>

            <div>
              <Button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Esqueceu sua senha?{' '}
                <button
                  type="button"
                  className="text-green-600 hover:text-green-500 font-medium"
                  onClick={() => {
                    Swal.fire({
                      icon: 'info',
                      title: 'Recuperação de senha',
                      text: 'Esta funcionalidade será implementada em breve.',
                      confirmButtonColor: '#2E7D32'
                    });
                  }}
                >
                  Clique aqui
                </button>
              </p>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Contas de demonstração:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@benigna.com / admin123</p>
              <p><strong>Doador:</strong> Cadastre-se como doador</p>
              <p><strong>Instituição:</strong> Cadastre-se como instituição</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};