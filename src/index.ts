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
  let messageContent = msg.content.toLowerCase();
  if (messageContent === "omakase") {
    msg.reply("❤️‍🔥");
  } else if (messageContent.startsWith("!floor")) {
    const [_command, collectionName] = messageContent.split(" ");

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
  } else if (messageContent.startsWith("!watchlist")) {
    const [_command, watchlistName] = messageContent.split(" ");

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
          if(watchlists[i].coins !== undefined) {
            let coinsLength = watchlists[i].coins?.length || 0;
            for(let j = 0; j < coinsLength; ++j) {
              let floorPrice = await getTokenPrice(watchlists[i].coins[j]);
              message = message + "\n" + watchlists[i].coins[j] + ": " + floorPrice;
            }
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
   } else if (messageContent.startsWith("!price")) {
    const [_command, tokenName] = messageContent.split(" ");

    if (tokenName === undefined) {
      msg.reply('uh');
      return;
    } else {
      const tokenPrice = await getTokenPrice(tokenName);
      if (tokenName) {
        msg.reply(`${tokenName}: ${tokenPrice}`);
      } else {
        msg.reply(
          `I couldn't find ${tokenName}.`
        );
      }
      return;
    }
  } else if (messageContent.startsWith("ticker")) {
    const [_command, ticker] = messageContent.split(" ");

    if (ticker === undefined) {
      msg.reply('uh');
      return;
    } else {
      const stockPrice = await getStockPrice(ticker);
      if (ticker) {
        msg.reply(`${ticker}: ${stockPrice}`);
      } else {
        msg.reply(
          `I couldn't find ${ticker}.`
        );
      }
      return;
    }
  } else if (messageContent.startsWith("!dex")) {
    let [_command, pairAddress] = messageContent.split(" ");
    if (pairAddress === "looks") {
      pairAddress = "0x4b5ab61593a2401b1075b90c04cbcdd3f87ce011";
    }
    else if (pairAddress === "cfti") {
      pairAddress = "0x6a8c06aeef13aab2cdd51d41e41641630c41f5ff";
    }
    if (pairAddress === undefined) {
      msg.reply('uh');
      return;
    } else {
      const result = await getDexPairPrice(pairAddress);
      if (pairAddress) {
        msg.reply(`${result?.token}: ${result?.price}`);
      } else {
        msg.reply(
          `Didn't work for: ${pairAddress}.`
        );
      }
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

const getTokenPrice = async (tokenName = process.env.TOKEN_NAME) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${tokenName}`
    );
    const json = await response.json();

    return json.market_data.current_price.usd;
  } catch {
    return null;
  }
};

const getStockPrice = async (tickerName = process.env.TICKER_NAME) => {
  try {
    const response = await fetch(
      `https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${tickerName}`,
      {
       headers: {
         'X-API-KEY': process.env.YFI_API_KEY,
      } 
      }
    );
    const json = await response.json();
    return json.quoteResponse.result[0].regularMarketPrice;
  } catch {
    return null;
  }
};

const getDexPairPrice = async (pairAddress = process.env.PAIR_ADDRESS) => {
  try {
    const response = await fetch(
      `https://api.dexscreener.io/latest/dex/pairs/ethereum/${pairAddress}`
    );
    const json = await response.json();

    return {
      "token": json.pair.baseToken.symbol,
      "price": json.pair.priceUsd
    }
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
    ],
    coins: [
      "ethereum"
    ]
  },
  {
    watchlistName: "uh",
    watchlist: [
      "mutant-ape-yacht-club",
      "azuki",
      "coolpetsnft",
      "doodles-official",
      "clonex"
    ],
    coins: []
  },
  {
    watchlistName: "apes",
    watchlist: [
      "boredapeyachtclub",
      "mutant-ape-yacht-club",
      "bored-ape-kennel-club",
    ],
    coins: [
      "apecoin"
    ]
  },
  {
    watchlistName: "cc",
    watchlist: [
      "cool-cats-nft",
      "coolpetsnft"
    ],
    coins: []
  },
  {
    watchlistName: "mice",
    watchlist: [
      "anonymice",
      "anonymicebreeding"
    ],
    coins: []
  },
  {
    watchlistName: "weeb3",
    watchlist: [
      "azuki",
      "capsulehouse",
      "livesofasuna",
      "killergf",
      "supernormalbyzipcy"
    ],
    coins: []
  },
  {
    watchlistName: "streetwear",
    watchlist: [
      "rtfkt-mnlth",
      "rtfkt-podx",
      "adam-bomb-squad",
      "clonex",
      "stapleverse-feed-clan",
    ],
    coins: []
  },
  {
    watchlistName: "chubbi",
    watchlist: [
      "chubbiverse-frens",
      "chubbicorns"
    ],
    coins: []
  },
  {
    watchlistName: "staples",
    watchlist: [
      "stapleverse-feed-clan",
      "stapleverse-hood-squad",
      "stapleverse-poop-gang"
    ],
    coins: []
  }
]
