import bcrypt from "bcrypt";

export const passwordHash = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const isPasswordCorrect = async (userPassword, dbPassword) => {
  return bcrypt.compare(userPassword, dbPassword);
};
