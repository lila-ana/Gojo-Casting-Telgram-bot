import { Context } from 'grammy';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validation.service';
import { logger } from '../utils/logger';
import { FileService } from '../services/file.service';

const userService = new UserService();
const validationService = new ValidationService();
const fileService = new FileService();

type Language = 'en' | 'am';

interface RegistrationState {
  step: number;
  data: any;
  language: Language;
}

interface Messages {
  welcome: string;
  selectLanguage: string;
  fullName: string;
  dateOfBirth: string;
  invalidDate: string;
  gender: string;
  invalidGender: string;
  phoneNumber: string;
  invalidPhone: string;
  email: string;
  invalidEmail: string;
  address: string;
  maritalStatus: string;
  invalidMaritalStatus: string;
  height: string;
  invalidHeight: string;
  weight: string;
  invalidWeight: string;
  faceColor: string;
  talentCategories: string;
  invalidCategories: string;
  preferredLanguage: string;
  success: string;
  error: string;
  invalidStep: string;
  startRegistration: string;
  invalidName: string;
  paymentOptions: string;
  invalidPaymentOption: string;
  enterFTNumber: string;
  invalidFTNumber: string;
  uploadPaymentReceipt: string;
  paymentConfirmed: string;
  paymentError: string;
  paymentSubmitted: string;
  registrationComplete: string;
  registrationError: string;
  nationalId: string;
  photo: string;
  fileError: string;
}

// Store registration state
(global as any).registrationState = new Map<number, RegistrationState>();

