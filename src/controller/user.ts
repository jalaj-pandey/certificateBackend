import { User } from "../model/user";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import { Request, Response } from "express";
dotenv.config();



interface CreateUserRequest extends Request {
    body: {
        name: string;
        email: string;
        password: string;
        role: "admin" | "user" | "intern";
        gender: "male" | "female";
        batch: "Web Development" | "Gen AI";
        phoneNo: number;
    };
}

export const createUser = async (req: CreateUserRequest, res: Response): Promise<void> =>{
    try {
        const {name, email, password, role, gender, batch, phoneNo } = req.body;

        if (!name || !email || !password || !gender || !batch || !phoneNo) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400).json({message: "User already exists"})
            return;
        }

        const existingPhone = await User.findOne({ phoneNo });
        if (existingPhone) {
            res.status(400).json({ message: "Phone number already exists" });
            return;
        }
        
        const newUser = await User.create({name, email, password, role, gender, batch, phoneNo});

        await newUser.save()

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || "heyweghow@gew", {
            expiresIn: "1d", 
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                gender: newUser.gender,
                batch: newUser.batch,
                phoneNo: newUser.phoneNo,
            },
            token, 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
}



export const userLogin = async(req: Request, res: Response) => {
    const { loginInput, password } = req.body;
    if (!loginInput || !password) {
        return res.status(400).json({
          message: "Please provide email/mobile number and password",
        });
      }
    
    try {
        let user;
        if(loginInput.includes('@')){
            user = await User.findOne({email:loginInput})
        } else{
            user = await User.findOne({phoneNo: loginInput})
        }
        if(!user){
            return res.status(404).json({
                message: "Invalid login credentials"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid login credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'heyweghow@gew', {
        expiresIn: '1h',
      });
  
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNo: user.phoneNo,
          role: user.role,
          status: user.status,
          certificates: user.certificates
        },
      });

    } catch (error) {
        console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
    }
}



export const getAllUsers = async(req: Request, res: Response) =>{
    const users = await User.find({}).sort({createdAt: -1})
    res.status(200).json({
        success: true,
        users,
    })   
}