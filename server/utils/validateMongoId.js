import mongoose from "mongoose";

const validateMongoId = (id) => {
  const validate = mongoose.Types.ObjectId.isValid(id);

  if (!validate) {
    throw new Error("This ID is not valid or Not Found!");
  }
};

export default validateMongoId;
