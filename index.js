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

const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(3000, () => console.log("Server running"));

const config = {
  categories: {
    support: "1506020715625713844",
    orders: "1506046196806844547",
    info: "1506019269341745345",
    problem: "1506020214729605250"
  }
};

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

client.on("interactionCreate", async (interaction) => {

  // فتح التذكرة
  if (interaction.isButton() && interaction.customId === "open_ticket") {

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("move_ticket")
        .setLabel("🔄 تغيير نوع التذكرة")
        .setStyle(ButtonStyle.Secondary)
    );

    channel.send({
      content: "تم فتح التذكرة 🎫",
      components: [row]
    });

    return interaction.reply({ content: "تم فتح التذكرة", ephemeral: true });
  }

  // زر تغيير النوع
  if (interaction.isButton() && interaction.customId === "move_ticket") {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("select_category")
      .setPlaceholder("اختر نوع التذكرة")
      .addOptions([
        { label: "استفسار", value: "info" },
        { label: "شراء", value: "orders" },
        { label: "مشكلة", value: "problem" },
        { label: "دعم", value: "support" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      content: "اختر النوع الجديد:",
      components: [row],
      ephemeral: true
    });
  }

  // نقل التذكرة وتغيير نوعها
  if (interaction.isStringSelectMenu() && interaction.customId === "select_category") {

    const type = interaction.values[0];
    const channel = interaction.channel;

    await channel.setParent(config.categories[type]);
    await channel.setName(`${type}-${interaction.user.username}`);

    return interaction.update({
      content: "تم تحويل التذكرة بنجاح ✅",
      components: []
    });
  }
});

client.login(process.env.TOKEN);
