const TelegramBot = require('node-telegram-bot-api');
async function messageSenderToTelegram(tg_group_id, message) {
    const bot_token = process.env.BOT_TOKEN;
    const bot = new TelegramBot(bot_token, { polling: false });
    try {
        await bot.sendMessage(tg_group_id, message, { parse_mode: "HTML" });
        console.log("Bot sent new vacancy to Telegram group successfully!");
    } catch (error) {
        console.error('Error:', error.message);
    }
}
module.exports = {messageSenderToTelegram};
