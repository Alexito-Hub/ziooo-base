const font = require("../lib/font")
const { connect } = require("./components/connection")
const { load } = require("./components/loader")

async function start() {
    try {
        const loading = font.loading()
        console.log(loading)
        const bot = await connect(start);
        load(bot);
    } catch (e) {
        console.log('\x1b[31m%s\x1b[0m', 'Se Produjo un error', e)
    }
}

start();