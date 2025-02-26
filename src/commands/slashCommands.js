const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async (client) => 
{
    const commands = [];

    const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'slashCommands.js');

    for (const file of commandFiles) 
    {
        const command = require(path.join(__dirname, file));
        if (command.data) 
        {
            commands.push(command.data.toJSON());
        }
    }

    const guildId = "670287210498752524";
    const guild = await client.guilds.fetch(guildId);

    await guild.commands.set(commands);
    console.log(`✅ Registered ${commands.length} slash commands!`);
};