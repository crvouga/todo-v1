type ToAvatarUrl = (input: { avatarSeed: string }) => string;
export const createToAvatarUrl = async (): Promise<ToAvatarUrl> => {
  const { createAvatar } = await import("@dicebear/core");
  const { bigEarsNeutral } = await import("@dicebear/collection");
  return (input: { avatarSeed: string }) =>
    createAvatar(bigEarsNeutral, {
      seed: input.avatarSeed,
    }).toDataUri();
};

let toAvatarUrlFn: ToAvatarUrl;
export const toAvatarUrl: ToAvatarUrl = (input) => {
  if (typeof toAvatarUrlFn === "function") {
    return toAvatarUrlFn(input);
  }
  createToAvatarUrl().then((fn) => {
    toAvatarUrlFn = fn;
  });
  return " ";
};

toAvatarUrl({ avatarSeed: "123" });

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
