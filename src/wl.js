const wl = {};
const db = require('./model');

wl.register = async (user) => {
  const { name, ID } = user;
  const CheckQuery = `SELECT * FROM "public"."users" WHERE discord_id=$1`;
  const RegisterQuery = `INSERT INTO users (discord_id) VALUES ($1);`;
  try {
    const result = await db.query(CheckQuery, [ID]);
    if (result.rows.length) return false;
    if (!result.rows.length) {
      const newUser = await db.query(RegisterQuery, [ID]);
      console.log(newUser);
      return true;
    }
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.register-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.create = async (watchlist) => {
  const CheckQuery = 'SELECT * FROM "public"."watchlists" WHERE discord_id=$1 AND wl_name=$2';
  const createQuery = 'INSERT INTO watchlists (wl_name, discord_id) VALUES ($1, $2)';
  try {
    const result = await db.query(CheckQuery, [watchlist.owner, watchlist.name]);
    if (result.rows.length) return false;
    if (!result.rows.length) {
      await db.query(createQuery, [watchlist.name, watchlist.owner]);
      return true;
    }
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.create-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.add = async (watchlist) => {
  const { owner, name: wlname, nft } = watchlist;
  const listCheck = 'SELECT _id FROM "public"."watchlists" WHERE discord_id=$1 AND wl_name=$2';
  const nftCheck = 'SELECT * FROM "public"."nfts" WHERE os_name=$1';
  const nftInsert = 'INSERT INTO "public"."nfts" (os_name) VALUES ($1)';
  const dupeCheck = 'SELECT * FROM wl_nfts WHERE wl_id=$1 AND os_name=$2';
  const createQuery = 'INSERT INTO wl_nfts (wl_id, os_name) VALUES ($1, $2)';
  try {
    // get id of wl, if it doesn't exist, return false
    let wl_id = await db.query(listCheck, [owner, wlname]);
    if (!wl_id.rows.length) return 'no wl in db';
    // create nft if it doesn't exist
    const nftExist = await db.query(nftCheck, [nft]);
    if (!nftExist.rows.length) await db.query(nftInsert, [nft]);
    // check if watchlist already has nft, return false if duplicate
    wl_id = wl_id.rows[0]._id;
    const dupe = await db.query(dupeCheck, [wl_id, nft]);
    if (!dupe.rows.length) {
      await db.query(createQuery, [wl_id, nft]);
      return 'nft added';
    }
    return 'nft already in wl';
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.add-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.list = async (owner) => {
  const getListsQuery = 'SELECT wl_name FROM watchlists WHERE discord_id=$1';
  try {
    const lists = await db.query(getListsQuery, [owner]);
    return lists.rows;
  } catch (err) {
    console.log('-=-=-=-=-=-=-=-=-error in wl.list-=-=-=-=-=-=-=-=-');
    console.log(err);
  }
};

wl.getListItems = async (watchlist) => {
  const { owner, name: wlname } = watchlist;
  const listCheckQuery = 'SELECT _id FROM "public"."watchlists" WHERE discord_id=$1 AND wl_name=$2';
  const getListsQuery = 'SELECT os_name FROM wl_nfts WHERE wl_id=$1';
  try {
    let wl_id = await db.query(listCheckQuery, [owner, wlname]);
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
