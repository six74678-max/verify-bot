const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} = require("discord.js");

const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(config.verifyChannelId).catch(() => null);
  if (!channel) return console.error("❌ Invalid verifyChannelId");

  const button = new ButtonBuilder()
    .setCustomId("verify_button")
    .setLabel("Verify")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    content: "Click **Verify** to start.",
    components: [row]
  });
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    /* ================= BUTTON ================= */
    if (interaction.isButton() && interaction.customId === "verify_button") {
      const modal = new ModalBuilder()
        .setCustomId("verify_modal")
        .setTitle("Verification");

      const ign = new TextInputBuilder()
        .setCustomId("ign")
        .setLabel("What is your IGN? (Minecraft Username)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const region = new TextInputBuilder()
        .setCustomId("region")
        .setLabel("What is your region? (EU, NA etc)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const recruiter = new TextInputBuilder()
        .setCustomId("recruiter")
        .setLabel("Who recruited you?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const server = new TextInputBuilder()
        .setCustomId("server")
        .setLabel("What server were you recruited on?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const sword = new TextInputBuilder()
        .setCustomId("sword")
        .setLabel("Best Sword tier? (LT1, HT2, LT4, N/A)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(ign),
        new ActionRowBuilder().addComponents(region),
        new ActionRowBuilder().addComponents(recruiter),
        new ActionRowBuilder().addComponents(server),
        new ActionRowBuilder().addComponents(sword)
      );

      return interaction.showModal(modal);
    }

    /* ================= MODAL ================= */
    if (interaction.isModalSubmit() && interaction.customId === "verify_modal") {
      const data = {
        ign: interaction.fields.getTextInputValue("ign"),
        region: interaction.fields.getTextInputValue("region"),
        recruiter: interaction.fields.getTextInputValue("recruiter"),
        server: interaction.fields.getTextInputValue("server"),
        sword: interaction.fields.getTextInputValue("sword")
      };

      const role = interaction.guild.roles.cache.get(config.verifiedRoleId);
      if (role) await interaction.member.roles.add(role);

      const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle("✅ New Verification")
          .setColor("Green")
          .addFields(
            { name: "User", value: `${interaction.user.tag}` },
            { name: "IGN", value: data.ign },
            { name: "Region", value: data.region },
            { name: "Recruited By", value: data.recruiter },
            { name: "Server", value: data.server },
            { name: "Sword Tier", value: data.sword }
          )
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      }

      return interaction.reply({
        content: "✅ You are now verified!",
        ephemeral: true
      });
    }
  } catch (err) {
    console.error("❌ Interaction Error:", err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ Something went wrong. Contact staff.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);