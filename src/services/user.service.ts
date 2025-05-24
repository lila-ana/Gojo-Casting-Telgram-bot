import { db } from './database';
import { User, Registration, Training, JobApplication } from '@prisma/client';
import { logger } from '../utils/logger';

export class UserService {
  private prisma = db.getPrisma();

  async createOrUpdateUser(telegramUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    is_bot?: boolean;
  }): Promise<User> {
    try {
      return await this.prisma.user.upsert({
        where: { telegramId: BigInt(telegramUser.id) },
        update: {
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          languageCode: telegramUser.language_code,
          isBot: telegramUser.is_bot || false,
        },
        create: {
          telegramId: BigInt(telegramUser.id),
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          languageCode: telegramUser.language_code,
          isBot: telegramUser.is_bot || false,
        },
      });
    } catch (error) {
      logger.error('Error creating/updating user:', error);
      throw error;
    }
  }

  async createRegistration(
    userId: string,
    data: Omit<Registration, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Registration> {
    try {
      const existingRegistration = await this.prisma.registration.findUnique({
        where: { userId },
      });

      if (existingRegistration) {
        throw new Error('A registration with this user ID already exists.');
      }

      return await this.prisma.registration.create({
        data: { userId, ...data },
      });
    } catch (error) {
      logger.error('Error creating registration:', error);
      throw error;
    }
  }

  async createTraining(
    userId: string,
    data: Omit<Training, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Training> {
    try {
      logger.info('Creating/updating training record:', { userId, data });

      return await this.prisma.training.upsert({
        where: { userId },
        update: {
          ...data,
        },
        create: {
          userId,
          ...data,
        },
      });
    } catch (error) {
      logger.error('Error in createTraining:', {
        userId,
        error,
        data,
      });
      throw error;
    }
  }

  async createJobApplication(
    userId: string,
    data: Omit<JobApplication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<JobApplication> {
    try {
      logger.info('Creating job application in database:', { userId, data });

      const jobApplication = await this.prisma.jobApplication.create({
        data: {
          userId,
          coverLetter: data.coverLetter,
          age: data.age,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          telegramUsername: data.telegramUsername,
          educationDocPath: data.educationDocPath,
          experienceDocPath: data.experienceDocPath,
          socialMediaLinks: data.socialMediaLinks || [],
          status: 'pending',
        },
      });

      logger.info('Job application created successfully:', { id: jobApplication.id });
      return jobApplication;
    } catch (error) {
      logger.error('Error creating job application:', error);
      throw error;
    }
  }

  async getUserWithDetails(telegramId: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
        include: {
          registration: true,
          training: true,
          jobApplications: true,
        },
      });
    } catch (error) {
      logger.error('Error getting user details:', error);
      throw error;
    }
  }

  async updateRegistrationPayment(userId: string, isPaid: boolean): Promise<Registration> {
    return this.prisma.registration.update({
      where: { userId },
      data: { isPaid },
    });
  }

  async submitPaymentProof(
    userId: string,
    paymentMethod: string,
    paymentProof: string,
  ): Promise<Registration> {
    return this.prisma.registration.update({
      where: { userId },
      data: {
        paymentMethod,
        paymentProof,
        paymentStatus: 'pending',
        isPaid: false,
      },
    });
  }

  async updateTrainingPayment(
    userId: string,
    isPaid: boolean,
    paymentMethod?: string,
  ): Promise<Training> {
    return this.prisma.training.update({
      where: { userId },
      data: { isPaid, paymentMethod },
    });
  }

  async updateJobApplicationStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<JobApplication> {
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status },
    });
  }

  async updateRegistrationStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
  ): Promise<Registration> {
    return this.prisma.registration.update({
      where: { id },
      data: { status: status.toLowerCase() },
    });
  }

  async updateTrainingStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Training> {
    return this.prisma.training.update({
      where: { id },
      data: { status: status.toLowerCase() },
    });
  }

  // Admin methods
  async getAllRegistrations() {
    return this.prisma.registration.findMany({
      include: { user: true },
    });
  }

  async getAllTrainingRegistrations() {
    return this.prisma.training.findMany({
      include: { user: true },
    });
  }

  async getAllJobApplications() {
    return this.prisma.jobApplication.findMany({
      include: { user: true },
    });
  }

  async getJobApplications(status?: string) {
    try {
      return await this.prisma.jobApplication.findMany({
        where: status ? { status } : undefined,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error getting job applications:', error);
      throw error;
    }
  }

  async getPendingPayments() {
    return this.prisma.registration.findMany({
      where: {
        paymentStatus: 'pending',
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async approvePayment(registrationId: string) {
    return this.prisma.registration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'approved',
        isPaid: true,
        status: 'approved',
      },
    });
  }

  async rejectPayment(registrationId: string) {
    return this.prisma.registration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'rejected',
        isPaid: false,
        status: 'rejected',
      },
    });
  }

  async getRegistrationById(id: string) {
    return await this.prisma.registration.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async submitTrainingPaymentProof(
    userId: string,
    paymentMethod: 'ft' | 'receipt',
    fileId?: string,
  ): Promise<void> {
    const training = await this.prisma.training.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!training) {
      throw new Error('No training registration found for this user.');
    }

    await this.prisma.training.update({
      where: { id: training.id },
      data: {
        paymentMethod,
        paymentProof: fileId,
        paymentStatus: 'pending',
        isPaid: false,
      },
    });
  }

  // Add new methods for training payment management
  async getPendingTrainingPayments() {
    return this.prisma.training.findMany({
      where: {
        isPaid: false,
        paymentMethod: { not: null },
      },
      include: {
        user: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getTrainingById(id: string) {
    return await this.prisma.training.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async approveTrainingPayment(trainingId: string) {
    return this.prisma.training.update({
      where: { id: trainingId },
      data: {
        isPaid: true,
        paymentStatus: 'approved',
        status: 'approved',
      },
    });
  }

  async rejectTrainingPayment(trainingId: string) {
    return this.prisma.training.update({
      where: { id: trainingId },
      data: {
        isPaid: false,
        paymentStatus: 'rejected',
        status: 'rejected',
      },
    });
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
