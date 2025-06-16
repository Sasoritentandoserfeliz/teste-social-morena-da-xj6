class FileService {
  private readonly BASE_PATH = 'benigna_files';

  async saveImage(file: File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${this.BASE_PATH}/${folder}/${fileName}`;
          
          // Save to localStorage with base64 data
          const fileData = {
            name: fileName,
            data: result,
            type: file.type,
            size: file.size,
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem(filePath, JSON.stringify(fileData));
          resolve(filePath);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  getImage(filePath: string): string | null {
    try {
      const fileDataJson = localStorage.getItem(filePath);
      if (!fileDataJson) return null;
      
      const fileData = JSON.parse(fileDataJson);
      return fileData.data;
    } catch (error) {
      console.error('Error getting image:', error);
      return null;
    }
  }

  deleteImage(filePath: string): boolean {
    try {
      localStorage.removeItem(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Create folder structure in localStorage
  createFolder(folderPath: string): void {
    const fullPath = `${this.BASE_PATH}/${folderPath}`;
    localStorage.setItem(`${fullPath}/.folder`, JSON.stringify({ created: new Date().toISOString() }));
  }

  // List files in folder
  listFiles(folder: string): string[] {
    const prefix = `${this.BASE_PATH}/${folder}/`;
    const files: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && !key.endsWith('/.folder')) {
        files.push(key);
      }
    }
    
    return files;
  }

  // Initialize folder structure
  initializeFolders(): void {
    const folders = [
      'profiles',
      'institutions',
      'donations',
      'temp'
    ];
    
    folders.forEach(folder => {
      this.createFolder(folder);
    });
  }
}

export const fileService = new FileService();