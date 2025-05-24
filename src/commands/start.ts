import { Context } from 'grammy';

export const StartCommand = async (ctx: Context) => {
  await ctx.reply(
    '*Welcome to Gojo Casting Service Provider! 👋*\n\n' +
      '*🎬 ጎጆ ካስቲንግ በተለያዩ የኢንተርቴመንት ስራዎች የእረጅም ጊዜ ልምድን ያካበተ ድርጅት ነው:: አብረውን ለመስራት ስለመረጡን እናመሰግናለን\n\n' +
      'ለስልጠና እና ለስራዎች እኛ ጋር በመመዝገብ የስራ ባለቤት ይሁኑ*\n\n' +
      '*Available commands:*\n\n' +
      '📝 /register - Start registration process\n' +
      '🎓 /training - Register for training\n' +
      '💼 /job - Apply for a job\n' +
      '❓ /help - Show this help message',
    { parse_mode: 'Markdown' },
  );
};
