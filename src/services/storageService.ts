// File-based storage service for local data persistence
class StorageService {
  private basePath = '/home/project/data';

  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      // In a real Node.js environment, you would use fs.mkdir
      // For now, we'll simulate directory creation
      console.log(`Ensuring directory exists: ${path}`);
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  private async writeFile(filePath: string, data: any): Promise<void> {
    try {
      // In a real Node.js environment, you would use fs.writeFile
      // For browser environment, we'll use localStorage as fallback but with better structure
      const key = filePath.replace(this.basePath + '/', '');
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Data saved to: ${filePath}`);
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  private async readFile(filePath: string): Promise<any> {
    try {
      // In a real Node.js environment, you would use fs.readFile
      // For browser environment, we'll use localStorage as fallback
      const key = filePath.replace(this.basePath + '/', '');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const key = filePath.replace(this.basePath + '/', '');
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }

  // Users storage
  async saveUser(user: any): Promise<void> {
    await this.ensureDirectoryExists(`${this.basePath}/users`);
    
    // Check if user already exists
    const existingUsers = await this.getUsers();
    const existingUser = existingUsers.find((u: any) => 
      u.email === user.email || 
      (user.cpf && u.cpf === user.cpf) || 
      (user.cnpj && u.cnpj === user.cnpj)
    );

    if (existingUser) {
      if (existingUser.email === user.email) {
        throw new Error('Email já cadastrado');
      }
      if (user.cpf && existingUser.cpf === user.cpf) {
        throw new Error('CPF já cadastrado');
      }
      if (user.cnpj && existingUser.cnpj === user.cnpj) {
        throw new Error('CNPJ já cadastrado');
      }
    }

    const users = existingUsers.filter((u: any) => u.id !== user.id);
    users.push(user);
    
    await this.writeFile(`${this.basePath}/users/users.json`, users);
  }

  async getUsers(): Promise<any[]> {
    const users = await this.readFile(`${this.basePath}/users/users.json`);
    return users || [];
  }

  async getUserById(id: string): Promise<any> {
    const users = await this.getUsers();
    return users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<any> {
    const users = await this.getUsers();
    return users.find(user => user.email === email);
  }

  async updateUser(user: any): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      await this.writeFile(`${this.basePath}/users/users.json`, users);
    }
  }

  // Donations storage
  async saveDonation(donation: any): Promise<void> {
    await this.ensureDirectoryExists(`${this.basePath}/donations`);
    
    const donations = await this.getDonations();
    donations.push(donation);
    
    await this.writeFile(`${this.basePath}/donations/donations.json`, donations);
  }

  async getDonations(): Promise<any[]> {
    const donations = await this.readFile(`${this.basePath}/donations/donations.json`);
    return donations || [];
  }

  async getDonationById(id: string): Promise<any> {
    const donations = await this.getDonations();
    return donations.find(donation => donation.id === id);
  }

  async updateDonation(donation: any): Promise<void> {
    const donations = await this.getDonations();
    const index = donations.findIndex(d => d.id === donation.id);
    if (index !== -1) {
      donations[index] = donation;
      await this.writeFile(`${this.basePath}/donations/donations.json`, donations);
    }
  }

  async deleteDonation(id: string): Promise<void> {
    const donations = await this.getDonations();
    const filteredDonations = donations.filter(d => d.id !== id);
    await this.writeFile(`${this.basePath}/donations/donations.json`, filteredDonations);
  }

  // Deliveries storage
  async saveDelivery(delivery: any): Promise<void> {
    await this.ensureDirectoryExists(`${this.basePath}/deliveries`);
    
    const deliveries = await this.getDeliveries();
    deliveries.push(delivery);
    
    await this.writeFile(`${this.basePath}/deliveries/deliveries.json`, deliveries);
  }

  async getDeliveries(): Promise<any[]> {
    const deliveries = await this.readFile(`${this.basePath}/deliveries/deliveries.json`);
    return deliveries || [];
  }

  async updateDelivery(delivery: any): Promise<void> {
    const deliveries = await this.getDeliveries();
    const index = deliveries.findIndex(d => d.id === delivery.id);
    if (index !== -1) {
      deliveries[index] = delivery;
      await this.writeFile(`${this.basePath}/deliveries/deliveries.json`, deliveries);
    }
  }

  // Session storage
  async saveSession(userId: string): Promise<void> {
    await this.ensureDirectoryExists(`${this.basePath}/sessions`);
    const session = { userId, timestamp: Date.now() };
    await this.writeFile(`${this.basePath}/sessions/current.json`, session);
  }

  async getSession(): Promise<any> {
    return await this.readFile(`${this.basePath}/sessions/current.json`);
  }

  async clearSession(): Promise<void> {
    await this.ensureDirectoryExists(`${this.basePath}/sessions`);
    await this.writeFile(`${this.basePath}/sessions/current.json`, null);
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    localStorage.clear();
    console.log('All data cleared');
  }
}

export const storageService = new StorageService();