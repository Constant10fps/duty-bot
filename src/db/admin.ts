import { kv } from "../mod.ts";

const adminKey = (id: number) => ["admin", id];

export const setAdmin = async (
  id: number,
) => (await kv.set(adminKey(id), true));

const getAdmin = async (id: number) =>
  (await kv.get<boolean>(adminKey(id))).value;

export const checkAdmin = async (id: number) =>
  await getAdmin(id) ? true : false;
