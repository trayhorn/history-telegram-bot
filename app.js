import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import cron from "node-cron";

const { BOT_TOKEN: token, API_KEY } = process.env;

axios.defaults.baseURL = "https://api.example.com";
axios.defaults.headers.common["X-Api-Key"] = API_KEY;

let task;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "What are we doing today?", {
		reply_markup: {
			keyboard: [["Random fact"], ["Schedule fact", "Cancel scheduling"]],
			one_time_keyboard: false,
			is_persistent: true,
		},
	});
});

bot.onText(/^\s*Schedule fact\s*$/i, (msg) => {
	const chatId = msg.chat.id;

	task = cron.schedule(
		"*/10 * * * * *",
		() => {
			axios.get("https://history.muffinlabs.com/date").then(({ data }) => {
				if (data.data.Events.length > 0) {
					const randomFact =
						data.data.Events[
							Math.floor(Math.random() * data.data.Events.length)
						];
					const response = `
            <b>Year:</b> ${randomFact.year}
            \n<b>Event:</b> ${randomFact.text}
            \n<b>Links:</b> ${randomFact.links
							.map(({ link, title }) => {
								return `<a href="${link}">${title}</a>`;
							})
							.join(", ")}`;

					bot.sendMessage(chatId, response, { parse_mode: "HTML" });
				} else {
					bot.sendMessage(chatId, "Nothing found.");
				}
			});
		},
		{ scheduled: true, timezone: "Europe/Kyiv" }
	);
});

bot.onText(/^\s*Cancel scheduling\s*$/i, async (msg) => {
	const chatId = msg.chat.id;

	if (task) {
		bot.sendMessage(chatId, "Scheduled task cancelled.");
		await task.destroy();
		task = null;
	} else {
		bot.sendMessage(chatId, "No scheduled task to cancel.");
	}
});

bot.onText(/^\s*Random fact\s*$/i, async (msg) => {
  const chatId = msg.chat.id;

  const { data } = await axios.get("https://api.api-ninjas.com/v1/facts");
  const response = data[0].fact;
  bot.sendMessage(chatId, response);
})