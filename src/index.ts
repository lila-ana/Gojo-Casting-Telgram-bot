import { Bot } from 'grammy';
import { config } from 'dotenv';
import { logger } from './utils/logger';
import { startRegistration as registerCommand, handleRegistrationStep } from './commands/register';
import { startTraining as trainingCommand, handleTrainingStep } from './commands/training';
import { startJobApplication as jobCommand, handleJobStep } from './commands/job';
import { StartCommand as startCommand } from './commands/start';
import { helpCommand } from './commands/help';
import { aboutCommand } from './commands/about';
import {
  handleAdmin,
  listPendingPayments,
  approvePayment,
  rejectPayment,
  getMyId,
  listPendingTrainingPayments,
  approveTrainingPayment,
  rejectTrainingPayment,
} from './commands/admin';

// Load environment variables
config();

// Log environment variables (excluding sensitive data)
logger.info('Environment variables loaded:', {
  BOT_TOKEN: process.env.BOT_TOKEN ? 'Set' : 'Not set',
  ADMIN_IDS: process.env.ADMIN_IDS || 'Not set',
});

// Initialize bot
const bot = new Bot(process.env.BOT_TOKEN || '');
console.log(bot, 'this is the bot');
// Error handling
bot.catch((err) => {
  logger.error('Bot error:', err);
});

// Set up bot commands
async function setupBotCommands() {
  try {
    await bot.api.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'register', description: 'Register for casting' },
      { command: 'training', description: 'Register for training' },
      { command: 'job', description: 'Apply for a job' },
      { command: 'help', description: 'Get help information' },
      { command: 'about', description: 'Learn about Gojo Casting' },
      { command: 'admin', description: 'Access admin panel' },
    ]);
    logger.info('Bot commands set up successfully');
  } catch (error) {
    logger.error('Error setting up bot commands:', error);
  }
}

// Initialize bot commands
setupBotCommands();

// Function to clear all states for a user
function clearAllStates(userId: number) {
  (global as any).registrationState?.delete(userId);
  (global as any).trainingState?.delete(userId);
  (global as any).jobState?.delete(userId);
}

// Command handlers
bot.command('start', async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) clearAllStates(userId);
  await startCommand(ctx);
});

bot.command('register', async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) clearAllStates(userId);
  await registerCommand(ctx);
});

bot.command('training', async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) clearAllStates(userId);
  await trainingCommand(ctx);
});

bot.command('job', async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) clearAllStates(userId);
  await jobCommand(ctx);
});

bot.command('help', async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) clearAllStates(userId);
  await helpCommand(ctx);
});

bot.command('about', async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) clearAllStates(userId);
  await aboutCommand(ctx);
});

// Add admin commands
bot.command('admin', handleAdmin);
bot.command('list_pending_payments', listPendingPayments);
bot.command('approve_payment', approvePayment);
bot.command('reject_payment', rejectPayment);
bot.command('getmyid', getMyId);
bot.command('list_pending_training_payments', listPendingTrainingPayments);
bot.command('approve_training_payment', approveTrainingPayment);
bot.command('reject_training_payment', rejectTrainingPayment);

// Message handlers
bot.on('message', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  // Check registration state
  if ((global as any).registrationState?.has(userId)) {
    await handleRegistrationStep(ctx);
    return;
  }

  // Check training state
  if ((global as any).trainingState?.has(userId)) {
    await handleTrainingStep(ctx);
    return;
  }

  // Check job state
  if ((global as any).jobState?.has(userId)) {
    await handleJobStep(ctx);
    return;
  }
});

// Add photo handler for registration
bot.on('message:photo', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  // Check registration state
  if ((global as any).registrationState?.has(userId)) {
    await handleRegistrationStep(ctx);
    return;
  }
});

// Error handling
bot.catch((err) => {
  logger.error('Bot error:', err);
});

// Start the bot
bot.start({
  onStart: (botInfo) => {
    logger.info(`Bot started as @${botInfo.username}`);
  },
});

// Handle graceful shutdown
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));
