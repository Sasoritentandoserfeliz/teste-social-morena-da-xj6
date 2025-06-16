import { User } from '../types';
import { storageService } from './storageService';

class AuthService {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const user = await storageService.getUserByEmail(email);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (user.password !== password) {
        throw new Error('Senha incorreta');
      }

      // Save session
      await storageService.saveSession(user.id);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: Partial<User>): Promise<User | null> {
    try {
      const newUser: User = {
        id: this.generateId(),
        name: userData.name || '',
        email: userData.email || '',
        password: userData.password || '',
        phone: userData.phone || '',
        type: userData.type || 'donor',
        profileImage: userData.profileImage || '',
        cpf: userData.cpf,
        cnpj: userData.cnpj,
        description: userData.description,
        address: userData.address,
        workingHours: userData.workingHours || [],
        acceptedCategories: userData.acceptedCategories || [],
        rating: userData.rating || 0,
        totalRatings: userData.totalRatings || 0,
        verified: userData.verified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storageService.saveUser(newUser);
      await storageService.saveSession(newUser.id);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const session = await storageService.getSession();
      
      if (!session || !session.userId) {
        return null;
      }

      const user = await storageService.getUserById(session.userId);
      return user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateUser(userData: User): Promise<void> {
    try {
      const updatedUser = {
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      await storageService.updateUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  logout(): void {
    storageService.clearSession();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const authService = new AuthService();