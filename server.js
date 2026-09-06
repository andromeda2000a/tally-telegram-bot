const express = require("express");

const app = express();

app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Проверяем, что переменные добавлены в Render
if (!BOT_TOKEN || !CHAT_ID) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены");
}

// Главная страница
app.get("/", (req, res) => {
  res.send("Tally Telegram webhook is running");
});

// Webhook от Tally
app.post("/tally", async (req, res) => {
  try {
    console.log("New Tally submission:");
    console.log(JSON.stringify(req.body, null, 2));

    const data = req.body;

    // Собираем информацию из ответа Tally
    let message = "🆕 НОВАЯ АНКЕТА\n\n";

    // Временный вариант:
    // отправляем весь полученный JSON,
    // чтобы сначала посмотреть точную структуру Tally.
    message += "📋 Данные анкеты:\n\n";
    message += JSON.stringify(data, null, 2);

    // Telegram ограничивает сообщение 4096 символами
    if (message.length > 4000) {
      message = message.substring(0, 4000) + "\n\n…";
    }

    const telegramUrl =
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram error:", result);
      return res.status(500).json({
        success: false,
        error: "Telegram error"
      });
    }

    console.log("Telegram message sent successfully");

    // Сообщаем Tally, что webhook успешно обработан
    res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Webhook error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