const messages: Record<Language, Messages> = {
  en: {
    welcome: 'Welcome to the registration process!',
    selectLanguage: 'Please select your preferred language:\n1. English\n2. አማርኛ',
    fullName: 'Please enter your full name:',
    dateOfBirth: 'Please enter your date of birth (YYYY-MM-DD):',
    invalidDate: 'Invalid date of birth. Please enter a valid date (YYYY-MM-DD):',
    gender: 'Please select your gender:\n1. Male\n2. Female',
    invalidGender: 'Invalid gender. Please select 1 for Male or 2 for Female:',
    phoneNumber: 'Please enter your phone number:',
    invalidPhone: 'Invalid phone number. Please enter a valid phone number:',
    email: 'Please enter your email address:',
    invalidEmail: 'Invalid email. Please enter a valid email address:',
    address:
      'Please enter your present address: (E.g., 123 Example Street, Downtown District, Addis Ababa, Ethiopia)',
    maritalStatus:
      'Please select your marital status by entering the number:\n1. Single\n2. Married\n3. Divorced\n4. Widowed',
    invalidMaritalStatus: 'Invalid marital status. Please select a number from the list:',
    height: 'Please enter your height in meters (e.g., 1.63):',
    invalidHeight: 'Invalid height. Please enter a height between 1.00m and 2.50m:',
    weight: 'Please enter your weight in kilograms:',
    invalidWeight: 'Invalid weight. Please enter a weight between 30kg and 200kg:',
    faceColor: 'Please enter your face color:',
    talentCategories:
      'Please select your talent categories by entering the numbers separated by commas (e.g., 1, 3, 5):\n' +
      '1. Director\n2. Assistant Director\n3. Screenwriter/Scriptwriter\n4. Lead Actors\n5. Supporting Actors\n' +
      '6. Cinematographer/Director of Photography\n7. Camera Operator\n8. Production Designer\n9. Art Director\n' +
      '10. Set Designer\n11. Costume Designer\n12. Makeup Artist\n13. Hair Stylist\n14. Sound Designer\n' +
      '15. Sound Mixer\n16. Boom Operator\n17. Composer\n18. Film Editor\n19. Visual Effects (VFX) Artist\n' +
      '20. Best Boy (Lighting Assistant)\n21. Lighting Technician\n22. Location Manager\n23. Unit Production Manager\n' +
      '24. Casting Director\n25. Stunt Coordinator\n26. Special Effects Supervisor\n27. Script Supervisor\n' +
      '28. Production Assistant',
    invalidCategories: 'Invalid talent categories. Please select from the provided list:',
    preferredLanguage: 'Please enter your preferred language:',
    success:
      'Registration completed successfully!\n\n' +
      'Registration Fee: *200 ETB*\n\n' +
      'Please use one of the following payment methods:\n' +
      '*CBE:* 1000679541955\n' +
      '*Abissnya Bank:* 195426619\n' +
      '*Telebirr:* 0914809000\n\n' +
      'After payment, please choose how you want to confirm your payment',
    paymentOptions:
      'Please choose how you want to confirm your payment:\n1. Enter FT Number\n2. Upload Payment Receipt',
    enterFTNumber: 'Please enter your FT number:',
    invalidFTNumber: 'Invalid FT number. Please enter a valid FT number:',
    uploadPaymentReceipt: 'Please upload your payment receipt as a photo:',
    paymentConfirmed:
      'Thank you! Your payment has been confirmed. We will review your registration and get back to you soon.',
    paymentError:
      'There was an error processing your payment confirmation. Please try again or contact support.',
    error: 'An error occurred. Please start over with /register',
    invalidStep: 'Invalid step. Please start over with /register',
    startRegistration: 'Please start the registration process with /register',
    invalidName: 'Invalid name. Please enter a name that is at least 2 characters long.',
    paymentSubmitted:
      'Payment proof submitted successfully! We will review it and get back to you soon.',
    invalidPaymentOption: 'Invalid payment option. Please select from the options:',
    registrationComplete: 'Registration completed successfully!',
    registrationError: 'There was an error during registration. Please try again later.',
    nationalId: 'Please upload your National ID (as a document):',
    photo: 'Please upload your photo:',
    fileError: 'Error processing your file. Please try again:',
  },
  am: {
    welcome: 'የምዝገባ ሂደት ውስጥ እንኳን ደህና መጡ!',
    selectLanguage: 'እባክዎ ቋንቋዎን ይምረጡ:\n1. English\n2. አማርኛ',
    fullName: 'እባክዎ ሙሉ ስምዎን ያስገቡ:',
    dateOfBirth: 'እባክዎ የልደት ቀንዎን ያስገቡ (YYYY-MM-DD):',
    invalidDate: 'ልክ ያልሆነ የልደት ቀን። እባክዎ ትክክለኛ ቀን ያስገቡ (YYYY-MM-DD):',
    gender: 'እባክዎ ጾታዎን ይምረጡ:\n1. ወንድ\n2. ሴት',
    invalidGender: 'ልክ ያልሆነ ጾታ። እባክዎ 1 ለወንድ ወይም 2 ለሴት ይምረጡ:',
    phoneNumber: 'እባክዎ ስልክ ቁጥርዎን ያስገቡ:',
    invalidPhone: 'ልክ ያልሆነ ስልክ ቁጥር። እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ:',
    email: 'እባክዎ ኢሜይል አድራሻዎን ያስገቡ:',
    invalidEmail: 'ልክ ያልሆነ ኢሜይል። እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ:',
    address: 'እባክዎ የአሁኑን አድራሻዎን ያስገቡ: (ለምሳሌ፡ 123 ምሳሌ አደባባይ፣ የከተማ ማዕከል፣ አዲስ አበባ፣ ኢትዮጵያ)',
    maritalStatus:
      'እባክዎ የጋብቻ ሁኔታዎን በቁጥር በመጠቀም ይምረጡ:\n1. ያላገባ/ ያላገባች\n2. ያገባ/ ያገባች\n3. ፍቺ ያጋጠመው / ያጋጠማት\n4. ባል / ሚስት የሞተ / የሞተች',
    invalidMaritalStatus: 'ልክ ያልሆነ የጋብቻ ሁኔታ። እባክዎ ከዝርዝሩ ውስጥ ቁጥር ይምረጡ:',
    height: 'እባክዎ ቁመትዎን በሜትር ያስገቡ (ለምሳሌ፡ 1.63):',
    invalidHeight: 'ልክ ያልሆነ ቁመት። እባክዎ ቁመትዎን በ1.00ሜ እና 2.50ሜ መካከል ያስገቡ:',
    weight: 'እባክዎ ክብደትዎን በኪሎግራም ያስገቡ:',
    invalidWeight: 'ልክ ያልሆነ ክብደት። እባክዎ ክብደትዎን በ30ኪግ እና 200ኪግ መካከል ያስገቡ:',
    faceColor: 'እባክዎ የፊት ቀለምዎን ያስገቡ:',
    talentCategories:
      'እባክዎ የምርጫ ምድቦችዎን በኮማ በማለያየት ቁጥሮችን በመጠቀም ይምረጡ (ለምሳሌ፡ 1, 3, 5):\n' +
      '1. ዳይሬክተር\n2. ረዳት ዳይሬክተር\n3. ስክሪፕት ጸሐፊ\n4. ዋና ተዋናዮች\n5. ረዳት ተዋናዮች\n' +
      '6. ሲኒማቶግራፈር\n7. ካሜራ ኦፐሬተር\n8. ፕሮዳክሽን ዲዛይነር\n9. አርት ዳይሬክተር\n' +
      '10. ሴት ዲዛይነር\n11. ኮስትዩም ዲዛይነር\n12. ሜኪአፕ አርቲስት\n13. ፀጉር አስተካካይ\n14. ድምፅ ዲዛይነር\n' +
      '15. ድምፅ ሚክሰር\n16. ቡም ኦፐሬተር\n17. ኮምፖዘር\n18. ፊልም ኢዲተር\n19. ቪዥዋል ኢፌክትስ አርቲስት\n' +
      '20. ብስት ቦይ\n21. የብርሃን ቴክኒሻን\n22. የቦታ አስተዳደሪ\n23. ዩኒት ፕሮዳክሽን አስተዳደሪ\n' +
      '24. ካስቲንግ ዳይሬክተር\n25. ስተንት ኮንርዲኔተር\n26. ስፔሻል ኢፌክትስ ሱፐርቫይዘር\n27. ስክሪፕት ሱፐርቫይዘር\n' +
      '28. ፕሮዳክሽን ረዳት',
    invalidCategories: 'ልክ ያልሆኑ የምርጫ ምድቦች። እባክዎ ከተሰጡት ዝርዝሮች ውስጥ ይምረጡ:',
    preferredLanguage: 'እባክዎ የሚመርጡትን ቋንቋ ያስገቡ:',
    success:
      'ምዝገባው በተሳካ ሁኔታ ተጠናቅቋል!\n\n' +
      'የምዝገባ ክፍያ: *200 ብር*\n\n' +
      'እባክዎ ከሚከተሉት የክፍያ ዘዴዎች ውስጥ አንዱን ይጠቀሙ:\n' +
      '*CBE:* 1000679541955\n' +
      '*አቢሲኒያ ባንክ:* 195426619\n' +
      '*ተሌብር:* 0914809000\n\n' +
      'ክፍያውን ካደረጉ በኋላ፣ ክፍያዎን እንዴት ማረጋገጥ እንደሚፈልጉ ይምረጡ',
    enterFTNumber: 'እባክዎ FT ቁጥርዎን ያስገቡ:',
    invalidFTNumber: 'ልክ ያልሆነ FT ቁጥር። እባክዎ ትክክለኛ የFT ቁጥር ያስገቡ:',
    uploadPaymentReceipt: 'እባክዎ የክፍያ ደረሰኝዎን እንደ ፎቶ ያስገቡ:',
    paymentConfirmed: 'አመሰግናለሁ! ክፍያዎ ተረጋግጧል። ምዝገባዎን እንገመግማለን እና በቅርቡ እንመልስዎታለን።',
    paymentError: 'ክፍያዎን ማረጋገጥ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ ወይም ድጋፉን ያግኙ።',
    error: 'ስህተት ተከስቷል። እባክዎ በ /register በመጠቀም እንደገና ይጀምሩ',
    invalidStep: 'ልክ ያልሆነ ደረጃ። እባክዎ በ /register በመጠቀም እንደገና ይጀምሩ',
    startRegistration: 'እባክዎ የምዝገባ ሂደቱን በ /register በመጠቀም ይጀምሩ',
    invalidName: 'ልክ ያልሆነ ስም። እባክዎ ቢያንስ 2 ፊደላት ያሉትን ስም ያስገቡ።',
    paymentSubmitted:
      'Payment proof submitted successfully! We will review it and get back to you soon.',
    invalidPaymentOption: 'የማይሰራ የክፍያ አማራጭ። እባክዎ ከአማራጮቹ ይምረጡ:',
    registrationComplete: 'ምዝገባ በተሳክቶ ተጠናቅቋል!',
    registrationError: 'በምዝገባ ሂደት ውስጥ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ።',
    nationalId: 'እባክዎ የብሄራዊ መታወቂያዎን ያስገቡ (እንደ ሰነድ):',
    photo: 'እባክዎ ፎቶዎን ያስገቡ:',
    fileError: 'ፋይልዎን በማስተናገድ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ:',
    paymentOptions: 'እባክዎ የክፍያ ዘዴዎን ይምረጡ:\n1. FT ቁጥር ያስገቡ\n2. የክፍያ ደረሰኝ ያስገቡ',
  },
};

