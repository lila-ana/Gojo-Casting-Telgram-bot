import { Context } from 'grammy';
import { UserService } from '../services/user.service';
import { ValidationService } from '../services/validation.service';
import { logger } from '../utils/logger';
import { FileService } from '../services/file.service';

const userService = new UserService();
const validationService = new ValidationService();
const fileService = new FileService();

type Language = 'en' | 'am';

interface TrainingState {
  step: number;
  data: any;
  language: Language;
}

interface Messages {
  welcome: string;
  selectLanguage: string;
  selectTrainingMode: string;
  onlineTraining: string;
  inPersonTraining: string;
  invalidCourses: string;
  invalidTrainings: string;
  registrationRequired: string;
  startTraining: string;
  userNotFound: string;
  alreadyRegistered: string;
  success: string;
  error: string;
  invalidStep: string;
  paymentOptions: string;
  invalidPaymentOption: string;
  enterFTNumber: string;
  invalidFTNumber: string;
  uploadPaymentReceipt: string;
  paymentSubmitted: string;
  paymentError: string;
}

// Store training registration state
(global as any).trainingState = new Map<number, TrainingState>();

const messages: Record<Language, Messages> = {
  en: {
    welcome:
      'Welcome to the training registration process!\n\n' +
      'Please select your preferred training mode:\n' +
      '1. Online Training\n' +
      '2. In-Person Training',
    selectLanguage: 'Please select your preferred language:\n1. English\n2. አማርኛ',
    selectTrainingMode:
      'Please select your preferred training mode:\n1. Online Training\n2. In-Person Training',
    onlineTraining:
      'Please select your online courses (comma-separated):\n1. Scriptwriting\n2. Screenplay',
    inPersonTraining:
      'Please select your in-person courses (comma-separated):\n1. Acting\n2. Cinematography\n3. Directing',
    invalidCourses: 'Invalid selection. Please select from the provided list:',
    invalidTrainings: 'Invalid selection. Please select from the provided list:',
    registrationRequired: 'Please complete your registration first using /register',
    startTraining: 'Please start the training registration process with /training',
    userNotFound: 'User not found. Please start over with /register',
    alreadyRegistered:
      'You have already registered for training. If you need to make changes, please contact the administrator.',
    success:
      'Training registration completed successfully!\n\n' +
      'This is a one-time non-refundable fee required to complete your registration.\n\n' +
      '**Training Fee: 2,500 ETB**\n\n' +
      'This fee covers the full cost of the selected training course.\n\n' +
      'Payment Methods:\n' +
      'CBE: 1000679541955\n' +
      'Abissnya Bank: 195426619\n' +
      'Telebirr: 0914809000\n\n' +
      'After payment, please contact us to confirm your training registration.',
    error: 'An error occurred. Please start over with /training',
    invalidStep: 'Invalid step. Please start over with /training',
    paymentOptions:
      'Please choose how you want to confirm your payment:\n1. Enter FT Number\n2. Upload Payment Receipt',
    invalidPaymentOption: 'Invalid payment option. Please select from the options:',
    enterFTNumber: 'Please enter your FT number:',
    invalidFTNumber: 'Invalid FT number. Please enter a valid FT number:',
    uploadPaymentReceipt: 'Please upload your payment receipt as a photo:',
    paymentSubmitted:
      'Payment proof submitted successfully! We will review it and get back to you soon.',
    paymentError:
      'There was an error processing your payment confirmation. Please try again or contact support.',
  },
  am: {
    welcome:
      'የስልጠና ምዝገባ ሂደት ውስጥ እንኳን ደህና መጡ!\n\n' +
      'እባክዎ የሚመርጡትን የስልጠና ሁኔታ ይምረጡ:\n' +
      '1. የመስመር ላይ ስልጠና\n' +
      '2. በአካል ስልጠና',
    selectLanguage: 'እባክዎ ቋንቋዎን ይምረጡ:\n1. English\n2. አማርኛ',
    selectTrainingMode: 'እባክዎ የሚመርጡትን የስልጠና ሁኔታ ይምረጡ:\n1. የመስመር ላይ ስልጠና\n2. በአካል ስልጠና',
    onlineTraining: 'እባክዎ የመስመር ላይ ኮርሶችዎን ይምረጡ (በኮማ በማለያየት):\n1. ስክሪፕት ማዘጋጀት\n2. ስክሪንፕሌይ',
    inPersonTraining: 'እባክዎ በአካል የሚደረጉ ኮርሶችዎን ይምረጡ (በኮማ በማለያየት):\n1. አክቲንግ\n2. ሲኒማቶግራፊ\n3. ዳይሬክቲንግ',
    invalidCourses: 'ልክ ያልሆነ ምርጫ። እባክዎ ከተሰጡት ዝርዝሮች ውስጥ ይምረጡ:',
    invalidTrainings: 'ልክ ያልሆነ ምርጫ። እባክዎ ከተሰጡት ዝርዝሮች ውስጥ ይምረጡ:',
    registrationRequired: 'እባክዎ በመጀመሪያ /register በመጠቀም ምዝገባዎን ያጠናቅቁ',
    startTraining: 'እባክዎ የስልጠና ምዝገባ ሂደቱን በ /training በመጠቀም ይጀምሩ',
    userNotFound: 'ተጠቃሚ አልተገኘም። እባክዎ በ /register በመጠቀም እንደገና ይጀምሩ',
    alreadyRegistered: 'አስቀድመው ለስልጠና ተመዝግበዋል። ለውጦችን ማድረግ ከፈለጉ፣ እባክዎ አስተዳደሩን ያግኙት።',
    success:
      'የስልጠና ምዝገባ በተሳካ ሁኔታ ተጠናቅቋል!\n\n' +
      'የምዝገባዎ ዝርዝሮች እነ:\n\n' +
      '📚 የስልጠና ሁኔታ: %mode%\n' +
      '📋 የተመረጡ ኮርሶች:\n%courses%\n' +
      '💻 የመስመር ላይ ስልጠናዎች:\n%trainings%\n\n' +
      'ይህ የአንድ ጊዜ የማይመለስ ክፍያ ነው።\n\n' +
      '**የስልጠና ክፍያ፡ 2,500 ብር**\n\n' +
      'ይህ ክፍያ የተመረጠውን የስልጠና ኮርስ ሙሉ ወጪን ያሸፍናል።\n\n' +
      'የክፍያ ዘዴዎች:\n' +
      'CBE: 1000679541955\n' +
      'አቢሲኒያ ባንክ: 195426619\n' +
      'ተሌብር: 0914809000\n\n' +
      'ክፍያውን ካደረጉ በኋላ፣ የስልጠና ምዝገባዎን ለማረጋገጥ እባክዎ ያግኙን።',
    error: 'ስህተት ተከስቷል። እባክዎ በ /training በመጠቀም እንደገና ይጀምሩ',
    invalidStep: 'ልክ ያልሆነ ደረጃ። እባክዎ በ /training በመጠቀም እንደገና ይጀምሩ',
    paymentOptions: 'እባክዎ የክፍያ ዘዴዎን ይምረጡ:\n1. FT ቁጥር ያስገቡ\n2. የክፍያ ደረሰኝ ያስገቡ',
    invalidPaymentOption: 'የማይሰራ የክፍያ አማራጭ። እባክዎ ከአማራጮቹ ይምረጡ:',
    enterFTNumber: 'እባክዎ FT ቁጥርዎን ያስገቡ:',
    invalidFTNumber: 'ልክ ያልሆነ FT ቁጥር። እባክዎ ትክክለኛ የFT ቁጥር ያስገቡ:',
    uploadPaymentReceipt: 'እባክዎ የክፍያ ደረሰኝዎን እንደ ፎቶ ያስገቡ:',
    paymentSubmitted: 'የክፍያ ማረጋገጫ በተሳካ ሁኔታ ተልኳል! በቅርቡ እንገምታለን።',
    paymentError: 'የክፍያ ማረጋገጫውን በማስተናገድ ላይ ስህተት ተከስቷል። እባክዎ እንደገና ይሞከሩ ወይም ድጋፉን ያግኙ።',
  },
};

