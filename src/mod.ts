import { Bot, Context, session, SessionFlavor } from "grammy";
import { freeStorage } from "https://deno.land/x/grammy_storages@v2.4.2/free/src/mod.ts";
import { adminComposer } from "./composers/admin.ts";
import { channelComposer } from "./composers/channel.ts";
import { setAdmin, setChannel } from "./db/admin.ts";

interface SessionData {
  status?: "settings" | "db" | "groups" | "check";
}

export type BotContext = Context & SessionFlavor<SessionData>;
export const bot = new Bot<BotContext>(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();

bot.use(
  session({
    initial: () => ({}),
    storage: freeStorage<SessionData>(bot.token),
  }),
);

bot.use(channelComposer);

bot.chatType("private").command("add", async (ctx) => {
  const id = Number(ctx.match);
  if (!id) {
    await ctx.react("🌚");
    return;
  }
  await setChannel(id);
  await ctx.react("👍");
});

bot.use(adminComposer);

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
