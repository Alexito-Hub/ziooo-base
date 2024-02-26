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
    usePairingCode,
    logger,
    getMessage,
    msgRetryCounterCache,
     DisconnectReason,
     makeInMemoryStore,
     useMultiFileAuthState,
     getContentType,
     makeCacheableSignalKeyStore,
     fetchLatestBaileysVersion,
     default: makeWASocket,
 } = require("@whiskeysockets/baileys")

const fs = require("fs")
const pino = require("pino")
const { exec } = require("child_process")


const utils = require("../../lib/utils")
const font = require("../../lib/font")

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.connect = async() => {
    const start = async() => {
        const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" })})
        // const spinner = font.getGlobalSpinner();
        const sessionExists = await fs.promises.access('./auth/session').then(() => true).catch(() => false);
    
        // await utils.statusSession(spinner, sessionExists);
        // await sleep(4000)
        const { state, saveCreds } = await useMultiFileAuthState('./auth/session')
        const { version } = await fetchLatestBaileysVersion()
        const sock = makeWASocket({
            version,
            logger : pino({ level : "silent" }),
            browser: ["Base Ziooo", "Firefox", "3.0.0"],
            printQRInTerminal: !usePairingCode,
            //mobile : false,
            auth : state,
            msgRetryCounterCache,
            getMessage,
            generateHighQualityLinkPreview : true
        }) 

        if (usePairingCode && !sock.authState.creds.registered) {
            const phoneNumber = await  question("introduce tu numero:")
            const code = await sock.requestPairingCode(phoneNumber.trim())
            pairingcode = code
            console.log(`code ${code}`)
        }
        
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.badSession) {
                    console.log(   chalk.redBright.bold(`Bad Session File, Please Delete Folder ${config.sessionName} and Start Again`)  );
                    fs.rmSync(path.resolve(config.sessionName), { recursive : true, force : true })
                    start()
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log(  chalk.redBright.bold("Connection closed, reconnecting....")   );
                    start();
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log( chalk.redBright.bold("Connection Lost from Server, reconnecting...")   );
                    start();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log(   chalk.redBright.bold("Connection Replaced, Another New Session Opened, Please Restart Bot")    );
                    process.exit();
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(  chalk.redBright.bold(`Device Logged Out, Please Delete Folder ${config.sessionName} and Connect Again.`)  );
                    fs.rmSync(path.resolve(config.sessionName), { recursive : true, force : true })
                    start()
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log( chalk.redBright.bold( "Restart Required, Restarting...") );
                    start();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log( chalk.redBright.bold("Connection TimedOut, Reconnecting...")  );
                    start();
                } else {
                    console.log( chalk.redBright.bold(  `Unknown DisconnectReason: ${reason}|${connection}` )  );
                    start();
                }
            } else if (connection === "open") {
                //const copyright = font.copyright();
                //const progress = font.progressBar(5000);
                //console.log(progress, copyright)
                console.log("oppened connection")
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
    start()
}