export const startTraining = async (ctx: Context) => {
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
        ? 'እባክዎ የስልጠና ምዝገባ ከመጀመርዎ በፊት የምዝገባ ክፍያዎን ያጠናቁ።'
        : 'Please complete your registration payment before starting training registration.',
    );
    return;
  }

  // Initialize training state
  (global as any).trainingState.set(userId, {
    step: 0, // Start with language selection
    data: {},
    language: 'en',
  });

  await ctx.reply(messages.en.selectLanguage);
};

export const handleTrainingStep = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = (global as any).trainingState.get(userId) as TrainingState | undefined;
  if (!state) {
    logger.warn('No training state found for user:', { userId });
    await ctx.reply(messages.en.startTraining);
    return;
  }

  logger.info('Processing training step:', {
    userId,
    step: state.step,
    messageType: ctx.message?.document ? 'document' : ctx.message?.photo ? 'photo' : 'text',
    currentState: state,
  });

  // Handle document/photo uploads first
  if (state.step === 10 && (ctx.message?.document || ctx.message?.photo)) {
    logger.info('Received file upload in payment step:', {
      userId,
      hasDocument: !!ctx.message?.document,
      hasPhoto: !!ctx.message?.photo,
      documentName: ctx.message?.document?.file_name,
      photoCount: ctx.message?.photo?.length,
    });

    try {
      let fileId: string;
      let fileName: string;

      if (ctx.message?.document) {
        logger.info('Processing document as payment receipt:', {
          userId,
          fileName: ctx.message.document.file_name,
          fileSize: ctx.message.document.file_size,
          mimeType: ctx.message.document.mime_type,
        });
        fileId = ctx.message.document.file_id;
        fileName = ctx.message.document.file_name || 'payment_receipt';
      } else if (ctx.message?.photo) {
        // Get the largest photo size
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        logger.info('Processing photo as payment receipt:', {
          userId,
          fileSize: photo.file_size,
          width: photo.width,
          height: photo.height,
        });
        fileId = photo.file_id;
        fileName = 'payment_receipt.jpg';
      } else {
        logger.warn('No valid file found in message:', { userId });
        await ctx.reply(messages[state.language].uploadPaymentReceipt);
        return;
      }

      logger.info('Getting file info from Telegram API:', { userId, fileId });
      const file = await ctx.api.getFile(fileId);
      logger.info('File info received:', {
        userId,
        filePath: file.file_path,
        fileSize: file.file_size,
      });

      const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
      logger.info('Fetching file from URL:', { userId, fileUrl });

      const response = await fetch(fileUrl);
      if (!response.ok) {
        logger.error('Failed to fetch payment receipt:', {
          userId,
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Failed to fetch payment receipt: ${response.status} ${response.statusText}`,
        );
      }
      logger.info('File fetched successfully:', { userId });

      const buffer = Buffer.from(await response.arrayBuffer());
      logger.info('Buffer created:', {
        userId,
        bufferSize: buffer.length,
      });

      logger.info('Saving payment receipt file:', { userId, fileName });
      const paymentProofPath = await fileService.saveFile(buffer, fileName, 'payment');
      logger.info('Payment receipt saved successfully:', {
        userId,
        paymentProofPath,
      });

      // Get user again to ensure we have the latest data
      logger.info('Getting user data for payment submission:', { userId });
      const user = await userService.createOrUpdateUser(ctx.from!);
      logger.info('User data retrieved:', {
        userId: user.id,
        username: user.username,
      });

      // Submit payment proof for admin review
      logger.info('Submitting payment proof:', {
        userId: user.id,
        proofType: 'receipt',
        proofPath: paymentProofPath,
      });
      await userService.submitTrainingPaymentProof(user.id.toString(), 'receipt', paymentProofPath);
      logger.info('Payment proof submitted successfully:', { userId: user.id });

      // Clear training state
      (global as any).trainingState.delete(userId);
      logger.info('Training state cleared:', { userId });

      await ctx.reply(messages[state.language].paymentSubmitted);
      logger.info('Payment submission confirmation sent to user:', { userId });
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
        state: state
          ? {
              step: state.step,
              data: state.data,
            }
          : 'No state',
      });
      await ctx.reply(messages[state.language].paymentError);
      (global as any).trainingState.delete(userId);
      return;
    }
  }

  // Handle text messages
  const message = ctx.message?.text;
  if (!message) {
    if (state.step === 10) {
      logger.info('No text message in payment step, requesting receipt:', { userId });
      await ctx.reply(messages[state.language].uploadPaymentReceipt);
    }
    return;
  }

  try {
    switch (state.step) {
      case 0: // Language selection
        const langChoice = parseInt(message.trim(), 10);
        if (langChoice !== 1 && langChoice !== 2) {
          logger.warn('Invalid language choice:', { userId, choice: langChoice });
          await ctx.reply(messages.en.selectLanguage);
          return;
        }
        state.language = langChoice === 1 ? 'en' : 'am';
        state.step = 1;
        logger.info('Language selected:', { userId, language: state.language });
        await ctx.reply(messages[state.language].selectTrainingMode);
        break;

      case 1: // Training mode selection
        const modeChoice = parseInt(message.trim(), 10);
        if (modeChoice !== 1 && modeChoice !== 2) {
          logger.warn('Invalid training mode choice:', { userId, choice: modeChoice });
          await ctx.reply(messages[state.language].selectTrainingMode);
          return;
        }
        state.data.trainingMode = modeChoice;
        logger.info('Training mode selected:', { userId, mode: modeChoice });

        // Show relevant course options based on mode
        if (modeChoice === 1) {
          // Online
          state.step = 2;
          await ctx.reply(messages[state.language].onlineTraining);
        } else {
          // In-person
          state.step = 3;
          await ctx.reply(messages[state.language].inPersonTraining);
        }
        break;

      case 2: // Online courses
        const onlineNumbers = message.split(',').map((num) => parseInt(num.trim(), 10));
        const validOnlineCourses = ['Scriptwriting', 'Screenplay'];
        const selectedOnlineCourses = onlineNumbers.map((num) => validOnlineCourses[num - 1]);

        logger.info('Online course selection attempt:', {
          userId,
          selectedNumbers: onlineNumbers,
          selectedCourses: selectedOnlineCourses,
        });

        if (!validationService.validateOnlineTraining(selectedOnlineCourses)) {
          logger.warn('Invalid online courses selected:', {
            userId,
            selectedCourses: selectedOnlineCourses,
            validCourses: validOnlineCourses,
          });
          await ctx.reply(messages[state.language].invalidCourses);
          return;
        }

        state.data.onlineTraining = selectedOnlineCourses;
        state.data.courses = [];
        logger.info('Online courses selected successfully:', {
          userId,
          courses: state.data.onlineTraining,
        });
        await saveTrainingData(ctx, state, userId);
        break;

      case 3: // In-person courses
        const inPersonNumbers = message.split(',').map((num) => parseInt(num.trim(), 10));
        const validInPersonCourses = ['Acting', 'Cinematography', 'Directing'];
        const selectedInPersonCourses = inPersonNumbers.map((num) => validInPersonCourses[num - 1]);

        logger.info('In-person course selection attempt:', {
          userId,
          selectedNumbers: inPersonNumbers,
          selectedCourses: selectedInPersonCourses,
        });

        if (!validationService.validateTrainingCourses(selectedInPersonCourses)) {
          logger.warn('Invalid in-person courses selected:', {
            userId,
            selectedCourses: selectedInPersonCourses,
            validCourses: validInPersonCourses,
          });
          await ctx.reply(messages[state.language].invalidCourses);
          return;
        }

        state.data.courses = selectedInPersonCourses;
        state.data.onlineTraining = [];
        logger.info('In-person courses selected successfully:', {
          userId,
          courses: state.data.courses,
        });
        await saveTrainingData(ctx, state, userId);
        break;

      case 8: // After all training details are collected
        // Save training data
        const user = await userService.createOrUpdateUser(ctx.from!);
        await userService.createTraining(user.id.toString(), {
          courses: state.data.courses,
          onlineTraining: state.data.onlineTraining,
          isPaid: false,
          paymentMethod: null,
          paymentProof: null,
          paymentStatus: 'pending',
          status: 'pending',
          course: null,
          level: null,
          startDate: null,
          endDate: null,
          location: null,
        });

        // Show success message with payment options
        const modeText = state.data.trainingMode === 1 ? 'Online Training' : 'In-Person Training';
        const courses =
          state.data.courses && state.data.courses.length > 0
            ? state.data.courses.map((course: string) => `• ${course}`).join('\n')
            : 'None';
        const trainings =
          state.data.onlineTraining && state.data.onlineTraining.length > 0
            ? state.data.onlineTraining.map((training: string) => `• ${training}`).join('\n')
            : 'None';

        logger.info('Preparing success message:', {
          userId,
          modeText,
          courses,
          trainings,
        });

        const successMessage = messages[state.language].success
          .replace('%mode%', modeText)
          .replace('%courses%', courses)
          .replace('%trainings%', trainings);

        logger.info('Sending success message and payment options:', { userId });
        await ctx.reply(successMessage);

        // Move to payment step
        state.step = 9;
        logger.info('Moving to payment step:', {
          userId,
          newStep: state.step,
          currentState: state,
        });

        await ctx.reply(messages[state.language].paymentOptions);
        logger.info('Payment options sent to user:', { userId });
        break;

      case 9: // Payment Confirmation Method Selection
        logger.info('Processing payment confirmation method selection:', {
          userId,
          message,
          currentState: state,
        });

        const paymentChoice = parseInt(message?.trim() || '', 10);
        if (paymentChoice !== 1 && paymentChoice !== 2) {
          logger.warn('Invalid payment choice:', {
            userId,
            paymentChoice,
            message,
          });
          await ctx.reply(messages[state.language].paymentOptions);
          return;
        }

        state.step = 10;
        state.data.paymentConfirmationMethod = paymentChoice === 1 ? 'ft' : 'receipt';
        logger.info('Payment method selected:', {
          userId,
          method: state.data.paymentConfirmationMethod,
          newStep: state.step,
        });

        if (paymentChoice === 1) {
          await ctx.reply(messages[state.language].enterFTNumber);
          logger.info('Requested FT number from user:', { userId });
        } else {
          await ctx.reply(messages[state.language].uploadPaymentReceipt);
          logger.info('Requested payment receipt from user:', { userId });
        }
        break;

      default:
        logger.warn('Invalid training step encountered:', {
          userId,
          step: state.step,
        });
        await ctx.reply(messages[state.language].invalidStep);
        (global as any).trainingState.delete(userId);
        break;
    }
  } catch (error: any) {
    logger.error('Error in training registration process:', {
      userId,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
      state: state
        ? {
            step: state.step,
            data: state.data,
          }
        : 'No state',
    });
    await ctx.reply(messages[state.language].error);
    (global as any).trainingState.delete(userId);
  }
};

async function saveTrainingData(ctx: Context, state: TrainingState, userId: number) {
  logger.info('Starting to save training data:', {
    userId,
    trainingMode: state.data.trainingMode,
    onlineCourses: state.data.onlineTraining,
    inPersonCourses: state.data.courses,
  });

  const user = await userService.getUserWithDetails(userId);
  if (!user) {
    logger.error('User not found during training registration:', { userId });
    await ctx.reply(messages[state.language].userNotFound);
    (global as any).trainingState.delete(userId);
    return;
  }

  // Check if user already has a training record
  if (user.training) {
    logger.info('User already has a training record:', {
      userId: user.id,
      existingTraining: user.training,
    });
    await ctx.reply(messages[state.language].alreadyRegistered);
    (global as any).trainingState.delete(userId);
    return;
  }

  try {
    logger.info('Attempting to create training record:', {
      userId: user.id,
      trainingData: {
        courses: state.data.courses,
        onlineTraining: state.data.onlineTraining,
      },
    });

    await userService.createTraining(user.id.toString(), {
      courses: state.data.courses,
      onlineTraining: state.data.onlineTraining,
      isPaid: false,
      paymentMethod: null,
      paymentProof: null,
      paymentStatus: 'pending',
      status: 'pending',
      course: null,
      level: null,
      startDate: null,
      endDate: null,
      location: null,
    });

    logger.info('Training data saved successfully:', {
      userId: user.id,
      data: {
        courses: state.data.courses,
        onlineTraining: state.data.onlineTraining,
      },
    });

    // Move to payment step instead of clearing state
    state.step = 9;
    await ctx.reply(messages[state.language].success);
    await ctx.reply(messages[state.language].paymentOptions);
  } catch (dbError) {
    logger.error('Database error while saving training data:', {
      userId: user.id,
      error: dbError,
      data: {
        courses: state.data.courses,
        onlineTraining: state.data.onlineTraining,
      },
    });
    throw dbError;
  }
}
