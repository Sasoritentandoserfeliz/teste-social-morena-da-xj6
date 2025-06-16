import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useData } from '../contexts/DataContext';
import { Category, Subcategory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  Users, 
  Building, 
  Package, 
  Star,
  Plus,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminDashboard: React.FC = () => {
  const { institutions, donations, categories, ratings } = useData();
  
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', categoryId: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const stats = {
    totalInstitutions: institutions.length,
    verifiedInstitutions: institutions.filter(inst => inst.verified).length,
    totalDonations: donations.length,
    deliveredDonations: donations.filter(d => d.status === 'delivered').length,
    totalRatings: ratings.length,
    averageRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim() || !newCategory.icon.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha o nome e o ícone da categoria.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    const category: Category = {
      id: uuidv4(),
      name: newCategory.name,
      icon: newCategory.icon,
      subcategorias: []
    };

    // Here you would save the category using dataService
    console.log('Adding category:', category);
    
    setNewCategory({ name: '', icon: '' });
    
    Swal.fire({
      icon: 'success',
      title: 'Categoria adicionada!',
      text: 'A nova categoria foi criada com sucesso.',
      confirmButtonColor: '#2E7D32',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha o nome e selecione a categoria.',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    const subcategory: Subcategory = {
      id: uuidv4(),
      name: newSubcategory.name,
      categoryId: newSubcategory.categoryId
    };

    // Here you would save the subcategory using dataService
    console.log('Adding subcategory:', subcategory);
    
    setNewSubcategory({ name: '', categoryId: '' });
    
    Swal.fire({
      icon: 'success',
      title: 'Subcategoria adicionada!',
      text: 'A nova subcategoria foi criada com sucesso.',
      confirmButtonColor: '#2E7D32',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita. Todas as subcategorias também serão removidas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Here you would delete the category using dataService
        console.log('Deleting category:', categoryId);
        
        Swal.fire({
          icon: 'success',
          title: 'Categoria excluída!',
          text: 'A categoria foi removida com sucesso.',
          confirmButtonColor: '#2E7D32',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Administrativo 🛠️
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie categorias, instituições e monitore as atividades da plataforma.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Instituições</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInstitutions}</p>
                <p className="text-xs text-gray-500">{stats.verifiedInstitutions} verificadas</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                <p className="text-xs text-gray-500">{stats.deliveredDonations} entregues</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRatings}</p>
                <p className="text-xs text-gray-500">Média: {stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-xs text-gray-500">
                  {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategorias
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Management */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Adicionar Nova Categoria
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da categoria
                  </label>
                  <Input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Eletrônicos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone (emoji)
                  </label>
                  <Input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="📱"
                    maxLength={2}
                  />
                </div>
                
                <Button
                  onClick={handleAddCategory}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="mr-2" size={16} />
                  Adicionar Categoria
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Adicionar Subcategoria
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria pai
                  </label>
                  <select
                    value={newSubcategory.categoryId}
                    onChange={(e) => setNewSubcategory(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da subcategoria
                  </label>
                  <Input
                    type="text"
                    value={newSubcategory.name}
                    onChange={(e) => setNewSubcategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Smartphones"
                  />
                </div>
                
                <Button
                  onClick={handleAddSubcategory}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2" size={16} />
                  Adicionar Subcategoria
                </Button>
              </div>
            </Card>
          </div>

          {/* Categories List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Categorias Existentes
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {category.icon} {category.name}
                    </h4>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setEditingCategory(category)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  {category.subcategories.length > 0 && (
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 mb-2">Subcategorias:</p>
                      <div className="space-y-1">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">• {sub.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50 h-6 px-2"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Atividade Recente
          </h3>
          
          <div className="space-y-4">
            {donations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    Nova doação: {donation.category} - {donation.subcategory}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {donation.status} • {new Date(donation.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  donation.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  donation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {donation.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};