const {
     default: makeWASocket,
     useMultiFileAuthState,
     generateWAMessageFromContent,
     makeCacheableSignalKeyStore
 } = require("@whiskeysockets/baileys")

const pino = require("pino")
const { exec } = require("child_process")

exports.connectWA = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const level = pino({ level: "silent"})
    const client = new makeWASocket({
        logger: level,
        printQRInTerminal: true,
        browser: [ "AlexitoBot", "Firefox", "3.0.0" ],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, level)
        }
    })

    client.ev.on("connection.update", v => {
        const { connection, lastDisconnect } = v
        
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== 401) {
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

    client.ev.on("creds.update", saveCreds)
    return client
}
