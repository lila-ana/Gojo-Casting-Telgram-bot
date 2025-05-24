import { Bot, Context } from 'grammy';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const setupHandlers = (bot: Bot): void => {
  // Start command
  bot.command('start', async (ctx: Context) => {
    if (ctx.from) {
      // Store or update user in database
      await userService.createOrUpdateUser(ctx.from);
      await ctx.reply('Welcome to the bot! 👋');
    }
  });

  // Help command
  bot.command('help', async (ctx: Context) => {
    await ctx.reply('Here are the available commands:\n/start - Start the bot\n/help - Show this help message');
  });

  // Handle text messages
  bot.on('message:text', async (ctx: Context) => {
    if (ctx.from) {
      // Store user and message in database
      const user = await userService.createOrUpdateUser(ctx.from);
      await userService.createMessage(user.id, ctx.message.text, 'text');
      await ctx.reply('I received your message!');
    }
  });

  // Handle settings command
  bot.command('settings', async (ctx: Context) => {
    if (ctx.from) {
      const user = await userService.createOrUpdateUser(ctx.from);
      const settings = await userService.getUserSettings(user.id);
      
      const message = settings
        ? `Your current settings:\nNotifications: ${settings.notifications}\nTimezone: ${settings.timezone}`
        : 'No settings found. Use /settimezone to set your timezone.';
      
      await ctx.reply(message);
    }
  });

  // Handle timezone setting
  bot.command('settimezone', async (ctx: Context) => {
    if (ctx.from) {
      const timezone = ctx.message.text.split(' ')[1];
      if (!timezone) {
        await ctx.reply('Please provide a timezone. Example: /settimezone UTC');
        return;
      }

      const user = await userService.createOrUpdateUser(ctx.from);
      await userService.updateUserSettings(user.id, { timezone });
      await ctx.reply(`Timezone set to ${timezone}`);
    }
  });
}; 