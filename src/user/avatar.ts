const styles = {
  "pixel-art": "pixel-art",
  "big-ears-neutral": "big-ears-neutral",
};
// docs: https://avatars.dicebear.com
export const toAvatarUrl = ({ avatarSeed }: { avatarSeed: string }): string => {
  return `https://avatars.dicebear.com/api/${styles["big-ears-neutral"]}/${avatarSeed}.svg`;
};

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
