import { Context } from 'grammy';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

const userService = new UserService();

// Store admin command state
const adminState = new Map<
  number,
  {
    command: string;
    data: any;
  }
>();

export const startAdmin = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (!isAdmin(userId)) {
    await ctx.reply('⛔ You are not authorized to use admin commands.');
    return;
  }

  await ctx.reply(
    '👋 Welcome to Admin Panel!\n\n' +
      'Available commands:\n' +
      '📋 /list_pending_payments - View pending payments\n' +
      '✅ /approve_payment <id> - Approve a payment\n' +
      '❌ /reject_payment <id> - Reject a payment\n' +
      '👥 /admin_registrations - View all registrations\n' +
      '📚 /admin_trainings - View all training registrations\n' +
      '💼 /admin_jobs - View all job applications\n' +
      '👤 /admin_user <user_id> - View specific user details\n' +
      '🆔 /getmyid - Get your Telegram ID',
  );
};

export const handleAdminRegistrations = async (ctx: Context) => {
  if (!isAdmin(ctx.from?.id)) return;

  try {
    const registrations = await userService.getAllRegistrations();
    if (registrations.length === 0) {
      await ctx.reply('No registrations found.');
      return;
    }

    const message = registrations
      .map((reg) => {
        const user = reg.user;
        return (
          `ID: ${reg.id}\n` +
          `User: ${user.firstName} ${user.lastName} (${user.telegramId})\n` +
          `Payment Status: ${reg.isPaid ? 'Paid' : 'Unpaid'}\n` +
          `Created: ${reg.createdAt}\n` +
          '-------------------'
        );
      })
      .join('\n');

    await ctx.reply(message);
  } catch (error) {
    logger.error('Error fetching registrations:', error);
    await ctx.reply('Error fetching registrations.');
  }
};

export const handleAdminTrainings = async (ctx: Context) => {
  if (!isAdmin(ctx.from?.id)) return;

  try {
    const trainings = await userService.getAllTrainingRegistrations();
    if (trainings.length === 0) {
      await ctx.reply('No training registrations found.');
      return;
    }

    const message = trainings
      .map((training) => {
        const user = training.user;
        return (
          `ID: ${training.id}\n` +
          `User: ${user.firstName} ${user.lastName} (${user.telegramId})\n` +
          `Courses: ${training.courses.join(', ')}\n` +
          `Online Training: ${training.onlineTraining.join(', ')}\n` +
          `Status: ${training.status}\n` +
          `Payment: ${training.isPaid ? 'Paid' : 'Unpaid'}\n` +
          `Created: ${training.createdAt}\n` +
          '-------------------'
        );
      })
      .join('\n');

    await ctx.reply(message);
  } catch (error) {
    logger.error('Error fetching training registrations:', error);
    await ctx.reply('Error fetching training registrations.');
  }
};

export const handleAdminJobs = async (ctx: Context) => {
  if (!isAdmin(ctx.from?.id)) return;

  try {
    const jobs = await userService.getAllJobApplications();
    if (jobs.length === 0) {
      await ctx.reply('No job applications found.');
      return;
    }

    const message = jobs
      .map((job) => {
        const user = job.user;
        return (
          `ID: ${job.id}\n` +
          `User: ${user.firstName} ${user.lastName} (${user.telegramId})\n` +
          `Status: ${job.status}\n` +
          `Age: ${job.age}\n` +
          `Contact: ${job.contactPhone}\n` +
          `Email: ${job.contactEmail}\n` +
          `Created: ${job.createdAt}\n` +
          '-------------------'
        );
      })
      .join('\n');

    await ctx.reply(message);
  } catch (error) {
    logger.error('Error fetching job applications:', error);
    await ctx.reply('Error fetching job applications.');
  }
};

export const handleAdminUser = async (ctx: Context) => {
  if (!isAdmin(ctx.from?.id)) return;

  const args = ctx.message?.text?.split(' ');
  if (!args || args.length < 2) {
    await ctx.reply('Please provide a user ID: /admin_user <user_id>');
    return;
  }

  const userId = parseInt(args[1]);
  if (isNaN(userId)) {
    await ctx.reply('Invalid user ID. Please provide a valid number.');
    return;
  }

  try {
    const user = await userService.getUserWithDetails(userId);
    if (!user) {
      await ctx.reply('User not found.');
      return;
    }

    const message =
      `User Details:\n\n` +
      `ID: ${user.id}\n` +
      `Telegram ID: ${user.telegramId}\n` +
      `Full Name: ${user.firstName} ${user.lastName}\n` +
      `Username: ${user.username}\n` +
      `Created: ${user.createdAt}\n\n` +
      `Registration: ${user.registration ? 'Yes' : 'No'}\n` +
      `Training: ${user.training ? 'Yes' : 'No'}\n` +
      `Job Application: ${user.jobApplications.length > 0 ? 'Yes' : 'No'}`;

    await ctx.reply(message);
  } catch (error) {
    logger.error('Error fetching user details:', error);
    await ctx.reply('Error fetching user details.');
  }
};

