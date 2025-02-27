require('dotenv').config();
const { Client, Events , GatewayIntentBits , SlashCommandBuilder} = require('discord.js');
const { taskQueue } = require('./events/utils/queue');
const fs = require('fs');
const path = require('path');
const token = process.env.BOT_TOKEN;

const client = new Client
({ 
        intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMessages , GatewayIntentBits.MessageContent] 
});

const eventsPath = path.join(__dirname, 'events', 'client');

fs.readdirSync(eventsPath).forEach(file => 
{
    const event = require(path.join(eventsPath, file));

    if (event.once) 
    {
        client.once(event.name, (...args) => event.execute(...args, client));
    } 
    else 
    {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
});

const loadSlashCommands = require('./commands/slashCommands');

client.once(Events.ClientReady , async () =>
{
        console.log(`✅ Logged in as ${client.user.tag}`)
        await loadSlashCommands(client);
});

client.on(Events.InteractionCreate , async interaction =>
{
    if(!interaction.isCommand()) return;

    const commandFile = path.join(__dirname, 'commands', `${interaction.commandName}.js`);

    if (!fs.existsSync(commandFile)) 
    {
        await interaction.reply({ content: "❌ Command not found!", ephemeral: true });
        return;
    }

    const command = require(commandFile);
    try {
        await taskQueue.add("commandExecution", { command: interaction.commandName, user: interaction.user.id });
        await interaction.reply({ content: `⏳ Processing command \`${interaction.commandName}\`...`, ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ There was an error executing this command!", ephemeral: true });
    }
});

client.login(token);
