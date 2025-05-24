import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Successfully connected to the database');
    } catch (error) {
      logger.error('Failed to connect to the database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Successfully disconnected from the database');
    } catch (error) {
      logger.error('Failed to disconnect from the database:', error);
      throw error;
    }
  }
}

export const db = DatabaseService.getInstance(); 