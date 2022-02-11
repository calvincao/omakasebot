import dotenv from "dotenv";
const got = require("got");
const jsdom = require("jsdom");
dotenv.config();

// @ts-expect-error
import fetch from "node-fetch";
import { Client, ClientUser, Intents, Message, TextChannel } from "discord.js";
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
let user: ClientUser | undefined;
let lastFloorPrice: number | null = null;

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("message", async (msg: Message) => {
  if (msg.content === "omakase") {
    msg.reply("❤️‍🔥");
  } else if (msg.content.startsWith("!floor")) {
    const [_command, collectionName] = msg.content.split(" ");

    if (collectionName === undefined) {
      msg.reply(`${collectionName}: ${lastFloorPrice} Ξ`);
      return;
    } else {
      const floorPrice = await getFloorPrice(collectionName);
      if (floorPrice) {
        msg.reply(`${collectionName}: ${floorPrice} Ξ`);
      } else {
        msg.reply(
          `I couldn't find ${collectionName} on OpenSea. You need to use the OpenSea slug.`
        );
      }
      return;
    }
  } else if (msg.content.startsWith("!watchlist")) {
    const [_command, watchlistName] = msg.content.split(" ");

    if (watchlistName === undefined) {
      msg.reply(`${watchlistName}: ${lastFloorPrice} Ξ`);
      return;
    } else {
      let message = "";
      for(let i = 0; i < watchlists.length; ++i) {
        if(watchlistName == watchlists[i].watchlistName){
          message = message + watchlists[i].watchlistName + " watchlist:"
          for(let j = 0; j < watchlists[i].watchlist.length; ++j) {
            let floorPrice = await getFloorPrice(watchlists[i].watchlist[j]);
            message = message + "\n" + watchlists[i].watchlist[j] + ": " + floorPrice + " eth";
          }
          if (message) {!
            msg.reply(message);
          } else {
            msg.reply(
              `nothing`
            );
          }
          return;
        }
      }
      msg.reply("That watchlist doesn't exist. Contact omakasemoney");
      return;
    }
  }
});

const main = async () => {
  await client.login(process.env.DISCORD_BOT_TOKEN);
  try {
    user = await client.user?.setUsername(
      process.env.BOT_NAME || "Omakase Floor Bot"
    );
  } catch {
    user = client.user || undefined;
  }
  user?.setActivity("🍣💰");
};

main();

const getFloorPrice = async (collectionName = process.env.COLLECTION_NAME) => {
  try {
    const response = await fetch(
      `https://api.opensea.io/api/v1/collection/${collectionName}/stats`
    );
    const json = await response.json();

    return json.stats.floor_price;
  } catch {
    return null;
  }
};

let watchlists = [
  {
    watchlistName: "kwaji",
    watchlist: [
      "boredapeyachtclub",
      "mutant-ape-yacht-club",
      "mfers",
      "chainfaces-arena"
    ]
  },
  {
    watchlistName: "uh",
    watchlist: [
      "boredapeyachtclub",
      "azuki",
      "coolpetsnft"
    ]
  },
  {
    watchlistName: "apes",
    watchlist: [
      "boredapeyachtclub",
      "mutant-ape-yacht-club",
      "bored-ape-kennel-club",
    ]
  },
  {
    watchlistName: "cc",
    watchlist: [
      "cool-cats-nft",
      "coolpetsnft"
    ]
  },
  {
    watchlistName: "mice",
    watchlist: [
      "anonymice",
      "anonymicebreeding"
    ]
  },
  {
    watchlistName: "weeb3",
    watchlist: [
      "azuki",
      "capsulehouse",
      "livesofasuna",
      "killergf",
      "supernormalbyzipcy"
    ]
  },
  {
    watchlistName: "streetwear",
    watchlist: [
      "rtfkt-mnlth",
      "adam-bomb-squad",
      "clonex",
      "stapleverse-feed-clan",
    ]
  },
]
