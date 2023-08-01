const { connectWA } = require("./connection")
/*const { load } = require("./load")*/

async function waConnection() {
    const taku = await connectWA()
}

waConnection()