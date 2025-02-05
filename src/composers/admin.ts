import { Composer, Context } from "grammy";
import { adminId, BotContext, checkStatus } from "../mod.ts";
import { getSettings, setSettings } from "../db/settings.ts";
import { getProfile, listProfiles, setProfile } from "../db/profile.ts";
import { setGroup, setOrder } from "../db/duty.ts";

export const adminComposer = new Composer<BotContext>();

// cancel everything (mischief prone)
adminComposer.chatType("private").command("cancel", async (ctx) => {
  ctx.session.status = undefined;
  await ctx.reply("Action Cancelled. ✔");
});

// settings
adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .command("settings", async (ctx) => {
    ctx.session.status = "settings";
    const settings = await getSettings();
    await ctx.reply(
      `
      <b>Current settings:</b>

      # of groups: ${settings?.groupsNumber},
      # of people in a group: ${settings?.peopleInGroup},
      # of people in a class: ${settings?.peopleInClass}

      Enter the new settings one in a column as listed above or <code>/cancel</code>.
      `,
      { parse_mode: "HTML" },
    );
  });

adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .filter((ctx) => checkStatus(ctx, "settings"))
  .on("msg:text", async (ctx) => {
    ctx.session.status = undefined;
    const newsettings = ctx.msg.text.split("\n").map(Number);
    if (newsettings.length == 3) {
      await setSettings(newsettings[0], newsettings[1], newsettings[2]);
      await ctx.reply("Hope you typed the right settings! They are set.");
    } else {
      await ctx.reply(
        "You did not enter the full settings, please type them again.",
      );
    }
  });

// list the students
adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .command("students", async (ctx) => {
    const students = await listProfiles();
    await ctx.reply(
      `Sure! Here are the students I know:\n\n${
        students.map((val, idx) => `${idx + 1}.${val.name} ${val.surname}`)
          .join("\n")
      }`,
    );
  });

// input the students
adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .command("db", async (ctx) => {
    ctx.session.status = "db";
    await ctx.reply("Waiting for students list");
  });

adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .filter((ctx) => checkStatus(ctx, "db"))
  .on("msg:text", async (ctx) => {
    ctx.session.status == undefined;
    const students = ctx.msg.text.split("\n").map((val) => val.split(" "));
    const boo = await checkStudentList(students);
    ctx.reply(boo);
    if (boo == "all right") {
      for (let idx = 0; idx < students.length; idx++) {
        await setProfile(students[idx][0], students[idx][1], idx);
      }
      ctx.reply("Done! ✔");
    } else {
      ctx.reply("something went wrong...");
    }
  });

// groups stuff
adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .command("groups", async (ctx) => {
    ctx.session.status = "groups";
    const students = await listProfiles();
    ctx.reply(
      `students:\n${
        students.map((val, idx) => `${idx + 1}. ${val.name} ${val.surname}`)
          .join("\n")
      }\n\n write groups as idxs of students.`,
    );
  });

adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .filter((ctx) => checkStatus(ctx, "groups"))
  .on("msg:text", async (ctx) => {
    ctx.session.status = undefined;
    const groups = ctx.msg.text.split("\n").map((val) => val.split(" "));
    const response = await checkGroupList(groups);
    if (response == "all right") {
      for (let idx = 0; idx < groups.length; idx++) {
        const group = (await Promise.all(
          groups[idx].map((id) => getProfile(Number(id) - 1)),
        )).filter((e) => e != null);

        await setGroup(group, idx);
      }
      await ctx.reply("Done! ✔");
    } else {
      await ctx.reply(response);
    }
  });

// order stuff
adminComposer.chatType("private")
  .filter((ctx) => checkUser(ctx))
  .command("order", async (ctx) => {
    const text = ctx.msg.text.split(" ");
    if (text.length == 2 && Number(text[1]) >= 0) {
      await setOrder(Number(text[1]));
      await ctx.react("⚡");
    } else {
      await ctx.react("😐");
    }
  });

// functions
const checkUser = (ctx: Context) => ctx.from?.id == adminId;

const checkStudentList = async (students: string[][]) => {
  const settings = await getSettings();
  if (students.length != settings?.peopleInClass) {
    return "length not right";
  }
  for (const student of students) {
    if (student.length != 2) {
      return "student not right";
    }
  }
  return "all right";
};

const checkGroupList = async (groups: string[][]) => {
  const settings = await getSettings();
  if (groups.length != settings?.groupsNumber) {
    return "groups # not right";
  }
  for (const group of groups) {
    if (group.length > settings.peopleInGroup) {
      return "group length not right";
    }
    for (const idx of group) {
      if (!(Number(idx) <= settings.peopleInClass)) {
        return "idx not right";
      }
    }
  }
  return "all right";
};
