import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { fileService } from './fileService';

class AuthService {
  private readonly STORAGE_KEY = 'benigna_users';
  private readonly CURRENT_USER_KEY = 'benigna_current_user';

  async register(userData: Partial<User>): Promise<User | null> {
    try {
      const users = this.getUsers();
      
      // Check if email already exists
      if (users.find(user => user.email === userData.email)) {
        throw new Error('Email já cadastrado');
      }

      // Check if CPF/CNPJ already exists
      if (userData.cpf && users.find(user => user.cpf === userData.cpf)) {
        throw new Error('CPF já cadastrado');
      }
      
      if (userData.cnpj && users.find(user => user.cnpj === userData.cnpj)) {
        throw new Error('CNPJ já cadastrado');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password!, 10);

      const newUser: User = {
        id: uuidv4(),
        name: userData.name!,
        email: userData.email!,
        password: hashedPassword,
        phone: userData.phone!,
        cpf: userData.cpf,
        cnpj: userData.cnpj,
        type: userData.type!,
        profileImage: userData.profileImage,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      users.push(newUser);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error('Email não encontrado');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Senha incorreta');
      }

      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  updateUser(user: User): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...user, updatedAt: new Date() };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
  }

  private getUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Initialize with sample data
  initializeSampleData(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      // Add sample admin user
      const sampleUsers: User[] = [
        {
          id: uuidv4(),
          name: 'Administrador',
          email: 'admin@benigna.com',
          password: bcrypt.hashSync('admin123', 10),
          phone: '(11) 99999-9999',
          type: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleUsers));
    }
  }
}

export const authService = new AuthService();