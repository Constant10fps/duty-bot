import { kv } from "../mod.ts";

export interface Profile {
  name: string;
  surname: string;
  isFree: boolean;
}

export const profileKey = (id: number) => ["profile", id];

export const getProfile = async (id: number) =>
  (await kv.get<Profile>(profileKey(id))).value;

export const listProfiles = async () => (await Array.fromAsync(
  kv.list<Profile>({ prefix: ["profile"] }),
  (e) => e.value,
));
