import express from "express";
import dotevn from "dotenv";
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";


dotevn.config()
const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter);

app.listen(PORT,(req,res)=>{
    connectDB();
    console.log("Server Started!");
})