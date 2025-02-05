import { kv } from "../mod.ts";

export interface Profile {
  name: string;
  surname: string;
}

const profileKey = (id: number) => ["profile", id];
export const getProfile = async (id: number) =>
  (await kv.get<Profile>(profileKey(id))).value;

export const setProfile = async (
  name: string,
  surname: string,
  id: number,
) => (await kv.set(
  profileKey(id),
  { name: name, surname: surname } as Profile,
));

export const listProfiles = async () => (await Array.fromAsync(
  kv.list<Profile>({ prefix: ["profile"] }),
  (e) => e.value,
));
