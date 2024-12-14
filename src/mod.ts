import { Bot } from "grammy";
import { dutyComposer, MyContext } from "./composers/duty.ts";
import "jsr:@std/dotenv/load";

export const bot = new Bot<MyContext>(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();

bot.use(dutyComposer);
