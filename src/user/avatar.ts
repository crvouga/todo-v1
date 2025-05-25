import { bigEarsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

const styles = {
  "pixel-art": "pixel-art",
  "big-ears-neutral": "big-ears-neutral",
};

export const toAvatarUrl = ({ avatarSeed }: { avatarSeed: string }): string => {
  const avatar = createAvatar(bigEarsNeutral, {
    seed: avatarSeed,
  });
  return avatar.toDataUri();
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
