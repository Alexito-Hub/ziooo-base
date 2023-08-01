const { connectWA } = require("./connection")
const { load } = require("./load")

async function waConnection() {
    const botWA = await connectWA()
    load(botWA)
}

waConnection()