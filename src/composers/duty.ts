import { Composer, Context, InlineKeyboard, SessionFlavor } from "grammy";
import { session } from "https://deno.land/x/grammy@v1.33.0/convenience/session.ts";
import { freeStorage } from "https://deno.land/x/grammy_storages@v2.4.2/free/src/adapter.ts";
import { listProfiles, Profile } from "../db/profile.ts";
import { getOrder, getPair, listPairs, setOrder, setPair } from "../db/duty.ts";
// import { checkChannel } from "../db/duty.ts";

// Session Data shenannigans
interface SessionData {
  status?: "pairs" | "approval";
  studentList?: Profile[];
}
export type MyContext = Context & SessionFlavor<SessionData>;

export const dutyComposer = new Composer<MyContext>();
dutyComposer.use(
  session({
    initial: () => ({}),
    storage: freeStorage<SessionData>(Deno.env.get("TOKEN") || ""),
  }),
);

dutyComposer.use(async (ctx, next) => {
  console.log(ctx.chatId);
  await next();
});
// check for admin and status
const checkStatus = (ctx: MyContext, status: SessionData["status"]) =>
  ctx.session.status == status && ctx.session.studentList != undefined;
const checkRights = (ctx: MyContext) =>
  ctx.from?.id == Number(Deno.env.get("ADMIN_ID"));

dutyComposer.chatType("private").command("cancel", async (ctx) => {
  ctx.session.status = undefined;
  await ctx.reply("Действие отменено");
});
// recieve /create from admin
dutyComposer.chatType("private").command("create").filter(
  (ctx) => checkRights(ctx),
  async (ctx) => {
    ctx.session.studentList = await listProfiles();
    ctx.session.status = "pairs";
    ctx.reply(
      `sure\n\n here are you're classmates:\n ${
        ctx.session.studentList.map(
          (x, idx) => `${idx + 1}. ${x.name} ${x.surname}`,
        ).join("\n")
      }\nChoose pairs.`,
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

      ctx.reply("Done!");
      // 2. give pairs to the user and approve
      const result = (await listPairs()).map((x) =>
        `${x.first.name} ${x.first.surname} и ${x.second.name} ${x.second.surname}`
      ).join("\n");
      const keyboard = new InlineKeyboard();
      keyboard.text("Да", "yes").text("Нет", "no");
      ctx.reply(`${result}\nПравильно?`, { reply_markup: keyboard });
      // 3. set status waiting for an approval
      ctx.session.status = "approval";
    } else {
      ctx.reply("Ошибка, пропиши /create еще раз");
      ctx.session.status = undefined;
    }
  },
);
// check pairs
dutyComposer.chatType("private").callbackQuery("yes").filter(
  (ctx) => checkStatus(ctx, "approval") && checkRights(ctx),
  async (ctx) => {
    ctx.session.status = undefined;
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

// send message to channel
dutyComposer.chatType("channel")
  .command("duty", async (ctx) => {
    const order = await getOrder();
    const duty_profiles = await getPair(order);
    await setOrder((order + 1) % 15);
    // edit message to make the announcement
    await ctx.editMessageText(
      `🧹 Сегодня дежурят ${duty_profiles?.first.name} ${duty_profiles?.first.surname} и ${duty_profiles?.second.name} ${duty_profiles?.second.surname}`,
    );
  });
