import { Context } from 'grammy';
import { UserService } from '../services/user.service';
import { FileService } from '../services/file.service';
import { ValidationService } from '../services/validation.service';
import { logger } from '../utils/logger';

const userService = new UserService();
const fileService = new FileService();
const validationService = new ValidationService();

type Language = 'en' | 'am';

interface JobState {
  step: number;
  data: any;
  language: Language;
}

interface Messages {
  welcome: string;
  selectLanguage: string;
  registrationRequired: string;
  coverLetter: string;
  age: string;
  invalidAge: string;
  contactPhone: string;
  invalidPhone: string;
  contactEmail: string;
  invalidEmail: string;
  telegramUsername: string;
  educationDoc: string;
  experienceDoc: string;
  socialMedia: string;
  invalidSocialMedia: string;
  success: string;
  error: string;
  invalidStep: string;
  startJob: string;
  userNotFound: string;
  fileError: string;
}

// Store job application state
(global as any).jobState = new Map<number, JobState>();

const messages: Record<Language, Messages> = {
  en: {
    welcome: 'Welcome to the job application process!',
    selectLanguage: 'Please select your preferred language:\n1. English\n2. አማርኛ',
    registrationRequired: 'Please complete your registration first using /register',
    coverLetter: 'Please write your cover letter:',
    age: 'Please enter your age:',
    invalidAge: 'Invalid age. Please enter an age between 18 and 100:',
    contactPhone: 'Please enter your contact phone number:',
    invalidPhone: 'Invalid phone number. Please enter a valid phone number:',
    contactEmail: 'Please enter your contact email:',
    invalidEmail: 'Invalid email. Please enter a valid email address:',
    telegramUsername: 'Please enter your Telegram username:',
    educationDoc: 'Please upload your educational document (PDF, DOC, or DOCX format):',
    experienceDoc: 'Please upload your work experience document:',
    socialMedia:
      'Please enter your social media links (comma-separated) or type "skip" to continue without them:\n' +
      'Example: https://linkedin.com/your-profile, https://instagram.com/your-profile\n' +
      'Note: Social media links are optional.',
    invalidSocialMedia:
      'Invalid social media links. Please enter valid URLs or type "skip" to continue without them.',
    success:
      'Job application submitted successfully!\n\n' +
      'We will review your application and contact you soon.\n' +
      'Thank you for your interest!',
    error: 'An error occurred. Please start over with /job',
    invalidStep: 'Invalid step. Please start over with /job',
    startJob: 'Please start the job application process with /job',
    userNotFound: 'User not found. Please start over with /register',
    fileError: 'Error processing your file. Please try again:',
  },
  am: {
    welcome: 'የስራ ማመልከቻ ሂደት ውስጥ እንኳን ደህና መጡ!',
    selectLanguage: 'እባክዎ ቋንቋዎን ይምረጡ:\n1. English\n2. አማርኛ',
    registrationRequired: 'እባክዎ በመጀመሪያ /register በመጠቀም ምዝገባዎን ያጠናቅቁ',
    coverLetter: 'እባክዎ የራስዎን ማጣቀሻ ደብዳበ ይጻፉ:',
    age: 'እባክዎ ዕድሜዎን ያስገቡ:',
    invalidAge: 'ልክ ያልሆነ ዕድሜ። እባክዎ ከ 18 እስከ 100 የሚሆን ዕድሜ ያስገቡ:',
    contactPhone: 'እባክዎ የስልክ ቁጥርዎን ያስገቡ:',
    invalidPhone: 'ልክ ያልሆነ የስልክ ቁጥር። እባክዎ ትክክለኛ የስልክ ቁጥር ያስገቡ:',
    contactEmail: 'እባክዎ የኢሜይል አድራሻዎን ያስገቡ:',
    invalidEmail: 'ልክ ያልሆነ ኢሜይል። እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ:',
    telegramUsername: 'እባክዎ የተሌግራም የተጠቃሚ ስምዎን ያስገቡ:',
    educationDoc: 'እባክዎ የትምህርት ሰነድዎን ያስገቡ (PDF, DOC, ወይም DOCX ቅርጸት):',
    experienceDoc: 'እባክዎ የስራ ልምድ ሰነድዎን ያስገቡ:',
    socialMedia:
      'እባክዎ የማህበራዊ ሚዲያ አገናኞችዎን ያስገቡ (በኮማ በማለያየት) ወይም ሳያስገቡ ለመቀጠል "skip" ይጻፉ:\n' +
      'ምሳሌ: https://linkedin.com/your-profile, https://instagram.com/your-profile\n' +
      'ማስታወሻ: የማህበራዊ ሚዲያ አገናኞች አማራጭ ናቸው።',
    invalidSocialMedia: 'ልክ ያልሆኑ የማህበራዊ ሚዲያ አገናኞች። እባክዎ ትክክለኛ URL ያስገቡ ወይም ሳያስገቡ ለመቀጠል "skip" ይጻፉ።',
    success:
      'የስራ ማመልከቻዎ በተሳካ ሁኔታ ተልኳል!\n\n' + 'ማመልከቻዎን ገምግመን በቅርቡ እናሳወቆታለን።\n' + 'ለፍላጎትዎ እናመሰግናለን!',
    error: 'ስህተት ተከስቷል። እባክዎ በ /job በመጠቀም እንደገና ይጀምሩ',
    invalidStep: 'ልክ ያልሆነ ደረጃ። እባክዎ በ /job በመጠቀም እንደገና ይጀምሩ',
    startJob: 'እባክዎ የስራ ማመልከቻ ሂደቱን በ /job በመጠቀም ይጀምሩ',
    userNotFound: 'ተጠቃሚ አልተገኘም። እባክዎ በ /register በመጠቀም እንደገና ይጀምሩ',
    fileError: 'ፋይልዎን በማስተናገድ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ:',
  },
};

