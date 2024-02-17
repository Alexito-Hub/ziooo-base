const font = require("../lib/font")
const { connect } = require("./components/connection")
const { load } = require("./components/loader")
const loading = font.loading()
async function start() {
    try {
        console.clear()
        console.log(loading)
        const bot = await connect();
        load(bot);
    } catch (e) {
        console.log('\x1b[31m%s\x1b[0m', 'Se Produjo un error', e)
    }
}

start();