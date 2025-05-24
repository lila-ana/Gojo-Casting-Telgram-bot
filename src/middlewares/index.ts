import { Bot } from 'grammy';
import { logger } from '../utils/logger';

export const setupMiddlewares = (bot: Bot): void => {
  // Log all updates
  bot.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date().getTime() - start.getTime();
    logger.info(`${ctx.update.update_id} - ${ms}ms`);
  });

  // Add more middlewares here as needed
}; 