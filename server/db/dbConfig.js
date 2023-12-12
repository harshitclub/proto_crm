import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async () => {
  const mongo_uri = process.env.MONGO_URI;

  return new Promise((resolve, reject) => {
    mongoose
      .connect(`${mongo_uri}/${DB_NAME}`)
      .then(() => {
        console.log("DB Connected: ", mongoose.connection.host);
        resolve();
      })
      .catch((err) => {
        console.log(err);
        reject(new Error("DB Connection Error!"));
      });
  });
};

export default dbConnect;
