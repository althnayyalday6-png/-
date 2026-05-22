require("dotenv").config();
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  require("./server");
});
client.on("messageCreate", async (message) => {
  if (message.content === "!setup") {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("فتح تذكرة")
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({
      content: "🎫 اضغط لفتح تذكرة",
      components: [row]
    });
  }
});
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "open_ticket") {

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
        .setLabel("تغيير نوع التذكرة")
        .setStyle(ButtonStyle.Secondary)
    );

    channel.send({
      content: "📩 تم فتح التذكرة",
      components: [row]
    });

    interaction.reply({ content: "تم فتح التذكرة", ephemeral: true });
  }
});
client.on("interactionCreate", async (interaction) => {

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
      content: "🔄 اختر النوع الجديد",
      components: [row],
      ephemeral: true
    });
  }

});
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "select_category") {

    const type = interaction.values[0];

    const channel = interaction.channel;

    await channel.setParent(config.categories[type]);

    await channel.setName(`${type}-${interaction.user.username}`);

    interaction.update({
      content: "✅ تم تحويل التذكرة وتحديثها",
      components: []
    });
  }
});