export const handleAdminApprove = async (ctx: Context) => {
  if (!isAdmin(ctx.from?.id)) return;

  const args = ctx.message?.text?.split(' ');
  if (!args || args.length < 3) {
    await ctx.reply('Usage: /admin_approve <type> <id>');
    return;
  }

  const type = args[1].toLowerCase();
  const id = args[2];

  try {
    switch (type) {
      case 'registration':
        await userService.updateRegistrationStatus(id, 'APPROVED');
        await ctx.reply('Registration approved successfully.');
        break;
      case 'training':
        await userService.updateTrainingStatus(id, 'APPROVED');
        await ctx.reply('Training registration approved successfully.');
        break;
      case 'job':
        await userService.updateJobApplicationStatus(id, 'approved');
        await ctx.reply('Job application approved successfully.');
        break;
      default:
        await ctx.reply('Invalid type. Use: registration, training, or job');
    }
  } catch (error) {
    logger.error('Error approving application:', error);
    await ctx.reply('Error approving application.');
  }
};

export const handleAdminReject = async (ctx: Context) => {
  if (!isAdmin(ctx.from?.id)) return;

  const args = ctx.message?.text?.split(' ');
  if (!args || args.length < 3) {
    await ctx.reply('Usage: /admin_reject <type> <id>');
    return;
  }

  const type = args[1].toLowerCase();
  const id = args[2];

  try {
    switch (type) {
      case 'registration':
        await userService.updateRegistrationStatus(id, 'REJECTED');
        await ctx.reply('Registration rejected successfully.');
        break;
      case 'training':
        await userService.updateTrainingStatus(id, 'REJECTED');
        await ctx.reply('Training registration rejected successfully.');
        break;
      case 'job':
        await userService.updateJobApplicationStatus(id, 'rejected');
        await ctx.reply('Job application rejected successfully.');
        break;
      default:
        await ctx.reply('Invalid type. Use: registration, training, or job');
    }
  } catch (error) {
    logger.error('Error rejecting application:', error);
    await ctx.reply('Error rejecting application.');
  }
};

export const listPendingPayments = async (ctx: Context) => {
  try {
    const registrations = await userService.getPendingPayments();
    const trainingPayments = await userService.getPendingTrainingPayments();

    if (registrations.length === 0 && trainingPayments.length === 0) {
      await ctx.reply('No pending payments to review.');
      return;
    }

    // Show registration payments
    for (const reg of registrations) {
      const message =
        `<b>📝 Registration Payment Pending Review</b>\n\n` +
        `<code>ID: ${reg.id}</code>\n` +
        `👤 User: ${reg.user.firstName || ''} ${reg.user.lastName || ''}\n` +
        `🔗 Username: @${reg.user.username || 'N/A'}\n` +
        `💳 Payment Method: ${reg.paymentMethod}\n` +
        `📄 Payment Proof: ${reg.paymentProof}\n` +
        `⏰ Submitted: ${reg.updatedAt.toLocaleString()}\n\n` +
        `✅ <code>/approve_payment ${reg.id}</code>\n` +
        `❌ <code>/reject_payment ${reg.id}</code>`;

      await ctx.reply(message, { parse_mode: 'HTML' });
    }

    // Show training payments
    for (const training of trainingPayments) {
      const user = training.user;
      let paymentProofInfo = '';
      if (training.paymentMethod === 'ft') {
        paymentProofInfo = `• FT Number: <code>${training.paymentProof || 'N/A'}</code>`;
      } else if (training.paymentMethod === 'receipt') {
        paymentProofInfo = training.paymentProof
          ? `• Receipt File ID: <code>${training.paymentProof}</code>`
          : '• Receipt: N/A';
      } else {
        paymentProofInfo = '• Payment Proof: N/A';
      }

      const message = `
<b>🎓 Training Payment Pending Review</b>

<b>📝 Registration Details:</b>
• ID: <code>${training.id}</code>
• User: ${user.firstName || ''} ${user.lastName || ''}
• Username: @${user.username || 'N/A'}
• Payment Method: ${training.paymentMethod || 'N/A'}
${paymentProofInfo}

<b>💳 Payment Details:</b>
• Status: ${training.isPaid ? 'Paid' : 'Pending'}
• Method: ${training.paymentMethod || 'N/A'}

<b>📋 Training Details:</b>
• Courses: ${training.courses.join(', ')}
• Online Training: ${training.onlineTraining.join(', ')}

<b>🛠 Commands:</b>
• Approve: <code>/approve_training_payment ${training.id}</code>
• Reject: <code>/reject_training_payment ${training.id}</code>
`;
      await ctx.reply(message, { parse_mode: 'HTML' });
    }
  } catch (error) {
    logger.error('Error listing pending payments:', error);
    await ctx.reply('Error fetching pending payments.');
  }
};

