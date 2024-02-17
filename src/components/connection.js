/* *******************************************************************************************************************
   *
   *    -- CREADO POR ZIOOO --      
   *
   *    IG : im._ziooo
   *    GITHUB : Alexito-Hub
   *
   *    -- PARA USAR --        
   *    $ git clone https://github.com/Alexito-Hub/ziooo-base.git
   *    $ npm install
   *    $ npm start
   *
   *    ¿tienes problemas? Contáctanos
   *    +1 (347) 666-5855
   *    +51 968 374 620
   *
   *******************************************************************************************************************/

require("../database")
const {
     default: WAConnection,
     DisconnectReason,
     makeInMemoryStore,
     useMultiFileAuthState,
     getContentType,
 } = require("@whiskeysockets/baileys")

const fs = require("fs")
const pino = require("pino")
const cli = require("cli-color");
const { format } = require('util')
const { exec } = require("child_process")

const color = (text, color) => {
    return color ? cli[color](text) : cli.bold(text);
};
const utils = require("../../lib/utils")
const font = require("../../lib/font")
const banner = font.banner();
const copyright = font.copyright();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.connect = async (start) => {
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" })})
    const spinner = font.getGlobalSpinner();
    const sessionExists = await fs.promises.access('./auth/session').then(() => true).catch(() => false);

    await utils.statusSession(spinner, sessionExists);
    await sleep(4000)
    const { state, saveCreds } = await useMultiFileAuthState('./auth/session')
    const sock = WAConnection({
        logger : pino({ level : "silent" }),
        auth : state,
        browser: ["Base Ziooo", "Firefox", "3.0.0"],
        printQRInTerminal: true
    })
    
    sock.ev.on("connection.update", m => {
        const { connection, lastDisconnect } = m
        
        if (connection === "close") {
            const reconect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Error en la conexión ', lastDisconnect.error, 'Reconectando', reconect)
            if(reconect) {
                start()
            } else {
                exec("rm -rf session", (err, stdout, stderr) => {
                    if (err) {
                        console.error("Error al eliminar el archivo de sesión:", err)
                    } else {
                        console.error("Conexión con WhatsApp cerrada. Escanee nuevamente el código QR!")
                        start()
                    }
                })
            }
        } else if (connection === "open") {
            const progress = font.progressBar(5000);
            console.log(progress, copyright)
        }
    })
    
    sock.ev.on("creds.update", saveCreds)

    sock.ev.on('group-participants.update', async (update) => {
	    const groupId = update.id
	    const participants = update.participants;
	    const action = update.action;
	    const metadata = await sock.groupMetadata(groupId);
	    const groupName = metadata.subject
        const ing = [
            "120363212722789717@g.us",
            "120363205514266007@g.us",
            "120363183824931603@g.us"
        ];

        if (ing.includes(groupId)) {
            return;
        }

	    for (const participant of participants) {
	        const user = participant.split('@')[0];
	        if (action === 'add') {
	            sock.sendMessage(groupId, {
	                text:`¡Bienvenido, *@${user}⁩*! 🌠

Kaori está emocionado por tenerte en *${groupName}.* Si quieres explorar los comandos de Kaori, usa *.menu* en cualquier momento. ¡Disfruta tu estancia! 🤖`,
	                contextInfo: {
	                    mentionedJid: [participant],
	                    remoteJid: [groupId],
	                    externalAdReply: {
	                        title: `${groupName}`,
	                        renderLargerThumbnail: true, 
	                        mediaType: 1,
	                        thumbnailUrl: 'https://telegra.ph/file/2071468c407a3c3e7f759.jpg',
	                    }
	                }
	            })
	        } /* else if (action === 'remove') {
	            sock.sendMessage(groupId, {
	                text:`¡Adiós, *@${user}⁩*! 🌠

Lamentamos ver tu partida del grupo ${groupName}. Siempre serás bienvenido/a de regreso si decides volver. ¡Hasta pronto y te deseamos lo mejor!`,
	                contextInfo: {
	                    mentionedJid: [participant],
	                    remoteJid: [groupId],
	                    externalAdReply: {
	                        title: `${groupName}`,
	                        renderLargerThumbnail: true, 
	                        mediaType: 1,
	                        thumbnailUrl: 'https://telegra.ph/file/2071468c407a3c3e7f759.jpg',
	                    }
	                }
	            })
	        } */
	    }
	})

    sock.ev.on('messages.upsert', messages => {
		messages = messages.messages[0]
		if (!messages) return
		
		messages.message = (getContentType(messages.message) === 'ephemeralMessage') ? messages.message.ephemeralMessage.message : messages.message
		if (messages.key && messages.key.remoteJid === 'status@broadcast') return
		
		require('./loader')(sock, messages)
	})

    store.bind(sock.ev)
    return sock
}