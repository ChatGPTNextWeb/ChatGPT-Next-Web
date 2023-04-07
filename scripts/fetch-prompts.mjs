import fetch from "node-fetch";
import fs from "fs/promises";

const RAW_CN_URL =
  "https://raw.githubusercontent.com/PlexPt/awesome-chatgpt-prompts-zh/main/prompts-zh.json";
const CN_URL =
  "https://cdn.jsdelivr.net/gh/PlexPt/awesome-chatgpt-prompts-zh@main/prompts-zh.json";
const RAW_EN_URL =
  "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv";
const EN_URL =
  "https://cdn.jsdelivr.net/gh/f/awesome-chatgpt-prompts@main/prompts.csv";
const FILE = "./public/prompts.json";

async function fetchCN() {
  console.log("[Fetch] fetching cn prompts...");
  try {
    const raw = await (await fetch(CN_URL)).json();
    return raw.map((v) => [v.act, v.prompt]);
  } catch (error) {
    console.error("[Fetch] failed to fetch cn prompts", error);
    return [];
  }
}

async function fetchEN() {
  console.log("[Fetch] fetching en prompts...");
  try {
    const raw = await (await fetch(EN_URL)).text();
    return raw
      .split("\n")
      .slice(1)
      .map((v) => v.split('","').map((v) => v.replace('"', "")));
  } catch (error) {
    console.error("[Fetch] failed to fetch cn prompts", error);
    return [];
  }
}

async function main() {
  Promise.all([fetchCN(), fetchEN()])
    .then(([cn, en]) => {
      fs.writeFile(FILE, JSON.stringify({ cn, en }));
    })
    .catch((e) => {
      console.error("[Fetch] failed to fetch prompts");
      fs.writeFile(FILE, JSON.stringify({ cn: [], en: [] }));
    })
    .finally(() => {
      console.log("[Fetch] saved to " + FILE);
    });
}

main();
