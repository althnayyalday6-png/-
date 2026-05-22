const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Ticket Bot is running");
});

app.listen(3000, () => {
  console.log("Server is alive");
});