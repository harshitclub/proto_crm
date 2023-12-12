import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbConnect from "./db/dbConfig.js";
import superAdminRouter from "./routes/superAdmin.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2002;
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/super-admin", superAdminRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);

dbConnect();
app.listen(PORT, () => {
  console.log(`Server start at http://localhost:${process.env.PORT}`);
});
