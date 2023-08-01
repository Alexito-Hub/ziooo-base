const { connectWA } = require("./connection")
const { load } = require("./loader")

async function start() {
    const botWA = await connectWA()
    load(botWA)
}

start()