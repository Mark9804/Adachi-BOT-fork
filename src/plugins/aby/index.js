import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { basePromise, abyPromise } from "../../utils/detail.js";
import { hasEntrance } from "../../utils/config.js";
import { getID } from "../../utils/id.js";

async function generateImage(uid, id, type) {
  let data = await db.get("aby", "user", { uid });
  await render(data, "genshin-aby", id, type);
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let dbInfo = await getID(msg, userID, false); // UID
  let schedule_type = "1";

  if (hasEntrance(msg, "aby", "lastaby")) {
    schedule_type = "2";
  }

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${dbInfo}`, type);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = await getID(msg, userID); // 米游社 ID

      if ("string" === typeof dbInfo) {
        await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${dbInfo}`, type);
        return;
      }

      const baseInfo = await basePromise(dbInfo, userID);
      const uid = baseInfo[0];
      dbInfo = await getID(uid, userID, false); // UID

      if ("string" === typeof dbInfo) {
        await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${dbinfo}`, type);
        return;
      }
    }

    const abyInfo = await abyPromise(...dbInfo, userID, schedule_type);

    if (!abyInfo) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 你似乎从未挑战过深境螺旋。耽误太多时间，事情可就做不完了。`,
        type
      );
      return;
    }

    if (!abyInfo["floors"].length) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 无渊月螺旋记录。无论是冒险还是做生意，机会都稍纵即逝。`,
        type
      );
      return;
    }
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, errInfo, type);
      return;
    }
  }

  await generateImage(dbInfo[0], sendID, type);
}

export { Plugin as run };
