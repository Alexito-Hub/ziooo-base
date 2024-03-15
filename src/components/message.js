require("./config")
const fs = require('fs')
const util = require('util')

const { Json, removeAccents } = require('../../lib/functions')

const { client, sms } = require('../../lib/simple')

module.exports = async(sock, m, store) => {
    try {
        sock = client(sock)
        v = await sms(sock, m)

        if (!m.body) return;
        const prefix = global.prefix
        const isCmd = m.body.startsWith(prefix)
        const command = isCmd ? removeAccents(m.body.slice(prefix.length)).trim().split(' ').shift().toLowerCase() : ''
        
        const args = m.body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const senderNumber = m.sender.split('@')[0]
        const botNumber = sock.user.id.split(':')[0]
        
        const groupMetadata = m.isGroup ? await sock.groupMetadata(v.chat) : {}
        const groupMembers = m.isGroup ? groupMetadata.participants : []
        const groupAdmins = m.isGroup ? sock.getGroupAdmins(groupMembers) : false
        
        const isMe = (botNumber == senderNumber)
        const isBotAdmin = m.isGroup ? groupAdmins.includes(botNumber + '@s.whatsapp.net') : false
        const isOwner = owner.includes(senderNumber) || isMe
        const isStaff = staff.includes(senderNumber) || isOwner
        
        const isMedia = (m.type === 'imageMessage' || m.type === 'videoMessage')
        const isQuotedMsg = m.quoted ? (m.quoted.type === 'conversation') : false
        const isQuotedImage = m.quoted ? (m.quoted.type === 'imageMessage') : false
        const isQuotedVideo = m.quoted ? (m.quoted.type === 'videoMessage') : false
        const isQuotedSticker = m.quoted ? (m.quoted.type === 'stickerMessage') : false
        const isQuotedAudio = m.quoted ? (m.quoted.type === 'audioMessage') : false
    
        switch (command) {
            
            case 'zio':
            v.reply('Hola, soy un bot creado con la Base de Zioo')
            break
            
            default:
                if (isOwner) {
                    if (v.body.startsWith('>')) {
                        if (q.trim().length > 0) {
                            await v.reply('*< processing... >*');
                            try {
                                await sock.sendMessage(m.chat, { text : Json(eval(q)) }, { quoted : m })
                            } catch(e) {
                                await sock.sendMessage(m.chat, { text : String(e) }, { quoted : m })
                            }
                            
                        } else {
                            await v.reply('*< There is nothing to process... >*');
                        }
                    }
                }
        }

    } catch (e) {
        console.log(e)
    }
}