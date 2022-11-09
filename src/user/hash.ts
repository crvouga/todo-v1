import bcrypt from "bcrypt";
import { Err, Ok, type Result } from "../utils";

const saltRounds = 10;

const hash = async ({
  password,
}: {
  password: string;
}): Promise<Result<string, { passwordHash: string }>> => {
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return Ok({ passwordHash: passwordHash });
  } catch (error) {
    return Err("Failed to hash password");
  }
};

const isEqual = async ({
  password,
  passwordHash,
}: {
  password: string;
  passwordHash: string;
}): Promise<boolean> => {
  const doesMatch = await bcrypt.compare(password, passwordHash);
  return doesMatch;
};

export default {
  hash,
  isEqual,
};
