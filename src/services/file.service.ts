import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export class FileService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private readonly allowedTypes: Record<string, string[]> = {
    id: ['.jpg', '.jpeg', '.png', '.pdf'],
    photo: ['.jpg', '.jpeg', '.png'],
    education: ['.pdf', '.doc', '.docx'],
    experience: ['.pdf', '.doc', '.docx'],
    payment: ['.jpg', '.jpeg', '.png', '.pdf'],
  };

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        logger.info('Created upload directory:', this.uploadDir);
      }
    } catch (error) {
      logger.error('Error creating upload directory:', error);
      throw new Error('Failed to create upload directory');
    }
  }

  private validateFile(
    fileBuffer: Buffer,
    fileName: string,
    type: 'id' | 'photo' | 'education' | 'experience' | 'payment',
  ): void {
    // Check file size
    if (fileBuffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file extension
    const ext = path.extname(fileName).toLowerCase();
    if (!this.allowedTypes[type].includes(ext)) {
      throw new Error(
        `Invalid file type. Allowed types for ${type}: ${this.allowedTypes[type].join(', ')}`,
      );
    }
  }

  async saveFile(
    fileBuffer: Buffer,
    fileName: string,
    type: 'id' | 'photo' | 'education' | 'experience' | 'payment',
  ): Promise<string> {
    try {
      // Validate file
      this.validateFile(fileBuffer, fileName, type);

      const timestamp = new Date().getTime();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = path.join(this.uploadDir, `${type}_${timestamp}_${sanitizedFileName}`);

      await fs.promises.writeFile(filePath, fileBuffer);
      logger.info('File saved successfully:', {
        path: filePath,
        size: fileBuffer.length,
        type,
        originalName: fileName,
      });

      return filePath;
    } catch (error) {
      logger.error('Error saving file:', {
        error,
        fileName,
        type,
        size: fileBuffer.length,
      });
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info('File deleted successfully:', filePath);
      }
    } catch (error) {
      logger.error('Error deleting file:', {
        error,
        path: filePath,
      });
      throw new Error('Failed to delete file');
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      return await fs.promises.readFile(filePath);
    } catch (error) {
      logger.error('Error reading file:', {
        error,
        path: filePath,
      });
      throw new Error('Failed to read file');
    }
  }
}
