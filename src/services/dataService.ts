import { User, Donation, Delivery } from '../types';
import { storageService } from './storageService';

class DataService {
  // Users
  async getUsers(): Promise<User[]> {
    return await storageService.getUsers();
  }

  async getInstitutions(): Promise<User[]> {
    const users = await storageService.getUsers();
    return users.filter(user => user.type === 'institution');
  }

  async getDonors(): Promise<User[]> {
    const users = await storageService.getUsers();
    return users.filter(user => user.type === 'donor');
  }

  async getUserById(id: string): Promise<User | null> {
    return await storageService.getUserById(id);
  }

  async updateUser(user: User): Promise<void> {
    await storageService.updateUser(user);
  }

  // Donations
  async createDonation(donation: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Donation> {
    const newDonation: Donation = {
      ...donation,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storageService.saveDonation(newDonation);
    return newDonation;
  }

  async getDonations(): Promise<Donation[]> {
    return await storageService.getDonations();
  }

  async getDonationById(id: string): Promise<Donation | null> {
    return await storageService.getDonationById(id);
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    const donations = await storageService.getDonations();
    return donations.filter(donation => donation.donorId === donorId);
  }

  async getDonationsByInstitution(institutionId: string): Promise<Donation[]> {
    const donations = await storageService.getDonations();
    return donations.filter(donation => donation.institutionId === institutionId);
  }

  async getAvailableDonations(): Promise<Donation[]> {
    const donations = await storageService.getDonations();
    return donations.filter(donation => donation.status === 'available');
  }

  async updateDonation(donation: Donation): Promise<void> {
    const updatedDonation = {
      ...donation,
      updatedAt: new Date().toISOString()
    };
    await storageService.updateDonation(updatedDonation);
  }

  async deleteDonation(id: string): Promise<void> {
    await storageService.deleteDonation(id);
  }

  // Deliveries
  async createDelivery(delivery: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Delivery> {
    const newDelivery: Delivery = {
      ...delivery,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storageService.saveDelivery(newDelivery);
    return newDelivery;
  }

  async getDeliveries(): Promise<Delivery[]> {
    return await storageService.getDeliveries();
  }

  async getDeliveriesByDonation(donationId: string): Promise<Delivery[]> {
    const deliveries = await storageService.getDeliveries();
    return deliveries.filter(delivery => delivery.donationId === donationId);
  }

  async updateDelivery(delivery: Delivery): Promise<void> {
    const updatedDelivery = {
      ...delivery,
      updatedAt: new Date().toISOString()
    };
    await storageService.updateDelivery(updatedDelivery);
  }

  // Statistics
  async getStatistics() {
    const [users, donations, deliveries] = await Promise.all([
      this.getUsers(),
      this.getDonations(),
      this.getDeliveries()
    ]);

    const institutions = users.filter(user => user.type === 'institution');
    const donors = users.filter(user => user.type === 'donor');
    const completedDeliveries = deliveries.filter(delivery => delivery.status === 'completed');

    return {
      totalUsers: users.length,
      totalInstitutions: institutions.length,
      totalDonors: donors.length,
      totalDonations: donations.length,
      availableDonations: donations.filter(d => d.status === 'available').length,
      reservedDonations: donations.filter(d => d.status === 'reserved').length,
      completedDonations: donations.filter(d => d.status === 'completed').length,
      totalDeliveries: deliveries.length,
      completedDeliveries: completedDeliveries.length,
      pendingDeliveries: deliveries.filter(d => d.status === 'pending').length
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const dataService = new DataService();