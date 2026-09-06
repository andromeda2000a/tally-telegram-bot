const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tally Telegram webhook is running");
});

app.post("/tally", (req, res) => {
  console.log("New Tally submission:");
  console.log(JSON.stringify(req.body, null, 2));

  res.status(200).json({
    success: true
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