export const approvePayment = async (ctx: Context) => {
  try {
    const registrationId = ctx.message?.text?.split(' ')[1];
    if (!registrationId) {
      await ctx.reply('Please provide a registration ID: /approve_payment <id>');
      return;
    }

    // Get the registration before approving to get user details
    const registration = await userService.getRegistrationById(registrationId);
    if (!registration) {
      await ctx.reply('Registration not found.');
      return;
    }

    // Approve the payment
    await userService.approvePayment(registrationId);

    // Notify the user
    const userMessage =
      `✅ *Payment Verified!*\n\n` +
      `Your payment has been verified and your registration is now complete.\n\n` +
      `Thank you for registering with us!`;

    await ctx.api.sendMessage(Number(registration.user.telegramId), userMessage, {
      parse_mode: 'Markdown',
    });

    // Confirm to admin
    await ctx.reply('Payment approved successfully and user has been notified.');
  } catch (error) {
    logger.error('Error approving payment:', error);
    await ctx.reply('Error approving payment.');
  }
};

export const rejectPayment = async (ctx: Context) => {
  try {
    const registrationId = ctx.message?.text?.split(' ')[1];
    if (!registrationId) {
      await ctx.reply('Please provide a registration ID: /reject_payment <id>');
      return;
    }

    await userService.rejectPayment(registrationId);
    const userMessage = `
❌ *Payment Rejected*

Your registration payment has been rejected. Please contact support for assistance.
`;
    await ctx.reply(userMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('Error rejecting payment:', error);
    await ctx.reply('Error rejecting payment.');
  }
};

export const getMyId = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.reply(
    `Your Telegram ID is: ${userId}\n\n` +
      `To make yourself an admin:\n` +
      `1. Copy this ID\n` +
      `2. Open your .env file\n` +
      `3. Add or update ADMIN_IDS like this:\n` +
      `ADMIN_IDS=your_id_here\n` +
      `4. Restart your bot\n\n` +
      `After that, you can use /start_admin to access the admin panel.`,
  );
};

export const handleAdmin = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (!isAdmin(userId)) {
    await ctx.reply('⛔ You are not authorized to use admin commands.');
    return;
  }

  await ctx.reply(
    '👋 Welcome to Admin Panel!\n\n' +
      'Available commands:\n' +
      '📋 /list_pending_payments - View pending payments\n' +
      '✅ /approve_payment <id> - Approve a payment\n' +
      '❌ /reject_payment <id> - Reject a payment\n' +
      // '👥 /admin_registrations - View all registrations\n' +
      // '📚 /admin_trainings - View all training registrations\n' +
      // '💼 /admin_jobs - View all job applications\n' +
      // '👤 /admin_user <user_id> - View specific user details\n' +
      '🆔 /getmyid - Get your Telegram ID',
  );
};

// Update the isAdmin function to be more secure and add logging
function isAdmin(userId?: number): boolean {
  if (!userId) return false;

  const adminIds =
    process.env.ADMIN_IDS?.split(',')
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id)) || [];

  logger.info('Admin check:', {
    userId,
    adminIds,
    isAdmin: adminIds.includes(userId),
    rawAdminIds: process.env.ADMIN_IDS,
  });

  return adminIds.includes(userId);
}

// Add to adminCommands array
const adminCommands = [
  // ... existing commands ...
  {
    command: 'list_pending_training_payments',
    description: 'List all pending training payments',
    handler: listPendingTrainingPayments,
  },
  {
    command: 'approve_training_payment',
    description: 'Approve a training payment',
    handler: approveTrainingPayment,
  },
  {
    command: 'reject_training_payment',
    description: 'Reject a training payment',
    handler: rejectTrainingPayment,
  },
];

