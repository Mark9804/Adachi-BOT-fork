/* global config */
/* eslint no-undef: "error" */

import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = config.menu;

async function menu(id, msg, type, user, bot) {
  const isGroup = msg.hasOwnProperty("group_id");
  const groupName = "group" === type ? msg.group_name : undefined;

  let isArknightsGroup = false;
  if (isGroup === true) {
    if (groupName.match(/方舟/g)) {
      isArknightsGroup = true;
    }
  }

  const favFood = isArknightsGroup ? "炭烤沙虫腿" : "派蒙";
  const nickname = isArknightsGroup ? "博士" : "旅行者";

  const message = `为${nickname}推荐的菜单是：
早餐：${Math.random() < 0.9 ? breakfast[getRandomInt(breakfast.length) - 1] : favFood}
午餐：${Math.random() < 0.9 ? lunch[getRandomInt(lunch.length) - 1] : favFood}
晚餐：${Math.random() < 0.9 ? dinner[getRandomInt(dinner.length) - 1] : favFood}`;

  await bot.sendMessage(id, message, type, user);
}

export { menu };
