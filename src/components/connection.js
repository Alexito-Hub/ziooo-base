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

const { banner, copyright, getGlobalSpinner } = require("../../others/font")
const bannerConsole = banner();
const copyrightConsole = copyright();

exports.connect = async () => {
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" })})
    console.log(bannerConsole)
    const spinner = getGlobalSpinner();
    setTimeout(() => {
        spinner.start('Verificando sesión...')
    }, 2000)
    try {
        const sessionExists = fs.existsSync("../../others/font")
        setTimeout(() => {
            spinner.succeed('Sesión existente encontrada.');
        }, 3000)
    } catch (error) {
        spinner.succeed('No se encontró sesión existente. Escanee el código QR.');
    }
    const { state, saveCreds } = await useMultiFileAuthState('./auth/session')
    
    const sock = makeWASocket({
        logger : pino({ level : "silent" }),
        auth : state,
        browser: ["FireFox (linux)"],
        printQRInTerminal: true
    }, 5000)

    sock.ev.on("connection.update", v => {
        const { connection, lastDisconnect } = v
        
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Error en la conexión ', lastDisconnect.error, 'Reconectando', shouldReconnect)
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
            console.log(copyrightConsole)
        }
    })
    
    sock.ev.on("creds.update", saveCreds)

    store.bind(sock.ev)
    return sock
}