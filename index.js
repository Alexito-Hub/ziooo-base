const { connectWA } = require("./connection")
const { load } = require("./loader")

async function start() {
    try {
        const botWA = await connectWA(start)
        load(botWA)
    } catch (error) {
        console.error("Error al iniciar el bot:", error)
    }
}

start()
