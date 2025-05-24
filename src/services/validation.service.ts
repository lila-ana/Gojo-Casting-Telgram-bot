export class ValidationService {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  }

  validateDateOfBirth(date: Date): boolean {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 18 && age <= 100;
  }

  validateHeight(height: number): boolean {
    // Convert meters to centimeters (e.g., 1.63m -> 163cm)
    const heightInCm = height * 100;
    return heightInCm >= 100 && heightInCm <= 250; // 1.00m to 2.50m
  }

  validateWeight(weight: number): boolean {
    return weight >= 30 && weight <= 200; // 30kg to 200kg
  }

  validateTalentCategories(categories: string[]): boolean {
    const validCategories = [
      'Director',
      'Assistant Director',
      'Screenwriter/Scriptwriter',
      'Lead Actors',
      'Supporting Actors',
      'Cinematographer/Director of Photography',
      'Camera Operator',
      'Production Designer',
      'Art Director',
      'Set Designer',
      'Costume Designer',
      'Makeup Artist',
      'Hair Stylist',
      'Sound Designer',
      'Sound Mixer',
      'Boom Operator',
      'Composer',
      'Film Editor',
      'Visual Effects (VFX) Artist',
      'Best Boy (Lighting Assistant)',
      'Lighting Technician',
      'Location Manager',
      'Unit Production Manager',
      'Casting Director',
      'Stunt Coordinator',
      'Special Effects Supervisor',
      'Script Supervisor',
      'Production Assistant',
    ];

    return categories.every((category) => validCategories.includes(category));
  }

  validateTrainingCourses(courses: string[]): boolean {
    const validCourses = ['Acting', 'Cinematography', 'Directing'];
    return courses.every((course) => validCourses.includes(course));
  }

  validateOnlineTraining(trainings: string[]): boolean {
    const validTrainings = ['Scriptwriting', 'Screenplay'];
    return trainings.every((training) => validTrainings.includes(training));
  }

  validatePaymentMethod(method: string): boolean {
    const validMethods = ['CBE', 'Abissnya Bank', 'Telebirr'];
    return validMethods.includes(method);
  }

  validateAge(age: number): boolean {
    return age >= 18 && age <= 100;
  }

  validateSocialMediaLinks(links: string[]): boolean {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return links.every((link) => urlRegex.test(link));
  }

  validateRegistrationData(data: {
    fullName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    email: string;
    presentAddress: string;
    maritalStatus: string;
    height: number;
    weight: number;
    faceColor: string;
    talentCategories: string[];
    preferredLanguage: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.fullName || data.fullName.length < 2) {
      errors.push('Full name is required and must be at least 2 characters long');
    }

    if (!this.validateDateOfBirth(data.dateOfBirth)) {
      errors.push('Invalid date of birth. Must be at least 18 years old');
    }

    if (!['Male', 'Female'].includes(data.gender)) {
      errors.push('Gender must be either Male or Female');
    }

    if (!this.validatePhoneNumber(data.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    if (!this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.presentAddress || data.presentAddress.length < 5) {
      errors.push('Present address is required and must be at least 5 characters long');
    }

    if (!data.maritalStatus) {
      errors.push('Marital status is required');
    }

    if (!this.validateHeight(data.height)) {
      errors.push('Invalid height. Must be between 1.00m and 2.50m');
    }

    if (!this.validateWeight(data.weight)) {
      errors.push('Invalid weight. Must be between 30kg and 200kg');
    }

    if (!data.faceColor) {
      errors.push('Face color is required');
    }

    if (!this.validateTalentCategories(data.talentCategories)) {
      errors.push('Invalid talent categories selected');
    }

    if (!data.preferredLanguage) {
      errors.push('Preferred language is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateGender(gender: string): boolean {
    const validGenders = ['male', 'female', 'other'];
    return validGenders.includes(gender.toLowerCase());
  }

  validateMaritalStatus(status: string): boolean {
    const validStatuses = ['single', 'married', 'divorced', 'widowed'];
    return validStatuses.includes(status.toLowerCase());
  }

  validateTalentCategory(category: string): boolean {
    const validCategories = [
      'Director',
      'Assistant Director',
      'Screenwriter/Scriptwriter',
      'Lead Actors',
      'Supporting Actors',
      'Cinematographer/Director of Photography',
      'Camera Operator',
      'Production Designer',
      'Art Director',
      'Set Designer',
      'Costume Designer',
      'Makeup Artist',
      'Hair Stylist',
      'Sound Designer',
      'Sound Mixer',
      'Boom Operator',
      'Composer',
      'Film Editor',
      'Visual Effects (VFX) Artist',
      'Best Boy (Lighting Assistant)',
      'Lighting Technician',
      'Location Manager',
      'Unit Production Manager',
      'Casting Director',
      'Stunt Coordinator',
      'Special Effects Supervisor',
      'Script Supervisor',
      'Production Assistant',
    ];
    return validCategories.some(
      (validCategory) => validCategory.toLowerCase() === category.toLowerCase(),
    );
  }

  validateLanguage(language: string): boolean {
    const validLanguages = ['english', 'amharic'];
    return validLanguages.includes(language.toLowerCase());
  }

  validateTrainingType(type: string): boolean {
    const validTypes = ['basic', 'advanced', 'professional'];
    return validTypes.includes(type.toLowerCase());
  }

  validateExperience(experience: string): boolean {
    const validExperiences = ['beginner', 'intermediate', 'advanced'];
    return validExperiences.includes(experience.toLowerCase());
  }

  validateSchedule(schedule: string): boolean {
    const validSchedules = ['morning', 'afternoon', 'evening', 'weekend'];
    return validSchedules.includes(schedule.toLowerCase());
  }
}
