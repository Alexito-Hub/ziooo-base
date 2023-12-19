const {
     default: makeWASocket,
     makeInMemoryStore,
     useMultiFileAuthState,
     generateWAMessageFromContent,
     makeCacheableSignalKeyStore
 } = require("@whiskeysockets/baileys")

const pino = require("pino")
const { format } = require('util')
const { exec } = require("child_process")
const cfonts = require("cfonts")
const banner = cfonts.render("I'm ziooo", {
    font: "simple",
    align: "center",
    gradient: [ "#00f",blueBright ]
})
const copyright = cfonts.render("All rights reserved|@zio", {
    font: "console",
    align: "center",
    gradient: [ "#00f",bluebright ]
})

exports.connect = async () => {
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" })})
    console.log(banner, '\n', copyright)
    const { state, saveCreds } = await useMultiFileAuthState('./auth/session')
    
    const sock = makeWASocket({
        logger : pino({ level : "silent" }),
        auth : state,
        browser: ["FireFox (linux)"],
        printQRInTerminal: true
    })

    sock.ev.on("connection.update", v => {
        const { connection, lastDisconnect } = v
        
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Error en la conexión ', lastDisconnect.error, ', Reconectando ', shouldReconnect)
            if(shouldReconnect) {
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
            console.log("Bot está en línea")
        }
    })
    
    sock.ev.on("creds.update", saveCreds)

    store.bind(sock.ev)
    return sock
}