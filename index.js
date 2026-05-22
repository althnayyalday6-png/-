require("dotenv").config();
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

const config = require("./config");
require("./server");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!setup") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎫 فتح تذكرة")
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      content: "اضغط الزر لفتح تذكرة:",
      components: [row]
    });
  }
});