export const startRegistration = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  // Initialize registration state
  (global as any).registrationState.set(userId, {
    step: 0, // Start with language selection
    data: {},
    language: 'en',
  });

  await ctx.reply(messages.en.selectLanguage);
};

export const handleRegistrationStep = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = (global as any).registrationState.get(userId) as RegistrationState | undefined;
  if (!state) {
    await ctx.reply(messages.en.startRegistration);
    return;
  }

  logger.info('Processing registration step:', {
    userId,
    step: state.step,
    messageType: ctx.message?.document ? 'document' : ctx.message?.photo ? 'photo' : 'text',
  });

  // Handle document/photo uploads first
  if (state.step === 12 && (ctx.message?.document || ctx.message?.photo)) {
    try {
      let fileId: string;
      let fileName: string;

      if (ctx.message.document) {
        fileId = ctx.message.document.file_id;
        fileName = ctx.message.document.file_name || 'national_id';
      } else if (ctx.message.photo) {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        fileId = photo.file_id;
        fileName = 'national_id.jpg';
      } else {
        throw new Error('No valid file found in message');
      }

      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch national ID document: ${response.status} ${response.statusText}`,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      state.data.nationalIdPath = await fileService.saveFile(buffer, fileName, 'id');

      state.step = 13;
      await ctx.reply(messages[state.language].photo);
      return;
    } catch (error: any) {
      logger.error('Error processing National ID:', error);
      await ctx.reply(`${messages[state.language].fileError}\nError: ${error?.message}`);
      return;
    }
  } else if (state.step === 13 && (ctx.message?.document || ctx.message?.photo)) {
    try {
      let fileId: string;
      let fileName: string;

      if (ctx.message.document) {
        fileId = ctx.message.document.file_id;
        fileName = ctx.message.document.file_name || 'photo';
      } else if (ctx.message.photo) {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        fileId = photo.file_id;
        fileName = 'photo.jpg';
      } else {
        throw new Error('No valid file found in message');
      }

      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch photo: ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      state.data.photoPath = await fileService.saveFile(buffer, fileName, 'photo');

      const user = await userService.createOrUpdateUser(ctx.from!);
      try {
        const existingUser = await userService.getUserWithDetails(Number(ctx.from.id));

        const registrationData = {
          userId: user.id,
          fullName: state.data.fullName,
          dateOfBirth: state.data.dateOfBirth,
          gender: state.data.gender,
          phoneNumber: state.data.phoneNumber,
          email: state.data.email,
          presentAddress: state.data.presentAddress,
          maritalStatus: state.data.maritalStatus,
          height: state.data.height,
          weight: state.data.weight,
          faceColor: state.data.faceColor,
          talentCategories: state.data.talentCategories,
          nationalIdPath: state.data.nationalIdPath,
          photoPath: state.data.photoPath,
          isPaid: false,
          paymentMethod: null,
          paymentProof: null,
          paymentStatus: 'pending',
          status: 'pending',
          preferredLanguage: state.language,
          registrationFee: 200,
        };

        const registration = await userService.createRegistration(user.id, registrationData);

        await ctx.reply(messages[state.language].success);
        state.step = 14;
        await ctx.reply(messages[state.language].paymentOptions);
      } catch (error: any) {
        logger.error('Error creating registration:', {
          error: error.message,
          stack: error.stack,
          userId: user.id,
          state: state.data,
        });

        if (error.message.includes('already exists')) {
          const existingUser = await userService.getUserWithDetails(Number(ctx.from.id));
          if (existingUser?.registration) {
            await ctx.reply(
              state.language === 'en'
                ? 'You have already registered. Please contact support if you need to make changes.'
                : 'አስቀድሞ ተመዝግበዋል። ለውጦችን ማድረግ ከፈለጉ፣ እባክዎ ድጋፉን ያግኙ።',
            );
          } else {
            await ctx.reply(
              state.language === 'en'
                ? 'There was an error processing your registration. Please try again.'
                : 'በምዝገባዎ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ።',
            );
          }
        } else {
          await ctx.reply(
            state.language === 'en'
              ? 'There was an error processing your registration. Please try again or contact support.'
              : 'በምዝገባዎ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ ወይም ድጋፉን ያግኙ።',
          );
        }
        return;
      }
    } catch (error: any) {
      logger.error('Error in photo upload:', error);
      if (error.message.includes('already exists')) {
        await ctx.reply(
          state.language === 'en'
            ? 'You have already registered. Please contact support if you need to make changes.'
            : 'አስቀድሞ ተመዝግበዋል። ለውጦችን ማድረግ ከፈለጉ፣ እባክዎ ድጋፉን ያግኙ።',
        );
      } else {
        await ctx.reply(
          state.language === 'en'
            ? 'There was an error processing your registration. Please try again or contact support.'
            : 'በምዝገባዎ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ ወይም ድጋፉን ያግኙ።',
        );
      }
      return;
    }
  } else if (state.step === 15 && (ctx.message?.document || ctx.message?.photo)) {
    logger.info('Processing payment receipt:', { userId });

    try {
      let fileId: string;
      let fileName: string;

      if (ctx.message?.document) {
        fileId = ctx.message.document.file_id;
        fileName = ctx.message.document.file_name || 'payment_receipt';
      } else if (ctx.message?.photo) {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        fileId = photo.file_id;
        fileName = 'payment_receipt.jpg';
      } else {
        logger.warn('No valid file found in message:', { userId });
        await ctx.reply(messages[state.language].uploadPaymentReceipt);
        return;
      }

      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch payment receipt: ${response.status} ${response.statusText}`,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const paymentProofPath = await fileService.saveFile(buffer, fileName, 'payment');

      const user = await userService.createOrUpdateUser(ctx.from!);
      await userService.submitPaymentProof(user.id.toString(), 'receipt', paymentProofPath);

      (global as any).registrationState.delete(userId);
      await ctx.reply(messages[state.language].paymentSubmitted);
      return;
    } catch (error: any) {
      logger.error('Error processing payment receipt:', {
        userId,
        error: {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          code: error?.code,
        },
      });
      await ctx.reply(messages[state.language].paymentError);
      (global as any).registrationState.delete(userId);
      return;
    }
  }

  // Handle text messages
  const message = ctx.message?.text;
  if (!message) {
    if (state.step === 12) {
      await ctx.reply(messages[state.language].nationalId);
    } else if (state.step === 13) {
      await ctx.reply(messages[state.language].photo);
    } else if (state.step === 15) {
      await ctx.reply(messages[state.language].uploadPaymentReceipt);
    }
    return;
  }

  try {
    switch (state.step) {
      case 0: // Language selection
        const langChoice = parseInt(message.trim(), 10);
        if (langChoice !== 1 && langChoice !== 2) {
          await ctx.reply(messages.en.selectLanguage);
          return;
        }
        state.language = langChoice === 1 ? 'en' : 'am';
        state.step = 1;
        await ctx.reply(messages[state.language].fullName);
        break;

      case 1: // Full Name
        if (!message || message.trim().length < 2) {
          await ctx.reply(messages[state.language].invalidName);
          return;
        }
        state.data.fullName = message.trim();
        state.step++;
        await ctx.reply(messages[state.language].dateOfBirth);
        break;

      case 2: // Date of Birth
        const dob = new Date(message);
        if (!validationService.validateDateOfBirth(dob)) {
          await ctx.reply(messages[state.language].invalidDate);
          return;
        }
        state.data.dateOfBirth = dob;
        state.step++;
        await ctx.reply(messages[state.language].gender);
        break;

      case 3: // Gender
        const gender = message === '1' ? 'Male' : message === '2' ? 'Female' : message;
        if (!['Male', 'Female'].includes(gender)) {
          await ctx.reply(messages[state.language].invalidGender);
          return;
        }
        state.data.gender = gender;
        state.step++;
        await ctx.reply(messages[state.language].phoneNumber);
        break;

      case 4: // Phone Number
        if (!validationService.validatePhoneNumber(message)) {
          await ctx.reply(messages[state.language].invalidPhone);
          return;
        }
        state.data.phoneNumber = message;
        state.step++;
        await ctx.reply(messages[state.language].email);
        break;

      case 5: // Email
        if (!validationService.validateEmail(message)) {
          await ctx.reply(messages[state.language].invalidEmail);
          return;
        }
        state.data.email = message;
        state.step++;
        await ctx.reply(messages[state.language].address);
        break;

      case 6: // Present Address
        state.data.presentAddress = message;
        state.step++;
        await ctx.reply(messages[state.language].maritalStatus);
        break;

      case 7: // Marital Status
        const maritalStatusNumber = parseInt(message.trim(), 10);
        const validMaritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
        if (maritalStatusNumber < 1 || maritalStatusNumber > validMaritalStatuses.length) {
          await ctx.reply(messages[state.language].invalidMaritalStatus);
          return;
        }
        state.data.maritalStatus = validMaritalStatuses[maritalStatusNumber - 1];
        state.step++;
        await ctx.reply(messages[state.language].height);
        break;

      case 8: // Height
        const height = parseFloat(message);
        if (!validationService.validateHeight(height)) {
          await ctx.reply(messages[state.language].invalidHeight);
          return;
        }
        state.data.height = height;
        state.step++;
        await ctx.reply(messages[state.language].weight);
        break;

      case 9: // Weight
        const weight = parseFloat(message);
        if (!validationService.validateWeight(weight)) {
          await ctx.reply(messages[state.language].invalidWeight);
          return;
        }
        state.data.weight = weight;
        state.step++;
        await ctx.reply(messages[state.language].faceColor);
        break;

      case 10: // Face Color
        state.data.faceColor = message;
        state.step++;
        await ctx.reply(messages[state.language].talentCategories);
        break;

      case 11: // Talent Categories
        const categoryNumbers = message.split(',').map((num) => parseInt(num.trim(), 10));
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
        const selectedCategories = categoryNumbers.map((num) => validCategories[num - 1]);
        if (!validationService.validateTalentCategories(selectedCategories)) {
          await ctx.reply(messages[state.language].invalidCategories);
          return;
        }
        state.data.talentCategories = selectedCategories;
        state.step++;
        await ctx.reply(messages[state.language].preferredLanguage);
        break;

      case 12: // National ID
        await ctx.reply(messages[state.language].nationalId);
        break;

      case 13: // Photo
        await ctx.reply(messages[state.language].photo);
        break;

      case 14: // Payment Confirmation Method Selection
        const paymentChoice = parseInt(message.trim(), 10);
        if (paymentChoice !== 1 && paymentChoice !== 2) {
          await ctx.reply(messages[state.language].paymentOptions);
          return;
        }
        state.step = 15;
        state.data.paymentConfirmationMethod = paymentChoice === 1 ? 'ft' : 'receipt';
        if (paymentChoice === 1) {
          await ctx.reply(messages[state.language].enterFTNumber);
        } else {
          await ctx.reply(messages[state.language].uploadPaymentReceipt);
        }
        break;

      case 15: // Payment Confirmation
        if (state.data.paymentConfirmationMethod === 'ft') {
          // Validate FT number
          if (!message || message.trim().length < 3) {
            await ctx.reply(messages[state.language].invalidFTNumber);
            return;
          }
          state.data.paymentProof = message.trim();
          try {
            const user = await userService.createOrUpdateUser(ctx.from!);
            await userService.submitPaymentProof(user.id.toString(), 'ft', state.data.paymentProof);
            (global as any).registrationState.delete(userId);
            await ctx.reply(messages[state.language].paymentSubmitted);
          } catch (error) {
            logger.error('Error submitting FT number as payment proof:', error);
            await ctx.reply(messages[state.language].paymentError);
            (global as any).registrationState.delete(userId);
          }
        }
        break;

      default:
        await ctx.reply(messages[state.language].invalidStep);
        (global as any).registrationState.delete(userId);
        break;
    }
  } catch (error: any) {
    logger.error('Error in registration process:', error);
    if (error.message === 'A registration with this user ID already exists.') {
      await ctx.reply(
        state.language === 'en'
          ? 'A registration with this user ID already exists. Please contact support for assistance.'
          : 'በዚህ የተጠቃሚ መታወቂያ ላይ ምዝገባ አስቀድሞ አለ። እባክዎ ለእርዳታ ድጋፉን ያግኙ።',
      );
    } else {
      await ctx.reply(messages[state.language].error);
    }
    (global as any).registrationState.delete(userId);
  }
};

