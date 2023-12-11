import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbConnect from "./db/dbConfig.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2002;
app.use(cookieParser());
app.use(cors());

dbConnect();
app.listen(PORT, () => {
  console.log(`Server start at http://localhost:${process.env.PORT}`);
});
