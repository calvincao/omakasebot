const wl = {};
const db = require('./model');

wl.register = async (user) => {
  const CheckQuery = `SELECT * FROM "public"."users" WHERE discord_id=$1`;
  const RegisterQuery = `INSERT INTO users (discord_id) VALUES ($1);`;
  try {
    const result = await db.query(CheckQuery, [user]);
    if (result.rows.length) return;
    if (!result.rows.length) {
      await db.query(RegisterQuery, [user]);
      return;
    }
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.register-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.create = async (watchlist) => {
  wl.register(watchlist.owner);
  const CheckQuery = 'SELECT * FROM "public"."watchlists" WHERE discord_id=$1 AND wl_name=$2';
  const createQuery = 'INSERT INTO watchlists (wl_name, discord_id) VALUES ($1, $2)';
  try {
    const result = await db.query(CheckQuery, [watchlist.owner, watchlist.name]);
    if (result.rows.length)
      return `⛔️⛔️ User ID #${watchlist.owner} already has a watchlist named: '${watchlist.name}'`;
    if (!result.rows.length) {
      await db.query(createQuery, [watchlist.name, watchlist.owner]);
      return `📓📓 User ID #${watchlist.owner} has created the watchlist - '${watchlist.name}'`;
    }
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.create-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.add = async (watchlist) => {
  wl.register(watchlist.owner);
  const { owner, name, nft } = watchlist;
  const listCheck = 'SELECT _id FROM "public"."watchlists" WHERE discord_id=$1 AND wl_name=$2';
  const nftCheck = 'SELECT * FROM "public"."nfts" WHERE os_name=$1';
  const nftInsert = 'INSERT INTO "public"."nfts" (os_name) VALUES ($1)';
  const dupeCheck = 'SELECT * FROM wl_nfts WHERE wl_id=$1 AND os_name=$2';
  const createQuery = 'INSERT INTO wl_nfts (wl_id, os_name) VALUES ($1, $2)';
  try {
    // get id of wl, if it doesn't exist, return false
    let wl_id = await db.query(listCheck, [owner, name]);
    if (!wl_id.rows.length)
      return `⛔️⛔️ No watchlist with that name('${watchlist.name}') is found.`;
    // create nft if it doesn't exist
    const nftExist = await db.query(nftCheck, [nft]);
    if (!nftExist.rows.length) await db.query(nftInsert, [nft]);
    // check if watchlist already has nft, return false if duplicate
    wl_id = wl_id.rows[0]._id;
    const dupe = await db.query(dupeCheck, [wl_id, nft]);
    if (!dupe.rows.length) {
      await db.query(createQuery, [wl_id, nft]);
      return `✏️📜 ${watchlist.nft} has been added to watchlist - '${watchlist.name}.'`;
    }
    return `⛔️⛔️ ${watchlist.nft} is already in '${watchlist.name}'.`;
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.add-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.list = async (owner) => {
  wl.register(owner);
  const getListsQuery = 'SELECT wl_name FROM watchlists WHERE discord_id=$1';
  try {
    const lists = await db.query(getListsQuery, [owner]);
    let reply = `User #${owner}'s watchlists:\n`;
    for (const list of lists.rows) {
      reply += `${list.wl_name}` + `\n`;
    }
    return reply;
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.list-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.getListItems = async (watchlist) => {
  wl.register(watchlist.owner);
  const { owner, name } = watchlist;
  const listCheckQuery = 'SELECT _id FROM "public"."watchlists" WHERE discord_id=$1 AND wl_name=$2';
  const getListsQuery = 'SELECT os_name FROM wl_nfts WHERE wl_id=$1';
  try {
    let wl_id = await db.query(listCheckQuery, [owner, name]);
    if (!wl_id.rows.length) return false;
    wl_id = wl_id.rows[0]._id;
    let nftList = await db.query(getListsQuery, [wl_id]);
    return nftList.rows;
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.getListItems-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

module.exports = wl;
