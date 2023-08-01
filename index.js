const { connectWA } = require("./connection")
const { load } = require("./loader")

async function start() {
    const client = await connectWA()
    load(client)
}

start()