import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Institution, Donation, Category, Rating } from '../types';
import { dataService } from '../services/dataService';

interface DataContextType {
  institutions: Institution[];
  donations: Donation[];
  categories: Category[];
  ratings: Rating[];
  refreshData: () => void;
  addInstitution: (institution: Institution) => void;
  updateInstitution: (institution: Institution) => void;
  addDonation: (donation: Donation) => void;
  updateDonation: (donation: Donation) => void;
  addRating: (rating: Rating) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setInstitutions(dataService.getInstitutions());
    setDonations(dataService.getDonations());
    setCategories(dataService.getCategories());
    setRatings(dataService.getRatings());
  };

  const addInstitution = (institution: Institution) => {
    dataService.saveInstitution(institution);
    setInstitutions(prev => [...prev, institution]);
  };

  const updateInstitution = (institution: Institution) => {
    dataService.saveInstitution(institution);
    setInstitutions(prev => prev.map(inst => inst.id === institution.id ? institution : inst));
  };

  const addDonation = (donation: Donation) => {
    dataService.saveDonation(donation);
    setDonations(prev => [...prev, donation]);
  };

  const updateDonation = (donation: Donation) => {
    dataService.saveDonation(donation);
    setDonations(prev => prev.map(don => don.id === donation.id ? donation : don));
  };

  const addRating = (rating: Rating) => {
    dataService.saveRating(rating);
    setRatings(prev => [...prev, rating]);
    
    // Update institution rating
    const institution = institutions.find(inst => inst.id === rating.institutionId);
    if (institution) {
      const institutionRatings = [...ratings, rating].filter(r => r.institutionId === rating.institutionId);
      const avgRating = institutionRatings.reduce((sum, r) => sum + r.rating, 0) / institutionRatings.length;
      
      const updatedInstitution = {
        ...institution,
        rating: avgRating,
        totalRatings: institutionRatings.length
      };
      
      updateInstitution(updatedInstitution);
    }
  };

  const value = {
    institutions,
    donations,
    categories,
    ratings,
    refreshData,
    addInstitution,
    updateInstitution,
    addDonation,
    updateDonation,
    addRating
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};