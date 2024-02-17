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
const { exec } = require("child_process")


const utils = require("../../lib/utils")
const font = require("../../lib/font")

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
            const copyright = font.copyright();
            const progress = font.progressBar(5000);
            console.log(progress, copyright)
        }
    })
    
    sock.ev.on("creds.update", saveCreds)

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