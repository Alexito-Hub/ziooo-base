const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function statusSession(spinner, sessionExists) {
    spinner.start('Verificando sesión...');
    await sleep(1000);

    if (sessionExists) {
        setTimeout(() => {
            spinner.succeed('Sesión existente encontrada.');
        }, 3000)
    } else {
        setTimeout(() => {
            spinner.succeed('No se encontró sesión existente. Escanee el código QR.');
        }, 3000)
    }

    await sleep(1000);
}

module.exports = {
    statusSession
}