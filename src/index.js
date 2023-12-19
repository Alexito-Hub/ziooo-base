const { connect } = require("./components/connection")
const { load } = require("./components/loader")

async function start() {
    try {
        console.log('\x1b[36m%s\x1b[0m', 'Bienvenido a la base de Ziooo')
        const bot = await connect();
        load(bot);
    } catch (e) {
        console.log('\x1b[31m%s\x1b[0m', 'Se Produjo un error', e)
    }
}

start();