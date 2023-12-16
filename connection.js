const {
  default: WAConnection,
  useMultiFileAuthState,
  makeWASocket,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs")

exports.connectWA = async (start) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      "baileys-session"
    );

    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const level = pino({ level: "silent" });
    const sock = makeWASocket({
      version,
      logger: level,
      printQRInTerminal: true,
      mobile: useMobile,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, level),
      },
      msgRetryCounterCache,
      generateHighQualityLinkPreview: true,
      getMessage,
    });

    sock.ev.on("auth-state.update", async (authState) => {
      if (authState && authState.creds && authState.creds.registered) {
        // Si ya está registrado, cargar el bot
        start();
      } else {
        // Si no está registrado, manejar la autenticación
        await authWa(sock);
      }
    });

    saveCreds(state);
    return sock;
  } catch (error) {
    console.error("Error en la conexión de WhatsApp:", error);
    throw error;
  }
};


// Nueva función para manejar la autenticación
async function authWa(sock) {
  try {
    if (usePairingCode) {
      // Manejar lógica de código de emparejamiento
      const phoneNumber = await question('Por favor, ingresa tu número de teléfono móvil:\n');
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`Código de emparejamiento: ${code}`);
    }

    if (useMobile) {
      // Manejar lógica de registro en dispositivos móviles
      // ... (validar número de teléfono, establecer detalles de registro)

      async function enterCode() {
        // Lógica para ingresar OTP
        try {
          const code = await question('Por favor, ingresa el código de un solo uso:\n');
          const response = await sock.register(code.replace(/["']/g, '').trim().toLowerCase());
          console.log('Registro exitoso de tu número de teléfono.');
          console.log(response);
        } catch (error) {
          console.error('Fallo al registrar tu número de teléfono. Por favor, inténtalo de nuevo.\n', error);
          await enterCode();
        }
      }

      async function enterCaptcha() {
        // Lógica para ingresar Captcha
        const response = await sock.requestRegistrationCode({ ...registration, method: 'captcha' });
        const path = __dirname + '/captcha.png';
        fs.writeFileSync(path, Buffer.from(response.image_blob!, 'base64'));

        open(path);
        const code = await question('Por favor, ingresa el código de Captcha:\n');
        fs.unlinkSync(path);
        registration.captcha = code.replace(/["']/g, '').trim().toLowerCase();
      }

      async function askForOTP() {
        // Lógica para solicitar OTP
        if (!registration.method) {
          let code = await question('¿Cómo te gustaría recibir el código de un solo uso para el registro? "sms" o "voice"\n');
          code = code.replace(/["']/g, '').trim().toLowerCase();
          if (code !== 'sms' && code !== 'voice') {
            return await askForOTP();
          }

          registration.method = code;
        }

        try {
          await sock.requestRegistrationCode(registration);
          await enterCode();
        } catch (error) {
          console.error('Fallo al solicitar el código de registro. Por favor, inténtalo de nuevo.\n', error);

          if (error?.reason === 'code_checkpoint') {
            await enterCaptcha();
          }

          await askForOTP();
        }
      }

      // Iniciar el proceso de registro
      askForOTP();
    }
  } catch (error) {
    console.error("Error en la autenticación:", error);
  }
}
