import { Composer, InlineKeyboard } from "grammy";
import { listProfiles } from "../db/profile.ts";
import {
  checkChannel,
  getOrder,
  getPair,
  listPairs,
  setOrder,
  setPair,
} from "../db/duty.ts";
import { adminID, MyContext, SessionData } from "../mod.ts";
// import { checkChannel } from "../db/duty.ts";

// Session Data shenannigans
export const dutyComposer = new Composer<MyContext>();

dutyComposer.use(async (ctx, next) => {
  console.log(ctx.chatId);
  await next();
});
// check for admin and status
const checkStatus = (ctx: MyContext, status: SessionData["status"]) =>
  ctx.session.status == status && ctx.session.studentList != undefined;
export const checkRights = (ctx: MyContext) =>
  adminID.includes(ctx.from?.id || 0);

dutyComposer.chatType("private").command("cancel", async (ctx) => {
  ctx.session.status = undefined;
  await ctx.reply("❌ • Действие отменено");
});
// recieve /create from admin
dutyComposer.chatType("private").command("create").filter(
  (ctx) => checkRights(ctx),
  async (ctx) => {
    ctx.session.studentList = await listProfiles();
    ctx.session.status = "pairs";
    await ctx.reply(
      `Окей ✅\n\nВот твои однокласснички:\n${
        ctx.session.studentList.map(
          (x, idx) => `${idx + 1}. ${x.name} ${x.surname}`,
        ).join("\n")
      }\nВыбирай пары.`,
    );
  },
);
// recieve pairs
dutyComposer.chatType("private").on("msg:text").filter(
  (ctx) => checkRights(ctx) && checkStatus(ctx, "pairs"),
  async (ctx) => {
    const numPairs = ctx.msg.text.split("\n").map((x) =>
      x.split(" ").map((x) => Number(x) - 1)
    );
    let order = 0;

    if (ctx.session.studentList && numPairs.length == 15) {
      // 1. set all pairs as in the numPairs
      for (const pair of numPairs) {
        const student1 = ctx.session.studentList[pair[0]];
        const student2 = ctx.session.studentList[pair[1]];
        await setPair(student1, student2, order);
        order++;
      }

      await ctx.reply("✅ • Сделано!");
      // 2. give pairs to the user and approve
      const result = (await listPairs()).map((x) =>
        `${x.first.surname} и ${x.second.surname}`
      ).join("\n");
      const keyboard = new InlineKeyboard();
      keyboard.text("Да • ✅", "yes").text("Нет • ❌", "no");
      await ctx.reply(`${result}\n\nПравильно?`, { reply_markup: keyboard });
      // 3. set status waiting for an approval
      ctx.session.status = "approval";
    } else {
      await ctx.reply("🚫 • Ошибка, пропиши /create еще раз");
      ctx.session.status = undefined;
    }
  },
);
// check pairs
dutyComposer.chatType("private").callbackQuery("yes").filter(
  (ctx) => checkStatus(ctx, "approval") && checkRights(ctx),
  async (ctx) => {
    ctx.session.status = undefined;
    ctx.editMessageReplyMarkup();
    await ctx.reply(
      "Отлично! Отправь команду /duty в канал с ботом и смотри результат",
    );
  },
);

dutyComposer.callbackQuery("no").filter(
  (ctx) => checkStatus(ctx, "approval") && checkRights(ctx),
  async (ctx) => {
    ctx.session.status = undefined;
    await ctx.reply("Отправь /create еще раз");
  },
);

dutyComposer.chatType("private").filter((ctx) => checkRights(ctx)).command(
  "order",
  async (ctx) => {
    await setOrder(Number(ctx.msg.text.split(" ")[1]) % 15);
    await ctx.reply("Сделано :checkmark:");
  },
);

// send message to channel
dutyComposer.chatType("channel").filter((ctx) => checkChannel(ctx.chatId))
  .command("duty", async (ctx) => {
    const order = await getOrder();
    const duty_profiles = await getPair(order);
    await setOrder((order + 1) % 15);
    // edit message to make the announcement
    await ctx.editMessageText(
      `🧹 Сегодня дежурят ${duty_profiles?.first.name} и ${duty_profiles?.second.name}`,
    );
  });
