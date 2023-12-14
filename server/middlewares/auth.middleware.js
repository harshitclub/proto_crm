import { verifyJwtToken } from "../utils/jwtFunctions.js";
import Admin from "../models/admin.model.js";
import validateMongoId from "../utils/validateMongoId.js";

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

export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, async () => {
      const adminId = await req.decodedToken._id;

      validateMongoId(adminId);
      console.log(adminId);
      const admin = await Admin.findById(adminId);

      // Authorization check
      if (!admin) {
        throw new Error(401, "Invalid admin token");
      } else if (admin.role !== "Admin") {
        throw new Error(403, "Insufficient permissions for this route");
      }

      next();
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(400).send({ error: "Invalid admin token format" });
    } else if (error.status) {
      return res.status(error.status).send({ error: error.message });
    } else {
      return res.status(500).send({ error: "Internal server error" });
    }
  }
};
