import validateMongoId from "../utils/validateMongoId.js";

export const getProfile = async (model, id) => {
  validateMongoId(id);

  return await model.findById(id).select("-password -refreshToken");
};
