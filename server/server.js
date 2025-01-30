import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";

// Firebase Admin
import admin from "firebase-admin";
import serviceAccountKey from "./mern-blog-74aa2-firebase-adminsdk-fbsvc-a8bcca4434.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";

// Schema
import User from "./Schema/User.js";

const server = express();
const PORT = process.env.PORT || 3000;




// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
});






server.use(express.json());
server.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.DB_LOCATION, { autoIndex: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('MongoDB connection failed', err);
        process.exit(1);
    });

// Helper function to format user data
const formDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

const generateUserName = async (email) => {
    let username = email.split('@')[0];
    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernameNotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

// User Signup
server.post('/signup', async (req, res) => {
    let { fullname, email, password } = req.body;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (fullname.length < 3) return res.status(400).json({ "error": "Fullname must be at least 3 characters long" });
    if (!email.length) return res.status(400).json({ "error": "Email is required" });
    if (!emailRegex.test(email)) return res.status(400).json({ "error": "Enter a valid email" });
    if (!passwordRegex.test(password)) return res.status(400).json({ "error": "Password should be 6-20 characters long with numeric, 1 lowercase, and 1 uppercase letter" });

    try {
        const hashed_password = await bcrypt.hash(password, 10);
        let username = await generateUserName(email);

        let user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            }
        });

        await user.save();
        return res.status(200).json(formDatatoSend(user));

    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ "error": "Email already exists" });
        return res.status(500).json({ "error": err.message });
    }
});

// User Sign-in
server.post('/signin', async (req, res) => {
    let { email, password } = req.body;

    try {
        const user = await User.findOne({ "personal_info.email": email });
        if (!user) return res.status(404).json({ "error": "Email not found" });
        if(!user.google_auth){
            const isPasswordMatch = await bcrypt.compare(password, user.personal_info.password);
            if (!isPasswordMatch) return res.status(403).json({ "error": "Invalid password" });
    
            return res.status(200).json(formDatatoSend(user));
    
        }else{
           return res.status(403).json({"error": "Account was cerated using google"})   
        }
      
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    }
});






// Google Authentication
server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;
    getAuth()
    .verifyIdToken(access_token)
    .then(async (decoratedUser) =>{
     let { email, name, picture } = decoratedUser;
     picture = picture.replace("s96-c", "s384-c")
     let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
     .then((u) =>{
        return u || null
     }).catch(err =>{
        return res.status(500).json({"error" : err.message})
     })

     if(user){  //login
        if(!user.google_auth){
           return res.status(403).json({"error" : "This account is not registered with google"})
        }

     }else{ // sign up
        let username = await generateUserName(email);
        user = new User({
            personal_info: {
                fullname: name,
                email,
                profile_img: picture,
                username
            },
            google_auth: true
        });
        await user.save().then((u) =>{
            user = u;
        })
        .catch(err =>{
            return res.status(500).json({"error" : err.message})
        })
     }


     return res.status(200).json(formDatatoSend(user));
    })
    .catch(err =>{
        return res.status(500).json({"error" : "Failed to authenticate you with google. Try with some other google account"})
    })
});










server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
