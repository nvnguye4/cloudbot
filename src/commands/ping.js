const { SlashCommandBuilder} = require('discord.js');
const { taskQueue } = require('../events/utils/queue');

module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    
    async execute(interaction) 
    {
        await interaction.reply({content: "🏓 Pong! (Processing in background...)" , ephemeral: true});
        await taskQueue.add("pingCommand", { user: interaction.user.id });

    }
};