import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateToken from "../config/token.js"

export const signUp = async (req,res)=>{
    try{
        const {name,email,password} = req.body;

        const existEmail = await User.findOne({email});

        if(existEmail){
            return res.status(400).json({message: "Email already exists.!"});
        }

        if(password.length<6){
            return res.status(400).json({message: "Password must be of atleast 6 characters.!"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            password:hashedPassword,
            email,
        });

        const token = await generateToken(user._id);
        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"None",
            secure:true,
        })

        return res.status(201).json(user)
    }
    catch(error){
        return res.status(400).json({ message: `Failed to Sign Up! ${error}` });
    }
}

export const logIn = async (req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "Email does not exist.!"});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({message: "Incorrect Password.!"});
        }

        const token = await generateToken(user._id);
        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"None",
            secure:true,
        })

        return res.status(200).json(user)
    }
    catch(error){
        return res.status(500).json({ message: `Failed to Log In! ${error}` });
    }
}

export const logOut = async (req,res)=>{
    try{
        res.clearCookie("token");
        return res.status(200).json({message:"Logged Out Successfully"})
    }
    catch(error){
        return res.status(500).json({ message: `Failed to Log Out! ${error}` });
    }
}
