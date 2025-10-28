import User from "../model/userModel.js";
import validator from "validator"
import bcrypt from "bcryptjs"
import { genToken, genToken1 } from "../config/token.js";


export const registration = async (req,res) => {
   try {
     const {name , email, password} = req.body;
     const existUser = await User.findOne({email})
     if(existUser){
         return res.status(400).json({message:"User already exist"})
     }
     if(!validator.isEmail(email)){
          return res.status(400).json({message:"Enter valid Email"})
     }
     if(password.length < 8){
         return res.status(400).json({message:"Enter Strong Password"})
     }
     let hashPassword = await bcrypt.hash(password,10)

     const user = await User.create({name,email,password:hashPassword})
     let token = await genToken(user._id)
     res.cookie("token",token,{
         httpOnly:true,
         secure:false,
         sameSite: "Strict",
         maxAge: 7 * 24 * 60 * 60 * 1000
     })

     return res.status(201).json(user)
   } catch (error) {
     console.log("registration error")
     return res.status(500).json({message:`registration error ${error}`})
   }

 }


export const login = async (req,res) => {
    try {
        let {email,password} = req.body;
        let user = await User.findOne({email}) 
        if(!user){
            return res.status(404).json({message:"User is not Found"})
        }
        let isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Incorrect password"})
        }
        let token = await genToken(user._id)
        res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.status(201).json(user)

    } catch (error) {
         console.log("login error")
    return res.status(500).json({message:`Login error ${error}`})
        
    }
    
}
export const logOut = async (req,res) => {
try {
    res.clearCookie("token")
    return res.status(200).json({message:"logOut successful"})
} catch (error) {
    console.log("logOut error")
    return res.status(500).json({message:`LogOut error ${error}`})
}
    
}


export const googleLogin = async (req,res) => {
     try {
         console.log("Google login request received:", req.body);
         let {name , email} = req.body;
         if (!email) {
             console.error("No email provided in request");
             return res.status(400).json({message: "Email is required"});
         }
         console.log("Checking if user exists for email:", email);
         let user = await User.findOne({email})
         if(!user){
             console.log("User not found, creating new user");
             user = await User.create({
                 name,email
             })
             console.log("New user created:", user._id);
         } else {
             console.log("Existing user found:", user._id);
         }

         console.log("Generating token for user:", user._id);
         let token = await genToken(user._id)
         console.log("Token generated successfully");

         res.cookie("token",token,{
         httpOnly:true,
         secure:false,
         sameSite: "Strict",
         maxAge: 7 * 24 * 60 * 60 * 1000
     })
     console.log("Cookie set, sending response");
     return res.status(200).json(user)

     } catch (error) {
          console.error("googleLogin error:", error);
          console.error("Error stack:", error.stack);
     return res.status(500).json({message:`googleLogin error ${error.message}`})
     }

 }


export const adminLogin = async (req,res) => {
    try {
        let {email , password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
        let token = await genToken1(email)
        res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        sameSite: "Strict",
        maxAge: 1 * 24 * 60 * 60 * 1000
    })
    return res.status(200).json(token)
        }
        return res.status(400).json({message:"Invaild creadintials"})

    } catch (error) {
        console.log("AdminLogin error")
    return res.status(500).json({message:`AdminLogin error ${error}`})
        
    }
    
}

