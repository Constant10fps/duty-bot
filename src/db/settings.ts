import { kv } from "../mod.ts";

interface Settings {
  groupsNumber: number;
  peopleInGroup: number;
  peopleInClass: number;
}

const settingsKey = () => ["settings"];

export const getSettings = async () =>
  (await kv.get<Settings>(settingsKey())).value;

export const setSettings = async (
  numberOfGroups: number = 15,
  peopleInGroup: number = 2,
  peopleInClass: number = 30,
) =>
  await kv.set(
    settingsKey(),
    {
      groupsNumber: numberOfGroups,
      peopleInGroup: peopleInGroup,
      peopleInClass: peopleInClass,
    } as Settings,
  );
