const {
     default: WAConnection,
     useMultiFileAuthState,
     generateWAMessageFromContent,
     makeCacheableSignalKeyStore
 } = require("@whiskeysockets/baileys")

const pino = require("pino")

exports.connectWA = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const level = pino({ level: "silent"})
    const client = WAConnection({
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
                exec("rm -rf session")
                console.error("Conexión con WhatsApp cerrada, Escanee nuevamente el código qr!")
                start()
            }
        } else if (connection == "open") {
            console.log("Bot is Online")
        }
    })
    client.ev.on("creds.update", saveCreds)
    return client
}