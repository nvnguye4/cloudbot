require('dotenv').config();
const { Client, Events , GatewayIntentBits , SlashCommandBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');
const token = process.env.BOT_TOKEN;

const client = new Client
({ 
        intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMessages , GatewayIntentBits.MessageContent] 
});

client.once(Events.ClientReady , async () =>
{
    console.log(`✅ Logged in as ${client.user.tag}`)

    const loadSlashCommands = require('./commands/slashCommands');
    await loadSlashCommands(client);
});

client.on(Events.InteractionCreate , async interaction =>
{
    if(!interaction.isCommand()) return;

    const command = require(`./commands/${interaction.commandName}.js`);

    if (!command) 
    {
        await interaction.reply({ content: "❌ Command not found!", ephemeral: true });
        return;
    }

    try 
    {
        await command.execute(interaction);
    } 
    catch (error) 
    {
        console.error(error);
        await interaction.reply({ content: "❌ There was an error executing this command!", ephemeral: true });
    }
});

client.login(token);
