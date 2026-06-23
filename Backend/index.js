import express from "express";
import dotevn from "dotenv";
dotevn.config()
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import geminiResponse from "./gemini.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))
app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);

app.get("/",async (req,res)=>{
    let prompt = req.query.prompt;
    let data = await geminiResponse(prompt);
    res.json(data);
})

app.listen(PORT,(req,res)=>{
    connectDB();
    console.log("Server Started!");
})