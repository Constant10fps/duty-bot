import { kv } from "../mod.ts";
import { Profile } from "./profile.ts";

type id = number;

interface ProfilePair {
  first: Profile;
  second: Profile;
}

const pairKey = (order: number) => ["pair", order];
const orderKey = ["order"];

export const setPair = async (
  profile1: Profile,
  profile2: Profile,
  order: number,
) => {
  await kv.set(
    pairKey(order),
    { first: profile1, second: profile2 } as ProfilePair,
  );
};

export const getPair = async (
  order: number,
) => (await kv.get<ProfilePair>(pairKey(order))).value;

export const setOrder = async (val: number) => await kv.set(orderKey, val);
export const getOrder = async () => (await kv.get<number>(orderKey)).value || 0;

export const listPairs = async () =>
  await Array.fromAsync(
    kv.list<ProfilePair>({ prefix: ["pair"] }),
    (e) => e.value,
  );

// TODO: fix the channel checking
// export const checkChannel = (id: number) =>
//   Deno.env.get("CHANNEL_ID") == String(id);