// Add the payment receipt handling logic
export const handlePaymentReceipt = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = (global as any).registrationState.get(userId) as RegistrationState | undefined;
  if (!state || state.step !== 15) return;

  if (ctx.message?.document || ctx.message?.photo) {
    logger.info('Processing payment receipt:', { userId });

    try {
      let fileId: string;
      let fileName: string;

      if (ctx.message?.document) {
        fileId = ctx.message.document.file_id;
        fileName = ctx.message.document.file_name || 'payment_receipt';
      } else if (ctx.message?.photo) {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        fileId = photo.file_id;
        fileName = 'payment_receipt.jpg';
      } else {
        logger.warn('No valid file found in message:', { userId });
        await ctx.reply(messages[state.language].uploadPaymentReceipt);
        return;
      }

      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch payment receipt: ${response.status} ${response.statusText}`,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const paymentProofPath = await fileService.saveFile(buffer, fileName, 'payment');

      const user = await userService.createOrUpdateUser(ctx.from!);
      await userService.submitPaymentProof(user.id.toString(), 'receipt', paymentProofPath);

      (global as any).registrationState.delete(userId);
      await ctx.reply(messages[state.language].paymentSubmitted);
      return;
    } catch (error: any) {
      logger.error('Error processing payment receipt:', {
        userId,
        error: {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          code: error?.code,
        },
      });
      await ctx.reply(messages[state.language].paymentError);
      (global as any).registrationState.delete(userId);
      return;
    }
  }
};
