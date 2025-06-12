import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
dotenv.config();


export function saveUser(req, res){
    if(req.body.role == "admin" ){
        if(req.user == null ){
            res.status(403).json({
                message : "Please login as  admin before creating admin account"
            });
            return;
        }
        if(req.user.role != "admin"){
            res.status(403).json({
                message : "You are not authorized to create an account"
            });
            return;
        }
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    console.log(hashedPassword)

    const user = new User ({
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : hashedPassword,
        role : req.body.role,
        
    });

    user.save().then(
        () => {
        res.json({
            message : "User saved successfully"
        })
    }).catch(
        () => {
        res.status(500).json({
            message : "Error"
        })
    })
}


export function loginUser(req, res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email : email
    }).then((user) => {
        if(user == null){
            res.status(404).json({
                message : "Invalid email"
            })
        }else{
            const isPasswordCorrect = bcrypt.compareSync(password, user.password)
            if(isPasswordCorrect){
              const userData = {
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                phone : user.phone,
                isDissable : user.isDissable,
                isverify : user.isverify,

              }

              const token = jwt.sign(userData,process.env.JWT_KEY)
              res.json({
                message : "Login Successful",
                token : token,
                user : userData,
              });
              
            }else{
                res.status(403).json({
                    message : "Invalid password"
                })
            }
        }
    })
}  

export async function googleLogin(req, res) {
    const accessToken = req.body.accessToken;

    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const existingUser = await User.findOne({
            email: response.data.email
        });

        let userData;
        if (!existingUser) {
            const newUser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                isVerified: true,
                password: bcrypt.hashSync(accessToken, 10), // hashed accessToken to store as placeholder
                role: "user",
                phone: "Not given",
                isDisabled: false
            });

            await newUser.save();
            userData = {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                phone: newUser.phone,
                isDisabled: newUser.isDisabled,
                isVerified: newUser.isVerified,
            };
        } else {
            userData = {
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                role: existingUser.role,
                phone: existingUser.phone,
                isDisabled: existingUser.isDisabled,
                isVerified: existingUser.isVerified,
            };
        }

        const token = jwt.sign(userData, process.env.JWT_KEY, {
            expiresIn: "48h"
        });

        res.json({
            message: "Login Successful",
            token: token,
            user: userData,
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Google Login Failed"
        });
    }
}
