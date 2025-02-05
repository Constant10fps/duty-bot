import { Composer, Context } from "grammy";
import { getGroup, getOrder, setOrder } from "../db/duty.ts";
import { channelId } from "../mod.ts";
import { getSettings } from "../db/settings.ts";

export const channelComposer = new Composer();

channelComposer.chatType("channel").filter((ctx) => checkChannel(ctx))
  .command("duty", async (ctx) => {
    const settings = await getSettings();
    const order = await getOrder() || 0;
    const group = await getGroup(order);
    const newOrder = (order + 1) % (settings?.groupsNumber || order + 1);
    await setOrder(newOrder);

    const messageText = `🧹 Cегодня дежурят:\n${
      group?.members.map((val) => `${val.name} ${val.surname}`).join("\n")
    }`;
    await ctx.editMessageText(messageText);
  });

const checkChannel = (ctx: Context) => ctx.chatId == channelId;
