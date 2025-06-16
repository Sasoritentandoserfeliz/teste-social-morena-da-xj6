import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { fileService } from '../services/fileService';
import { v4 as uuidv4 } from 'uuid';
import { Donation } from '../types';
import { ArrowLeft, Upload, X, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

export const CreateDonation: React.FC = () => {
  const { user } = useAuth();
  const { categories, addDonation } = useData();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    quantity: 1,
    condition: 'used_good' as 'new' | 'used_good' | 'used_fair'
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = categories.find(cat => cat.name === formData.category);
  const subcategoryOptions = selectedCategory?.subcategories.map(sub => ({
    value: sub.name,
    label: sub.name
  })) || [];

  const conditionOptions = [
    { value: 'new', label: 'Novo' },
    { value: 'used_good', label: 'Usado (bom estado)' },
    { value: 'used_fair', label: 'Usado (estado regular)' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        subcategory: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Limite de imagens',
        text: 'Você pode adicionar no máximo 5 imagens.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          icon: 'warning',
          title: 'Arquivo muito grande',
          text: `A imagem ${file.name} é muito grande. Máximo 5MB por imagem.`,
          confirmButtonColor: '#2E7D32'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      
      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    return (
      formData.category &&
      formData.subcategory &&
      formData.description.trim() &&
      formData.quantity > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulário incompleto',
        text: 'Por favor, preencha todos os campos obrigatórios.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Erro de autenticação',
        text: 'Você precisa estar logado para criar uma doação.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload images
      const imagePaths: string[] = [];
      for (const image of images) {
        const imagePath = await fileService.saveImage(image, 'donations');
        imagePaths.push(imagePath);
      }

      // Create donation
      const donation: Donation = {
        id: uuidv4(),
        donorId: user.id,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        quantity: formData.quantity,
        condition: formData.condition,
        images: imagePaths,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addDonation(donation);

      Swal.fire({
        icon: 'success',
        title: 'Doação criada!',
        text: 'Sua doação foi cadastrada com sucesso. Agora você pode agendar a entrega.',
        confirmButtonColor: '#2E7D32',
        showCancelButton: true,
        confirmButtonText: 'Agendar entrega',
        cancelButtonText: 'Ir para dashboard'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/');
        } else {
          navigate('/donor/dashboard');
        }
      });
    } catch (error) {
      console.error('Error creating donation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao criar doação',
        text: 'Não foi possível criar a doação. Tente novamente.',
        confirmButtonColor: '#2E7D32'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/donor/dashboard')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Nova doação</h1>
          <p className="text-gray-600 mt-2">
            Cadastre os itens que você gostaria de doar e ajude quem precisa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Categoria da doação
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  options={categories.map(cat => ({ value: cat.name, label: `${cat.icon} ${cat.name}` }))}
                />
              </div>

              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategoria *
                  </label>
                  <Select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    options={subcategoryOptions}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Item Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalhes do item
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o item que você está doando (marca, modelo, estado, etc.)"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condição *
                  </label>
                  <Select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    options={conditionOptions}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fotos do item
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Adicione até 5 fotos para mostrar melhor o item (opcional, mas recomendado)
            </p>
            
            <div className="space-y-4">
              {/* Upload Button */}
              {images.length < 5 && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <div className="text-center">
                      <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600">
                        Clique para adicionar fotos
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG até 5MB cada
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/donor/dashboard')}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-2"></div>
                  Criando doação...
                </div>
              ) : (
                'Criar doação'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};