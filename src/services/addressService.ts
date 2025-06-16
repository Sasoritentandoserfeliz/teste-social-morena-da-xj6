interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

class AddressService {
  async getAddressByZipCode(zipCode: string): Promise<ViaCEPResponse | null> {
    try {
      const cleanZipCode = zipCode.replace(/\D/g, '');
      
      if (cleanZipCode.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }
      
      const data: ViaCEPResponse = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return data;
    } catch (error) {
      console.error('Address service error:', error);
      throw error;
    }
  }

  formatZipCode(zipCode: string): string {
    const clean = zipCode.replace(/\D/g, '');
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    
    if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

export const addressService = new AddressService();