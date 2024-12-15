import { Composer } from "https://deno.land/x/grammy@v1.33.0/composer.ts";
import { setProfile } from "../db/profile.ts";
import { checkRights } from "./duty.ts";
import { MyContext } from "../mod.ts";

export const studentsComposer = new Composer<MyContext>();

studentsComposer.chatType("private").filter((ctx) => checkRights(ctx)).command(
  "db",
  async (ctx) => {
    ctx.session.status = "db";
    await ctx.reply("Waiting for the students");
  },
);

studentsComposer.chatType("private")
  .filter((ctx) =>
    checkRights(ctx) &&
    ctx.session.status == "db"
  ).on("msg:text", async (ctx) => {
    const profiles = ctx.msg.text.split("\n").map((x) => x.split(" "));
    let order = 0;
    for (const profile of profiles) {
      await setProfile(profile[0], profile[1], order);
      order++;
    }
  });
