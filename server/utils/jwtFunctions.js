import jwt from "jsonwebtoken";

export const generateAccessToken = async function (id, name, email, role) {
  console.log(process.env.ACCESS_TOKEN_SECRET);
  return jwt.sign(
    {
      _id: id,
      name: name,
      email: email,
      role: role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const generateRefreshToken = async function (id, name, email, role) {
  return jwt.sign(
    {
      _id: id,
      name: name,
      email: email,
      role: role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const verifyJwtToken = async (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.log(error.message);
    throw new Error("Invalid Token!");
  }
};
