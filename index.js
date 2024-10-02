import fs from "fs";
import login from "./logins/fca-new/fb-chat-api/index.js"; // FCA fb-chat-api
import { listen } from "./listen/listen.js";
import { commandMiddleware, eventMiddleware } from "./middleware/index.js";
import sleep from "time-sleep";
import { log, notifer } from "./logger/index.js";
import gradient from "gradient-string";
import config from "./KaguyaSetUp/config.js";
import EventEmitter from "events";
import axios from "axios";
import semver from "semver";

// Login replacement
login({ email: "FB_EMAIL", password: "FB_PASSWORD" }, (err, api) => {
  if (err) return console.error(err);
  fs.writeFileSync('KaguyaState.json', JSON.stringify(api.getAppState())); // Create appstate
});

class Kaguya extends EventEmitter {
  constructor() {
    super();
    this.on("system:error", (err) => {
      log([{ message: "[ ERROR ]: ", color: "red" }, { message: `Error! An error occurred: ${err}`, color: "white" }]);
      process.exit(1);
    });
    this.currentConfig = config;
    this.credentials = fs.readFileSync("./KaguyaSetUp/KaguyaState.json");
    this.package = JSON.parse(fs.readFileSync("./package.json"));
    this.checkCredentials();
  }

  checkCredentials() {
    try {
      const credentialsArray = JSON.parse(this.credentials);
      if (!Array.isArray(credentialsArray) || credentialsArray.length === 0) {
        this.emit("system:error", "Fill in appstate in KaguyaSetUp/KaguyaState.json!");
        process.exit(0);
      }
    } catch (error) {
      this.emit("system:error", "Cannot parse JSON credentials in KaguyaSetUp/KaguyaState.json");
    }
  }

  async checkVersion() {
    try {
      const redToGreen = gradient("white", "green");
      console.log(redToGreen("■".repeat(50), { interpolation: "hsv" }));
      console.log(`${gradient(["#4feb34", "#4feb34"])("[ AUTHOR ]: ")} ${gradient("cyan", "pink")("Arjhil Dacayanan")}`);
      console.log(`${gradient(["#4feb34", "#4feb34"])("[ Facebook ]: ")} ${gradient("cyan", "pink")("https://www.facebook.com/arjhil.dacayanan.73?mibextid=ZbWKwL")}`);

      const { data } = await axios.get("https://raw.githubusercontent.com/Tshukie/Kaguya-Pr0ject/master/package.json");
      if (semver.lt(this.package.version, (data.version ??= this.package.version))) {
        log([{ message: "[ SYSTEM ]: ", color: "yellow" }, { message: `New Update: contact the owner`, color: "white" }]);
      }

      let currentFrame = 0;
      const interval = setInterval(() => {
        process.stdout.write("\b".repeat(currentFrame));
        const frame = redToGreen("■".repeat(currentFrame), { interpolation: "hsv" });
        process.stdout.write(frame);
        currentFrame++;
        if (currentFrame > 50) {
          clearInterval(interval);
          process.stdout.write("\n");
          this.emit("system:run");
        }
      }, 10);
    } catch (err) {
      this.emit("system:error", err);
    }
  }

  start() {
    setInterval(() => {
      const t = process.uptime();
      const [i, a, m] = [Math.floor(t / 3600), Math.floor((t % 3600) / 60), Math.floor(t % 60)].map((num) => (num < 10 ? "0" + num : num));
      const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
      const memoryData = process.memoryUsage();
      process.title = `Kaguya Project - Author: Arjhil Dacayanan - ${i}:${a}:${m} - External: ${formatMemoryUsage(memoryData.external)}`;
    }, 1000);

    (async () => {
      global.client = {
        commands: new Map(),
        events: new Map(),
        cooldowns: new Map(),
        aliases: new Map(),
        handler: {
          reply: new Map(),
          reactions: new Map(),
        },
        config: this.currentConfig,
      };

      await commandMiddleware();
      await eventMiddleware();
      this.checkVersion();

      this.on("system:run", () => {
        login({ appState: JSON.parse(this.credentials) }, async (err, api) => {
          if (err) this.emit("system:error", err);

          api.setOptions(this.currentConfig.options);

          const reactions = [
            "🥰", "😂", "😢", "😍", "🤔", "😱", "🥺", "🤣", "😀", "😭",
            "❤️", "😜", "😎", "😏", "😘", "😤", "🤗", "🤩", "😇", "😬",
            "😅", "😳", "🙈", "🙉", "🙊", "🤭", "😋", "🤓", "😌", "🤤",
            "🤑", "😺", "😸", "😻", "🤖", "👻", "🎉", "🌈", "✨", "🔥",
            "💔", "💖", "🌹", "🌼", "🍀", "🌟", "💯", "👍", "👎", "🤝"
          ];

          const randomReact = (event) => {
            if (event.body) {
              const randomCount = Math.floor(Math.random() * 3) + 1;
              for (let i = 0; i < randomCount; i++) {
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                api.setMessageReaction(randomReaction, event.messageID, (err) => {
                  if (err) {
                    // Suppress the error message
                  }
                });
              }
            }
          };

          const listenMqtt = async () => {
            try {
              if (!listenMqtt.isListening) {
                listenMqtt.isListening = true;
                const mqtt = await api.listenMqtt(async (err, event) => {
                  if (err) {
                    this.on("error", err);
                  }
                  await listen({ api, event, client: global.client });
                  randomReact(event); // Call to react to the message
                });
                await sleep(this.currentConfig.mqtt_refresh);
                notifer("[ MQTT ]", "Mqtt refresh in progress!");
                log([{ message: "[ MQTT ]: ", color: "yellow" }, { message: `Refresh mqtt in progress!`, color: "white" }]);
                await mqtt.stopListening();
                await sleep(5000);
                notifer("[ MQTT ]", "Refresh successful!");
                log([{ message: "[ MQTT ]: ", color: "green" }, { message: `Refresh successful!`, color: "white" }]);
                listenMqtt.isListening = false;
              }
              listenMqtt();
            } catch (error) {
              this.emit("system:error", error);
            }
          };

          listenMqtt.isListening = false;
          listenMqtt();
        });
      });
    })();
  }
}

const KaguyaInstance = new Kaguya();
KaguyaInstance.start();
