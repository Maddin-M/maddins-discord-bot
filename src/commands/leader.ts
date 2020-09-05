import { Client, Message } from 'discord.js'
import { prefix } from '../config.json'
import { Request } from '../types'
import postgres from '../postgres'
import { defaultEmbed, leaderEmoji } from '../embed'
import { formatSeconds } from '../timeUtil'
import { getUsername } from '../cache'

const leader: Request = async (_bot: Client, _msg: Message, _args: string[]) => {

    const embed = defaultEmbed(`Voice Channel Leaderboard  ${leaderEmoji}`)
    embed.setFooter(`"${prefix}leader [Zahl]" eingeben, um weitere Seiten zu sehen`)

    isValidPage(_args) ? embed.setDescription(`Seite ${_args[1]}`) : embed.setDescription("Seite 1")
    const offset = isValidPage(_args) ? (Number(_args[1]) - 1) * 5 : 0

    const res = await postgres.query('SELECT ID, TOTAL_ONLINE_SECONDS FROM USERS ORDER BY TOTAL_ONLINE_SECONDS DESC LIMIT 5 OFFSET $1', [offset])

    if (res.rowCount === 0) return 'Leaderboard ist leer oder Seite existiert nicht!'

    for (let i = 0; i < res.rowCount; i++) {
        embed.addField(`${getLeaderPrefix(offset + i + 1)} ${getUsername(_bot, res.rows[i].id)}`, formatSeconds(res.rows[i].total_online_seconds))
    }

    return embed
}

function isValidPage(args: string[]): boolean {
    return args.length > 1 && !isNaN(Number(args[1])) && Number(args[1]) >= 1
}

function getLeaderPrefix(place: number): string {
    switch (place) {
        case 1: return '🥇'
        case 2: return '🥈'
        case 3: return '🥉'
        default: return `\`${place}.\``
    }
}

export default leader