// Add new functions for training payment management
export async function listPendingTrainingPayments(ctx: Context) {
  try {
    const pendingPayments = await userService.getPendingTrainingPayments();
    if (pendingPayments.length === 0) {
      await ctx.reply('No pending training payments found.');
      return;
    }

    for (const training of pendingPayments) {
      const user = training.user;
      let paymentProofInfo = '';
      if (training.paymentMethod === 'ft') {
        paymentProofInfo = `• FT Number: <code>${training.paymentProof || 'N/A'}</code>`;
      } else if (training.paymentMethod === 'receipt') {
        paymentProofInfo = training.paymentProof
          ? `• Receipt File ID: <code>${training.paymentProof}</code>`
          : '• Receipt: N/A';
      } else {
        paymentProofInfo = '• Payment Proof: N/A';
      }
      const message = `
<b>🎓 Training Payment Pending Review</b>

<b>📝 Registration Details:</b>
• ID: <code>${training.id}</code>
• User: ${user.firstName || ''} ${user.lastName || ''}
• Username: @${user.username || 'N/A'}
• Payment Method: ${training.paymentMethod || 'N/A'}
${paymentProofInfo}

<b>💳 Payment Details:</b>
• Status: ${training.isPaid ? 'Paid' : 'Pending'}
• Method: ${training.paymentMethod || 'N/A'}

<b>📋 Training Details:</b>
• Courses: ${training.courses.join(', ')}
• Online Training: ${training.onlineTraining.join(', ')}

<b>🛠 Commands:</b>
• Approve: <code>/approve_training_payment ${training.id}</code>
• Reject: <code>/reject_training_payment ${training.id}</code>
`;
      await ctx.reply(message, { parse_mode: 'HTML' });
    }
  } catch (error) {
    logger.error('Error listing pending training payments:', error);
    await ctx.reply('Error listing pending training payments.');
  }
}

export async function approveTrainingPayment(ctx: Context) {
  try {
    const args = ctx.message?.text?.split(' ');
    if (!args || args.length !== 2) {
      await ctx.reply('Please provide a training ID: /approve_training_payment <id>');
      return;
    }

    const trainingId = args[1];
    const training = await userService.getTrainingById(trainingId);

    if (!training) {
      await ctx.reply('Training registration not found.');
      return;
    }

    logger.info('Approving training payment:', { trainingId, userId: training.user.telegramId });

    // Approve the payment
    await userService.approveTrainingPayment(trainingId);

    // Notify the user
    const userMessage = `
✅ *Payment Verified!*

Your training payment has been verified and your registration is now complete.

Thank you for registering with us!
`;

    logger.info('Sending approval message to user:', {
      telegramId: training.user.telegramId,
      message: userMessage,
    });

    await ctx.api.sendMessage(Number(training.user.telegramId), userMessage, {
      parse_mode: 'Markdown',
    });

    logger.info('Approval message sent successfully');
    await ctx.reply('Training payment approved successfully and user has been notified.');
  } catch (error) {
    logger.error('Error approving training payment:', error);
    await ctx.reply('Error approving training payment.');
  }
}

export async function rejectTrainingPayment(ctx: Context) {
  try {
    const args = ctx.message?.text?.split(' ');
    if (!args || args.length !== 2) {
      await ctx.reply('Please provide a training ID: /reject_training_payment <id>');
      return;
    }

    const trainingId = args[1];
    const training = await userService.getTrainingById(trainingId);

    if (!training) {
      await ctx.reply('Training registration not found.');
      return;
    }

    logger.info('Rejecting training payment:', { trainingId, userId: training.user.telegramId });

    // Reject the payment
    await userService.rejectTrainingPayment(trainingId);

    // Notify the user
    const userMessage = `
❌ *Payment Rejected*

Your training payment has been rejected. Please contact support for assistance.
`;

    logger.info('Sending rejection message to user:', {
      telegramId: training.user.telegramId,
      message: userMessage,
    });

    await ctx.api.sendMessage(Number(training.user.telegramId), userMessage, {
      parse_mode: 'Markdown',
    });

    logger.info('Rejection message sent successfully');
    await ctx.reply('Training payment rejected and user has been notified.');
  } catch (error) {
    logger.error('Error rejecting training payment:', error);
    await ctx.reply('Error rejecting training payment.');
  }
}
