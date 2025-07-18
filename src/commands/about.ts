import { Context } from 'grammy';

export const aboutCommand = async (ctx: Context) => {
  const aboutMessage = `

*እንኳን ወደ ጎጆ ካስቲንግ በደህና መጡ!* 

ጎጆ ካስቲንግ ፊልም ፕሮዳክሽን ኃላ/የተ/የግል/ማህበር በኢትዮጵያ የመዝናኛ እና የፊልም ኢንደስትሪ ላይ የተሰማሩ እንዲሁም መቀላቀል ለሚፈልጉ ባለሙያዎች የአጭር ጊዜ ስልጠና እና የስራ እድል በማመቻቸት በቀላሉ ከጎጆ ጋራ በመሆን የራሳቸውን ስራ የሚሰሩበትን ዓላማ የያዘ ተቋም ነው ።

"በጎጆ ሰልጥነው በጎጆ ስራ አግኝተው  በጎጆ ጎጆ ይስሩ"

*የመገናኛ መረጃ:*
📞 ስልክ: +251 914809000
📧 ኢሜይል: gojocasting@gmail.com
🌐 ድህረ ገጽ: https://gojocasting.com/
📍 አድራሻ: 4 ኪሎ አብርሆት ላይብረሪ አከባቢ፣ ኢክላስ ህንጻ 1ኛ ፎቅ 108፣ አዲስ አበባ፣ ኢትዮጵያ 

በተሰጥኦዎች ማህበረሰባችን ውስጥ ይቀላቀሉ እና ከጎጆ ካስቲንግ ጋር ሥራዎን ወደ ቀጣዩ ደረጃ ያምጡ! 

ከእኛ ጋር ጉዞዎን ለመጀመር /register ይጠቀሙ!`;

  await ctx.reply(aboutMessage, { parse_mode: 'Markdown' });
};
