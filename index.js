const { connecTo } = require("./connection")
/*const { load } = require("./load")*/

async function waConnection() {
    const taku = await connecTo()
    load(taku)
}

waConnection()