import { kv } from "../mod.ts";

export interface Profile {
  name: string;
  surname: string;
}

export const profileKey = (id: number) => ["profile", id];

export const getProfile = async (id: number) =>
  (await kv.get<Profile>(profileKey(id))).value;

export const setProfile = async (
  first_name: string,
  last_name: string,
  id: number,
) => {
  await kv.set(
    profileKey(id),
    { name: first_name, surname: last_name } as Profile,
  );
};

export const listProfiles = async () => (await Array.fromAsync(
  kv.list<Profile>({ prefix: ["profile"] }),
  (e) => e.value,
));
