/* *******************************************************************************************************************
   *
   *    -- CREADO POR ZIOOO --      
   *
   *    IG : im._ziooo
   *    GITHUB : Alexito-Hub
   *
   *    -- PARA USAR --        
   *    $ git clone https://github.com/Alexito-Hub/ziooo-base.git
   *    $ git branch v1.2.0
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
    msgRetryCounterCache,
    DisconnectReason,
    makeInMemoryStore,
    useMultiFileAuthState,
    getContentType,
    fetchLatestBaileysVersion,
    default: makeWASocket,
 } = require("@whiskeysockets/baileys")

const fs = require("fs")
const pino = require("pino")
const path = require("path")
const colorize = require("colorize-console")
const { Boom } = require("@hapi/boom")

exports.connect = async() => {
    const start = async() => {
        const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" })})
        const sessionPath = path.resolve('./auth/session')
    
        const { state, saveCreds } = await useMultiFileAuthState('./auth/session')
        const { version } = await fetchLatestBaileysVersion()
        const sock = makeWASocket({
            version,
            logger : pino({ level : "silent" }),
            browser: ["Base Ziooo", "Firefox", "3.0.0"],
            printQRInTerminal: true,
            auth : state,
            msgRetryCounterCache,
            generateHighQualityLinkPreview : true
        }) 

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.badSession) {
                    console.log(colorize.bold(`Bad Session File, Please Delete Folder ${sessionPath} and Start Again`)  );
                    fs.rmSync(sessionPath, { recursive : true, force : true })
                    start()
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log(colorize.bold("Connection closed, reconnecting....")   );
                    start();
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log(colorize.bold("Connection Lost from Server, reconnecting...")   );
                    start();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log(colorize.bold("Connection Replaced, Another New Session Opened, Please Restart Bot")    );
                    process.exit();
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(colorize.bold(`Device Logged Out, Please Delete Folder ${sessionPath} and Connect Again.`)  );
                    fs.rmSync(sessionPath, { recursive : true, force : true })
                    start()
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log(colorize.bold( "Restart Required, Restarting...") );
                    start();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log(colorize.bold("Connection TimedOut, Reconnecting...")  );
                    start();
                } else {
                    console.log(colorize.bold(  `Unknown DisconnectReason: ${reason}|${connection}` )  );
                    start();
                }
            } else if (connection === "open") {
                console.log(colorize.bold("oppened connection"))
            }
        })
        
        sock.ev.on("creds.update", saveCreds)
    
        sock.ev.on('messages.upsert', messages => {
            messages = messages.messages[0]
            if (!messages) return
            
            messages.message = (getContentType(messages.message) === 'ephemeralMessage') ? messages.message.ephemeralMessage.message : messages.message
            if (messages.key && messages.key.remoteJid === 'status@broadcast') return
            
            require('./message')(sock, messages)
        })
    
        store.bind(sock.ev)
        return sock
    }
    start()
}