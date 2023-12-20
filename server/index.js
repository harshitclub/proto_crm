// Imports necessary libraries
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Imports database connection function
import dbConnect from "./db/dbConfig.js";

// Imports routes for different functionalities
import superAdminRouter from "./routes/superAdmin.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
import accountRouter from "./routes/account.routes.js";
import opportunityRouter from "./routes/opportunity.routes.js";
import contactPersonRouter from "./routes/contact.person.routes.js";
import todoRouter from "./routes/todo.routes.js";
import { limiter } from "./middlewares/rate.limiter.js";

// Configure environment variables
dotenv.config();

// Create the Express app
const app = express();

// Set the port for server listening
const PORT = process.env.PORT || 2002;

// Middleware setup
// - Parses JSON data
app.use(express.json());

// - Parses URL-encoded data with specific limit
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// - Enables cookie parsing
app.use(cookieParser());

// - Enables cross-origin resource sharing
app.use(cors());

// Rate Limit Middleware
app.use(limiter);

// Handling the invalid route
// app.use(handleInvalidRoute);

app.use("/api/v1/super-admin", superAdminRouter); // super admin router middleware
app.use("/api/v1/admin", adminRouter); // admin router middleware
app.use("/api/v1/user", userRouter); // user router middleware
app.use("/api/v1/account", accountRouter); // account router middleware
app.use("/api/v1/opportunity", opportunityRouter); // opportunity router middleware
app.use("/api/v1/contact-person", contactPersonRouter); // contact-person router middleware
app.use("/api/v1/todo", todoRouter); // todo router middleware

// Database connection and server start
dbConnect();
app.listen(PORT, () => {
  console.log(`Server start at http://localhost:${process.env.PORT}`);
});
