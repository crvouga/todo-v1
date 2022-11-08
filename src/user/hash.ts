// todo implement

const hash = ({ password }: { password: string }): { passwordHash: string } => {
  return { passwordHash: password };
};

const isEqual = ({
  password,
  passwordHash,
}: {
  password: string;
  passwordHash: string;
}): boolean => {
  return password === passwordHash;
};

export default {
  hash,
  isEqual,
};
