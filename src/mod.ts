import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "https://deno.land/x/grammy_storages@v2.4.2/free/src/adapter.ts";
import "jsr:@std/dotenv/load";
import { dutyComposer } from "./composers/duty.ts";
import { Profile } from "./db/profile.ts";

export interface SessionData {
  status?: "pairs" | "approval";
  studentList?: Profile[];
}
export type MyContext = Context & SessionFlavor<SessionData>;

export const bot = new Bot<MyContext>(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();
export const channelID = Number(Deno.env.get("CHANNEL_ID")) || 0;

bot.use(session({
  initial: () => ({}),
  storage: freeStorage<SessionData>(bot.token),
}));

bot.use(dutyComposer);
