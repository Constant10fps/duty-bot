import { kv } from "../mod.ts";

const adminKey = (id: number) => ["admin", id];
const channelKey = (id: number) => ["channel", id];

export const setAdmin = async (
  id: number,
) => (await kv.set(adminKey(id), true));

const getAdmin = async (id: number) =>
  (await kv.get<boolean>(adminKey(id))).value;

export const checkAdmin = async (id: number) =>
  await getAdmin(id) ? true : false;

export const setChannel = async (id: number) =>
  await kv.set(channelKey(id), true);

const getChannel = async (id: number) =>
  (await kv.get<boolean>(channelKey(id))).value;

export const checkChannel = async (id: number) => {
  const allowed = await getChannel(id);
  return allowed ? true : false;
};
