import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const { BOT_TOKEN: token, API_KEY } = process.env;

axios.defaults.baseURL = "https://api.example.com";
axios.defaults.headers.common["X-Api-Key"] = API_KEY;


const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === "/start") {
		bot.sendMessage(chatId, "Hey, what fact are we fetching?");
  }

  const url = `https://api.api-ninjas.com/v1/historicalevents?text=${text}`;
  axios.get(url)
    .then(({data}) => {
      if (data.length > 0) {
        const response = data[0].event;
        bot.sendMessage(chatId, response);
      } else {
        bot.sendMessage(chatId, "Нічого не знайдено.");
      }
    })
});
