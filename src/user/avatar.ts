export const createToAvatarUrl = async (): Promise<
  (avatarSeed: string) => string
> => {
  const { createAvatar } = await import("@dicebear/core");
  const { bigEarsNeutral } = await import("@dicebear/collection");
  return (avatarSeed: string) =>
    createAvatar(bigEarsNeutral, {
      seed: avatarSeed,
    }).toDataUri();
};

let toAvatarUrlFn: (seed: string) => string;
export const toAvatarUrl = (seed: string): string => {
  if (typeof toAvatarUrlFn === "function") {
    return toAvatarUrlFn(seed);
  }
  createToAvatarUrl().then((fn) => {
    toAvatarUrlFn = fn;
  });
  return " ";
};

toAvatarUrl("123");

export const getRandomAvatarSeed = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  let avatarSeed = "";
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(characters.length * Math.random());
    const randomCharacter = characters[randomIndex];
    avatarSeed = `${avatarSeed}${randomCharacter}`;
  }
  return avatarSeed;
};
