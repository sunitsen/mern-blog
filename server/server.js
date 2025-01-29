import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";

// Schema
import User from "./Schema/User.js";

const server = express();
const PORT = process.env.PORT || 3000; // Ensure dynamic PORT if not defined in env

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

// Ensure DB connection before starting server
mongoose.connect(process.env.DB_LOCATION, { autoIndex: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection failed', err);
    process.exit(1); // Exit the process if DB connection fails
  });

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
        username += nanoid().substring(0, 5); // Append nanoid if username exists
    }
    return username;
};

server.post('/signup', (req, res) => {
    let { fullname, email, password } = req.body;

    // Validation data from front end
    if (fullname.length < 3) {
        return res.status(400).json({ "error": "Fullname must be at least 3 characters long" });
    }
    if (!email.length) {
        return res.status(400).json({ "error": "Email is required" });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ "error": "Enter a valid email" });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ "error": "Password should be 6 to 20 characters long with numeric, 1 lowercase, and 1 uppercase letter" });
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        if (err) {
            return res.status(500).json({ "error": "Password hashing failed" });
        }

        let username = await generateUserName(email);

        let user = new User({
            personal_info: {
                fullname, 
                email, 
                password: hashed_password, 
                username
            }
        });

        user.save().then((u) => {
            return res.status(200).json(formDatatoSend(u));
        })
        .catch((err) => {
            if (err.code === 11000) {
                return res.status(409).json({ "error": "Email already exists" });
            }
            return res.status(500).json({ "error": err.message });
        });
    });
});

server.post('/signin', async (req, res) => {
    let { email, password } = req.body;

    try {
        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(404).json({ "error": "Email not found" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.personal_info.password);
        if (!isPasswordMatch) {
            return res.status(403).json({ "error": "Invalid password" });
        }

        // If login is successful, generate an access token
        return res.status(200).json(formDatatoSend(user));
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ "error": err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port --> ${PORT}`);
});
