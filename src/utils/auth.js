/* global command */
/* eslint no-undef: "error" */

import db from "./database.js";

function hasAuth(id, func) {
  const data = db.get("authority", "user", { userID: id }) || {};
  return data[func] && true === data[func];
}

function setAuth(msg, func, id, isOn, report = true) {
  const name = command.functions.name[func] ? `【${command.functions.name[func]}】` : func;
  const text = `我已经开始${isOn ? "允许" : "禁止"} ${id} 的${name}功能！`;
  const data = db.get("authority", "user", { userID: id });

  if (undefined === data) {
    db.push("authority", "user", { userID: id, [func]: isOn });
  } else {
    db.update("authority", "user", { userID: id }, { ...data, [func]: isOn });
  }

  if (true === report && undefined !== msg.bot) {
    msg.bot.sayMaster(msg.sid, text, msg.type, msg.uid);
  }
}

// 返回值：
//    true:      有权限
//    false:     没权限
//    undefined: 没设置权限
function checkAuth(msg, func, report = true) {
  const uauth = hasAuth(msg.uid, func);
  const gauth = hasAuth(msg.sid, func);

  if (undefined == uauth && undefined === gauth) {
    return undefined;
  }

  if (false === uauth || false === gauth) {
    if (true === report && undefined !== msg.bot) {
      msg.bot.say(msg.sid, `旅行者当前无【${command.functions.name[func]}】权限。\n可能是管理为限制刷屏禁止了该行为，如仍想尝试，可以私聊`, msg.type, msg.uid);
    }
    return false;
  }

  return true;
}

export { setAuth, checkAuth };
