import { v4 as uuidv4 } from 'uuid';
import { Institution, Donation, Category, Rating, Subcategory } from '../types';

class DataService {
  private readonly INSTITUTIONS_KEY = 'benigna_institutions';
  private readonly DONATIONS_KEY = 'benigna_donations';
  private readonly CATEGORIES_KEY = 'benigna_categories';
  private readonly RATINGS_KEY = 'benigna_ratings';

  // Institutions
  getInstitutions(): Institution[] {
    try {
      const data = localStorage.getItem(this.INSTITUTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting institutions:', error);
      return [];
    }
  }

  saveInstitution(institution: Institution): void {
    const institutions = this.getInstitutions();
    const existingIndex = institutions.findIndex(inst => inst.id === institution.id);
    
    if (existingIndex !== -1) {
      institutions[existingIndex] = institution;
    } else {
      institutions.push(institution);
    }
    
    localStorage.setItem(this.INSTITUTIONS_KEY, JSON.stringify(institutions));
  }

  getInstitutionById(id: string): Institution | null {
    const institutions = this.getInstitutions();
    return institutions.find(inst => inst.id === id) || null;
  }

  // Donations
  getDonations(): Donation[] {
    try {
      const data = localStorage.getItem(this.DONATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting donations:', error);
      return [];
    }
  }

  saveDonation(donation: Donation): void {
    const donations = this.getDonations();
    const existingIndex = donations.findIndex(don => don.id === donation.id);
    
    if (existingIndex !== -1) {
      donations[existingIndex] = donation;
    } else {
      donations.push(donation);
    }
    
    localStorage.setItem(this.DONATIONS_KEY, JSON.stringify(donations));
  }

  getDonationById(id: string): Donation | null {
    const donations = this.getDonations();
    return donations.find(don => don.id === id) || null;
  }

  getDonationsByDonor(donorId: string): Donation[] {
    const donations = this.getDonations();
    return donations.filter(don => don.donorId === donorId);
  }

  getDonationsByInstitution(institutionId: string): Donation[] {
    const donations = this.getDonations();
    return donations.filter(don => don.institutionId === institutionId);
  }

  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(this.CATEGORIES_KEY);
      return data ? JSON.parse(data) : this.getDefaultCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      return this.getDefaultCategories();
    }
  }

  saveCategory(category: Category): void {
    const categories = this.getCategories();
    const existingIndex = categories.findIndex(cat => cat.id === category.id);
    
    if (existingIndex !== -1) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  private getDefaultCategories(): Category[] {
    const defaultCategories: Category[] = [
      {
        id: uuidv4(),
        name: 'Roupas',
        icon: '👕',
        subcategories: [
          { id: uuidv4(), name: 'Roupas Infantis', categoryId: '' },
          { id: uuidv4(), name: 'Roupas Adultas', categoryId: '' },
          { id: uuidv4(), name: 'Roupas de Frio', categoryId: '' },
          { id: uuidv4(), name: 'Calçados', categoryId: '' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Alimentos',
        icon: '🍞',
        subcategories: [
          { id: uuidv4(), name: 'Alimentos Não Perecíveis', categoryId: '' },
          { id: uuidv4(), name: 'Cestas Básicas', categoryId: '' },
          { id: uuidv4(), name: 'Produtos de Higiene', categoryId: '' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Móveis',
        icon: '🪑',
        subcategories: [
          { id: uuidv4(), name: 'Móveis Pequenos', categoryId: '' },
          { id: uuidv4(), name: 'Móveis Grandes', categoryId: '' },
          { id: uuidv4(), name: 'Eletrodomésticos', categoryId: '' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Livros e Material Escolar',
        icon: '📚',
        subcategories: [
          { id: uuidv4(), name: 'Livros Didáticos', categoryId: '' },
          { id: uuidv4(), name: 'Material Escolar', categoryId: '' },
          { id: uuidv4(), name: 'Brinquedos Educativos', categoryId: '' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Brinquedos',
        icon: '🧸',
        subcategories: [
          { id: uuidv4(), name: 'Brinquedos Infantis', categoryId: '' },
          { id: uuidv4(), name: 'Jogos', categoryId: '' },
          { id: uuidv4(), name: 'Brinquedos Educativos', categoryId: '' }
        ]
      }
    ];

    // Set category IDs for subcategories
    defaultCategories.forEach(category => {
      category.subcategories.forEach(sub => {
        sub.categoryId = category.id;
      });
    });

    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  }

  // Ratings
  getRatings(): Rating[] {
    try {
      const data = localStorage.getItem(this.RATINGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting ratings:', error);
      return [];
    }
  }

  saveRating(rating: Rating): void {
    const ratings = this.getRatings();
    const existingIndex = ratings.findIndex(rat => rat.id === rating.id);
    
    if (existingIndex !== -1) {
      ratings[existingIndex] = rating;
    } else {
      ratings.push(rating);
    }
    
    localStorage.setItem(this.RATINGS_KEY, JSON.stringify(ratings));
  }

  getRatingsByInstitution(institutionId: string): Rating[] {
    const ratings = this.getRatings();
    return ratings.filter(rating => rating.institutionId === institutionId);
  }

  // Initialize sample data
  initializeSampleData(): void {
    const institutions = this.getInstitutions();
    if (institutions.length === 0) {
      this.createSampleInstitutions();
    }
  }

  private createSampleInstitutions(): void {
    const sampleInstitutions: Institution[] = [
      {
        id: uuidv4(),
        name: 'Casa de Apoio São Francisco',
        email: 'contato@casasaofrancisco.org',
        password: '',
        phone: '(11) 3456-7890',
        cnpj: '12.345.678/0001-90',
        type: 'institution',
        description: 'Instituição dedicada ao apoio de famílias em situação de vulnerabilidade social, oferecendo assistência alimentar, educacional e de saúde.',
        address: {
          id: uuidv4(),
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          latitude: -23.5505,
          longitude: -46.6333
        },
        workingHours: [
          { dayOfWeek: 0, isOpen: false, openTime: '', closeTime: '' },
          { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '12:00' }
        ],
        acceptedCategories: ['Roupas', 'Alimentos', 'Brinquedos'],
        rating: 4.5,
        totalRatings: 23,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'ONG Esperança',
        email: 'contato@ongesperanca.org',
        password: '',
        phone: '(11) 2345-6789',
        cnpj: '23.456.789/0001-01',
        type: 'institution',
        description: 'Organização não governamental focada na educação e desenvolvimento de crianças e adolescentes em comunidades carentes.',
        address: {
          id: uuidv4(),
          street: 'Avenida da Esperança',
          number: '456',
          neighborhood: 'Vila Nova',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '02345-678',
          latitude: -23.5489,
          longitude: -46.6388
        },
        workingHours: [
          { dayOfWeek: 0, isOpen: false, openTime: '', closeTime: '' },
          { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 6, isOpen: false, openTime: '', closeTime: '' }
        ],
        acceptedCategories: ['Livros e Material Escolar', 'Brinquedos', 'Roupas'],
        rating: 4.8,
        totalRatings: 15,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    localStorage.setItem(this.INSTITUTIONS_KEY, JSON.stringify(sampleInstitutions));
  }
}

export const dataService = new DataService();