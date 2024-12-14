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

const channelKey = (id: number) => ["channel", id];

export const checkChannel = async (id: number) =>
  (await kv.get<boolean>(channelKey(id))).value ? true : false;
