import { verifyJwtToken } from "../utils/jwtFunctions.js";

const getToken = (req) => {
  return (
    req.cookies?.proto_access ||
    req.header("Authorization")?.replace("Bearer ", "")
  );
};

export const auth = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).send({ error: "Unauthorized Request" });
  }

  try {
    const decodedToken = await verifyJwtToken(token);

    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    return res.status(error.status || 500).send({ error: error.message });
  }
};
