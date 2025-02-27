const { SlashCommandBuilder } = require('discord.js');
const { taskQueue } = require('../events/utils/queue');

module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('pong')
        .setDescription('Replies with Ping!'),
    
    async execute(interaction) 
    {
        await taskQueue.add("pongCommand", { user: interaction.user.id });
        await interaction.reply({ content: "🏓 Ping! (Processing in background...)", ephemeral: true });
    }
};