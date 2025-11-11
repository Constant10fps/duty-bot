import { kv } from "../mod.ts";
import { Profile } from "./profile.ts";

interface Group {
  members: Profile[];
}

const pairKey = (order: number) => ["pair", order];
const orderKey = () => ["order"];

export const getGroup = async (order: number) =>
  (await kv.get<Group>(pairKey(order))).value;

export const setGroup = async (
  profiles: Profile[],
  order: number,
) => await kv.set(pairKey(order), { members: profiles } as Group);

export const getOrder = async () => (await kv.get<number>(orderKey())).value;
export const setOrder = async (max: number) =>
  await kv.set(orderKey(), Math.floor(Math.random() * max));
