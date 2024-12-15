import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "https://deno.land/x/grammy_storages@v2.4.2/free/src/adapter.ts";
import "jsr:@std/dotenv/load";
import { dutyComposer } from "./composers/duty.ts";
import { Profile } from "./db/profile.ts";
import { studentsComposer } from "./composers/students.ts";

export interface SessionData {
  status?: "pairs" | "approval" | "db";
  studentList?: Profile[];
}
export type MyContext = Context & SessionFlavor<SessionData>;

export const bot = new Bot<MyContext>(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();
export const channelID = Number(Deno.env.get("CHANNEL_ID")) || 0;
export const adminID = [1329749699, Number(Deno.env.get("ADMIN_ID"))];

bot.use(session({
  initial: () => ({}),
  storage: freeStorage<SessionData>(bot.token),
}));

bot.use(dutyComposer);
bot.use(studentsComposer);
bot.api.setMyCommands([
  { command: "create", description: "create the duty list (ADMIN)" },
  { command: "cancel", description: "cancel action" },
  { command: "db", description: "setup the student DB" },
  { command: "duty", description: "send duty message [channel only]" },
]);
