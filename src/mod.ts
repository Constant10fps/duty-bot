import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "https://deno.land/x/grammy_storages@v2.4.2/free/src/mod.ts";
import { adminComposer } from "./composers/admin.ts";
import { channelComposer } from "./composers/channel.ts";
import { setAdmin } from "./db/admin.ts";

interface SessionData {
  status?: "settings" | "db" | "groups" | "check";
}

export type BotContext = Context & SessionFlavor<SessionData>;
export const bot = new Bot<BotContext>(Deno.env.get("TOKEN") || "");
bot.use(
  session({
    initial: () => ({}),
    storage: freeStorage<SessionData>(bot.token),
  }),
);

export const kv = await Deno.openKv();
export const channelId = Number(Deno.env.get("CHANNEL_ID"));
export const adminId = Number(Deno.env.get("ADMIN_ID"));

bot.use(adminComposer);
bot.use(channelComposer);

bot.chatType("private").command("add", async (ctx) => {
  const adminId = Number(ctx.match);
  if (ctx.match) {
    await setAdmin(adminId);
    await ctx.react("👍");
  } else {
    await ctx.react("🌚");
  }
});

bot.chatType("private").on("msg:text", async (ctx) => {
  await ctx.reply(
    "Hi! Use /settings to start the enter students with /db, then use /groups to make duty groups, and finally post /duty in your connected channel",
  );
});

export const checkStatus = (ctx: BotContext, status: SessionData["status"]) =>
  ctx.session.status == status;

bot.api.setMyCommands([
  { command: "settings", description: "see/edit settings" },
  { command: "students", description: "see students" },
  { command: "db", description: "set up students DB" },
  { command: "groups", description: "set up groups" },
  { command: "duty", description: "(channel only) post today's duty group" },
]);

bot.catch(console.error);
