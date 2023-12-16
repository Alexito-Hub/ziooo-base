const { connectWA } = require("./components/connection")
const { load } = require("./components/loader")

async function start() {
    try {
        const botWA = await connectWA(start)
        load(botWA)
    } catch (e) {
        console.error("Error al iniciar el bot:", e)
    }
}

start()