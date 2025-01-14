import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import "#utils/config";
import { ls, mkdir } from "#utils/file";

("use strict");

const m_PARAMS_DIR = Object.freeze(mkdir(path.resolve(global.datadir, "record", "last_params")));

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-n <string>")
    .example("-n aby")
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      name: {
        alias: "n",
        type: "string",
        description: "名称",
        requiresArg: true,
        required: false,
      },
      list: {
        alias: "l",
        type: "boolean",
        description: "显示可选名称",
        requiresArg: false,
        required: false,
      },
    });
  const names = Object.fromEntries(
    ls(m_PARAMS_DIR)
      .filter((c) => c.match(/\bgenshin-[\w-]+?[.]json$/))
      .map((c) => {
        const p = path.parse(c);
        return [p.name.split("-").slice(1).join("-"), p.name];
      })
  );

  if ("string" === typeof argv.name) {
    if (undefined !== names[argv.name]) {
      const view = `genshin-${argv.name}`;
      const dataFile = path.resolve(m_PARAMS_DIR, `${view}.json`);
      const viewFile = path.resolve(global.rootdir, "src", "views", `${view}.html`);

      for (const f of [dataFile, viewFile]) {
        try {
          fs.accessSync(f, fs.constants.R_OK);
        } catch (e) {
          console.error(`错误：无法读取文件 ${f} 。`);
          return -1;
        }
      }

      const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

      if (data) {
        const dataStr = JSON.stringify(data);
        const param = { data: new Buffer.from(dataStr, "utf8").toString("base64") };
        const url = `http://localhost:9934/src/views/${["genshin", argv.name].join("-")}.html`;

        try {
          execSync([puppeteer.executablePath(), `${url}?${new URLSearchParams(param)}`].join(" "));
        } catch (e) {
          return e.status;
        }

        return 0;
      }
    }

    console.error(`错误：未知的名称 ${argv.name} ，使用 -l 查看可用名称。`);
    return -1;
  }

  if (true === argv.list) {
    const nameList = Object.keys(names);

    if (nameList.length > 0) {
      console.log(nameList.join("\n"));
      return 0;
    }

    return -1;
  }
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
