const express = require("express");

const app = express();

app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    const submission = req.body;
    const data = submission.data;

    console.log("New Tally submission received");

    // Начинаем формировать красивое сообщение
    let message = "🆕 НОВАЯ АНКЕТА\n\n";

    // Получаем вопросы и ответы
    if (data && Array.isArray(data.fields)) {
      for (const field of data.fields) {
        const label = field.label || "Без названия";
        const value = field.value ?? "—";

        message += `👤 ${label}\n`;
        message += `${value}\n\n`;
      }
    }

    // Время заполнения
    if (data && data.createdAt) {
      const date = new Date(data.createdAt);

      message += `🕐 Заполнено: ${date.toLocaleString("ru-RU", {
        timeZone: "Europe/Warsaw"
      })}\n\n`;
    }

    // Ссылка на просмотр заявки в Tally
    if (data && data.submissionPreviewUrl) {
      message += `🔗 Открыть заявку:\n${data.submissionPreviewUrl}`;
    }

    // Отправляем сообщение в Telegram
    const telegramUrl =
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        disable_web_page_preview: true
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