export const startJobApplication = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  // Check if user is registered and has paid
  const user = await userService.getUserWithDetails(userId);
  if (!user?.registration) {
    await ctx.reply(messages.en.registrationRequired);
    return;
  }

  if (!user.registration.isPaid) {
    await ctx.reply(
      user.languageCode === 'am'
        ? 'እባክዎ የስራ ምዝገባ ከመጀመርዎ በፊት የምዝገባ ክፍያዎን ያጠናቁ።'
        : 'Please complete your registration payment before starting job registration.',
    );
    return;
  }

  // Initialize job state
  (global as any).jobState.set(userId, {
    step: 0, // Start with language selection
    data: {},
    language: 'en',
  });

  await ctx.reply(messages.en.selectLanguage);
};

export const handleJobStep = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = (global as any).jobState.get(userId) as JobState | undefined;
  if (!state) {
    await ctx.reply(messages.en.startJob);
    return;
  }

  try {
    switch (state.step) {
      case 0: // Language selection
        const langChoice = parseInt(ctx.message?.text?.trim() || '', 10);
        if (langChoice !== 1 && langChoice !== 2) {
          await ctx.reply(messages.en.selectLanguage);
          return;
        }
        state.language = langChoice === 1 ? 'en' : 'am';
        state.step = 1;
        await ctx.reply(messages[state.language].coverLetter);
        break;

      case 1: // Cover Letter
        if (!ctx.message?.text) {
          await ctx.reply(messages[state.language].coverLetter);
          return;
        }
        state.data.coverLetter = ctx.message.text;
        state.step++;
        await ctx.reply(messages[state.language].age);
        break;

      case 2: // Age
        const age = parseInt(ctx.message?.text || '');
        if (!validationService.validateAge(age)) {
          await ctx.reply(messages[state.language].invalidAge);
          return;
        }
        state.data.age = age;
        state.step++;
        await ctx.reply(messages[state.language].contactPhone);
        break;

      case 3: // Contact Phone
        if (!validationService.validatePhoneNumber(ctx.message?.text || '')) {
          await ctx.reply(messages[state.language].invalidPhone);
          return;
        }
        state.data.contactPhone = ctx.message?.text;
        state.step++;
        await ctx.reply(messages[state.language].contactEmail);
        break;

      case 4: // Contact Email
        if (!validationService.validateEmail(ctx.message?.text || '')) {
          await ctx.reply(messages[state.language].invalidEmail);
          return;
        }
        state.data.contactEmail = ctx.message?.text;
        state.step++;
        await ctx.reply(messages[state.language].telegramUsername);
        break;

      case 5: // Telegram Username
        state.data.telegramUsername = ctx.message?.text;
        state.step++;
        await ctx.reply(messages[state.language].educationDoc);
        break;

      case 6: // Educational Document
        if (!ctx.message?.document) {
          await ctx.reply(messages[state.language].educationDoc);
          return;
        }
        try {
          const fileId = ctx.message.document.file_id;
          const file = await ctx.api.getFile(fileId);
          const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch education document');
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          state.data.educationDocPath = await fileService.saveFile(
            buffer,
            ctx.message.document.file_name || 'education',
            'education',
          );
          state.step++;
          await ctx.reply(messages[state.language].experienceDoc);
        } catch (error) {
          logger.error('Error processing education document:', error);
          await ctx.reply(messages[state.language].fileError);
        }
        break;

      case 7: // Work Experience Document
        if (!ctx.message?.document) {
          await ctx.reply(messages[state.language].experienceDoc);
          return;
        }
        try {
          const fileId = ctx.message.document.file_id;
          const file = await ctx.api.getFile(fileId);
          const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch experience document');
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          state.data.experienceDocPath = await fileService.saveFile(
            buffer,
            ctx.message.document.file_name || 'experience',
            'experience',
          );
          state.step++;
          await ctx.reply(messages[state.language].socialMedia);
        } catch (error) {
          logger.error('Error processing experience document:', error);
          await ctx.reply(messages[state.language].fileError);
        }
        break;

      case 8: // Social Media Links
        if (!ctx.message?.text) {
          await ctx.reply(messages[state.language].socialMedia);
          return;
        }

        if (ctx.message.text.toLowerCase() === 'skip') {
          state.data.socialMediaLinks = [];
        } else {
          const links = ctx.message.text.split(',').map((link) => link.trim());
          if (links.length > 0 && !validationService.validateSocialMediaLinks(links)) {
            await ctx.reply(messages[state.language].invalidSocialMedia);
            return;
          }
          state.data.socialMediaLinks = links;
        }

        // Save job application data
        const existingUser = await userService.getUserWithDetails(userId);
        if (!existingUser) {
          await ctx.reply(messages[state.language].userNotFound);
          (global as any).jobState.delete(userId);
          return;
        }

        try {
          logger.info('Creating job application with data:', {
            userId: existingUser.id,
            data: state.data,
          });

          const jobApplication = await userService.createJobApplication(
            existingUser.id.toString(),
            state.data,
          );
          logger.info('Job application created successfully');

          // Get the latest job application
          const latestJobApplication = await userService
            .getJobApplications('pending')
            .then((apps) => apps[0]);
          if (!latestJobApplication) {
            throw new Error('No pending job application found');
          }

          // Clear job application state
          (global as any).jobState.delete(userId);
          await ctx.reply(messages[state.language].success);
        } catch (error: any) {
          logger.error('Error processing job application:', error);
          await ctx.reply(messages[state.language].error);
          (global as any).jobState.delete(userId);
        }
        break;

      case 12: // Preferred Language
        state.data.preferredLanguage = ctx.message?.text;

        // Validate all data
        const validation = validationService.validateRegistrationData(state.data);
        if (!validation.isValid) {
          await ctx.reply(`Validation errors:\n${validation.errors.join('\n')}`);
          (global as any).jobState.delete(userId);
          return;
        }

        // Save job data
        const newUser = await userService.createOrUpdateUser(ctx.from!);
        if (!newUser) {
          await ctx.reply(messages[state.language].error);
          (global as any).jobState.delete(userId);
          return;
        }

        logger.info('User created or updated:', { userId: newUser.id });

        const newJobApplication = await userService.createJobApplication(
          newUser.id.toString(),
          state.data,
        );
        logger.info('Job data saved:', { userId: newUser.id, data: state.data });

        // Show success message and end
        await ctx.reply(messages[state.language].success);
        (global as any).jobState.delete(userId);
        break;

      default:
        await ctx.reply(messages[state.language].error);
        (global as any).jobState.delete(userId);
    }
  } catch (error) {
    logger.error('Error in job application process:', error);
    await ctx.reply(messages[state.language].error);
    (global as any).jobState.delete(userId);
  }
};
