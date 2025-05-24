import { Context } from 'grammy';

export const helpCommand = async (ctx: Context) => {
  await ctx.reply(
    'Available commands:\n\n' +
      '/register - Start registration process\n' +
      '/training - Register for training\n' +
      '/job - Apply for a job\n' +
      '/help - Show this help message',
  );
};
