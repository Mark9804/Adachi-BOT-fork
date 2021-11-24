import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { getID, getUID } from "../../utils/id.js";
import { basePromise, characterPromise, detailPromise, handleDetailError } from "../../utils/detail.js";

function getCharacter(uid, character) {
  const { avatars } = db.get("info", "user", { uid }) || {};
  return avatars ? avatars.find((e) => e.name === character) : false;
}

function getNotFoundText(character, isMyChar, guess = []) {
  const cmd = [global.command.functions.name.card, global.command.functions.name.package];
  const cmdStr = `【${cmd.join("】、【")}】`;
  const text = global.config.characterTryGetDetail
    ? `看上去${isMyChar ? "旅行者" : "他"}尚未拥有该角色`
    : `如果${isMyChar ? "旅行者" : "他"}拥有该角色，使用${cmdStr}更新游戏角色后再次查询`;
  let notFoundText = `查询失败，${text}。`;

  if (!global.names.character.includes(character) && guess.length > 0) {
    notFoundText += `\n旅行者要查询的是不是：\n${guess.join("、")}`;
  }

  return notFoundText;
}

async function doCharacter(msg, name, isMyChar = false, guess = []) {
  let uid;
  let data;

  const character = global.names.characterAlias[name] || name;

  if (undefined === character) {
    msg.bot.say(msg.sid, "请正确输入角色名称。", msg.type, msg.uid, true);
    return;
  }

  try {
    let dbInfo = isMyChar ? getID(msg.text, msg.uid) : getUID(msg.text);
    let baseInfo;

    if (!isMyChar && (!dbInfo || "string" === typeof dbInfo)) {
      dbInfo = getID(msg.text, msg.uid); // 米游社 ID
    }

    if ("string" === typeof dbInfo) {
      msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
      return;
    }

    if (Array.isArray(dbInfo)) {
      baseInfo = dbInfo;
      uid = baseInfo[0];
    } else {
      baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
      uid = baseInfo[0];
    }

    data = getCharacter(uid, character);

    if (!data) {
      if (!global.config.characterTryGetDetail) {
        const text = getNotFoundText(character, isMyChar, guess);
        msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
        return;
      } else {
        const detailInfo = await detailPromise(...baseInfo, msg.uid, msg.bot);
        await characterPromise(...baseInfo, detailInfo, msg.bot);
        data = getCharacter(uid, character);
      }
    }
  } catch (e) {
    const ret = handleDetailError(e);

    if (!ret) {
      msg.bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && msg.bot.say(msg.sid, ret[0], msg.type, msg.uid, true);
      ret[1] && msg.bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid);
      return;
    }
  }

  if (!data) {
    const text = getNotFoundText(character, isMyChar, guess);
    msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
    return;
  }

  render(msg, { uid, data }, "genshin-character");
}

export { doCharacter };
