const { connect } = require("./components/connection")
const colorize = require("colorize-console")

async function start() {
    try {
        await connect();
    } catch (e) {
        console.log(colorize.bold('Se Produjo un error'), e)
    }
}

start()