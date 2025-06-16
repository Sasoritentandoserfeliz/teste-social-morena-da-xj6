import { ValidationResult } from '../types';

class ValidationService {
  validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { isValid: false, message: 'Email é obrigatório' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Email inválido' };
    }
    
    return { isValid: true, message: 'Email válido' };
  }

  validatePassword(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Senha deve conter pelo menos um número' };
    }
    
    return { isValid: true, message: 'Senha válida' };
  }

  validateCPF(cpf: string): ValidationResult {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (!cleanCPF) {
      return { isValid: false, message: 'CPF é obrigatório' };
    }
    
    if (cleanCPF.length !== 11) {
      return { isValid: false, message: 'CPF deve ter 11 dígitos' };
    }
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return { isValid: false, message: 'CPF inválido' };
    }
    
    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) {
      return { isValid: false, message: 'CPF inválido' };
    }
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) {
      return { isValid: false, message: 'CPF inválido' };
    }
    
    return { isValid: true, message: 'CPF válido' };
  }

  validateCNPJ(cnpj: string): ValidationResult {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (!cleanCNPJ) {
      return { isValid: false, message: 'CNPJ é obrigatório' };
    }
    
    if (cleanCNPJ.length !== 14) {
      return { isValid: false, message: 'CNPJ deve ter 14 dígitos' };
    }
    
    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      return { isValid: false, message: 'CNPJ inválido' };
    }
    
    // Validate CNPJ algorithm
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(cleanCNPJ.charAt(12))) {
      return { isValid: false, message: 'CNPJ inválido' };
    }
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit2 !== parseInt(cleanCNPJ.charAt(13))) {
      return { isValid: false, message: 'CNPJ inválido' };
    }
    
    return { isValid: true, message: 'CNPJ válido' };
  }

  validatePhone(phone: string): ValidationResult {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone) {
      return { isValid: false, message: 'Telefone é obrigatório' };
    }
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return { isValid: false, message: 'Telefone deve ter 10 ou 11 dígitos' };
    }
    
    return { isValid: true, message: 'Telefone válido' };
  }

  validateZipCode(zipCode: string): ValidationResult {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    if (!cleanZipCode) {
      return { isValid: false, message: 'CEP é obrigatório' };
    }
    
    if (cleanZipCode.length !== 8) {
      return { isValid: false, message: 'CEP deve ter 8 dígitos' };
    }
    
    return { isValid: true, message: 'CEP válido' };
  }

  validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, message: `${fieldName} é obrigatório` };
    }
    
    return { isValid: true, message: `${fieldName} válido` };
  }

  validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
    if (value.length < minLength) {
      return { isValid: false, message: `${fieldName} deve ter pelo menos ${minLength} caracteres` };
    }
    
    return { isValid: true, message: `${fieldName} válido` };
  }

  validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
    if (value.length > maxLength) {
      return { isValid: false, message: `${fieldName} deve ter no máximo ${maxLength} caracteres` };
    }
    
    return { isValid: true, message: `${fieldName} válido` };
  }
}

export const validationService = new ValidationService();