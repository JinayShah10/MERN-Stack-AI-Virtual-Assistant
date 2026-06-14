import express from "express";
import dotevn from "dotenv";
import connectDB from "./config/db.js"

dotevn.config()
const PORT = process.env.PORT || 5000;

const app = express();

app.listen(PORT,(req,res)=>{
    connectDB();
    console.log("Server Started!")
})