export interface User {
  id: number;
  telegramId: bigint;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female';
  phoneNumber: string;
  email: string;
  presentAddress: string;
  maritalStatus: string;
  height: number;
  weight: number;
  faceColor: string;
  talentCategories: string[];
  preferredLanguage: string;
  registrationFee: number;
  isPaid: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: number;
  userId: number;
  courses: string[];
  onlineTraining: string[];
  trainingFee: number;
  isPaid: boolean;
  paymentMethod?: 'CBE' | 'Abissnya Bank' | 'Telebirr';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: number;
  userId: number;
  coverLetter: string;
  nationalIdPath: string;
  photoPath: string;
  age: number;
  contactPhone: string;
  contactEmail: string;
  telegramUsername: string;
  educationDocPath: string;
  experienceDocPath: string;
  socialMediaLinks: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: number;
  userId: number;
  notifications: boolean;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  userId: number;
  text: string;
  type: 'text' | 'photo' | 'document';
  createdAt: Date;
}
