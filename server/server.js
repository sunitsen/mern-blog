import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import cloudinary from "cloudinary";
import Blog from "./Schema/Blog.js";

// Firebase Admin
import admin from "firebase-admin";


const serviceAccountKey = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),  // Handling newlines in the private key
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
}
import { getAuth } from "firebase-admin/auth";

// Schema
import User from "./Schema/User.js";


const server = express();
const PORT = process.env.PORT || 3000;

// config
cloudinary.v2.config({
    cloud_name: 'dkeaeg11x',
    api_key: '168123699794666',
    api_secret: '4Aqqe1vXL8DeMhOma7gHHeLmW9M'
});


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

const verifyJWT = (req, res, next) => {

        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ "error": "No access token or wrong format" });
        }
    
        const token = authHeader.split(" ")[1];
    
        jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ "error": "Invalid access token" });
            }
            req.user = user.id;
            next();
        });
};
    
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

server.get('/get-upload-url', async (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET },
            process.env.CLOUDINARY_API_SECRET
        );

        res.status(200).json({
            url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            timestamp,
            signature,
            api_key: process.env.CLOUDINARY_API_KEY,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


server.get("/trending-blogs", async (req, res) => {
        const blogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id") // Populate personal_info for author
            .sort({ "activity.total_read": -1, "activity.total_like": -1, "publishedAt": -1 })
            .select("blog_id title publishedAt -_id") // Select only the necessary fields for the blog
            .limit(5);

    

        return res.status(200).json({ blogs });
 
});

server.post("/all-latest-blogs-count", (req, res) =>{
    Blog.countDocuments({draft: false})
    .then(count =>{
        return res.status(200).json({totalDocs: count}) 
    })
    .catch(err =>{
        return res.status(500).json({error: err.message})
    })
})


server.post('/latest-blog', (req, res) => {

    let {page} = req.body;
    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id") // Populate the `author` field with `personal_info`
        .sort({ publishedAt: -1 }) // Sort in descending order of published date
        .select("blog_id title des banner tags activity publishedAt -_id") // Select only the necessary fields for the blog
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});


server.post("/search-blogs", (req, res) =>{
    let {tag, page, author, query, limit, eliminate_blog} = req.body
    let findQuery;


    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: {$ne: eliminate_blog} };
    } else if (query) { // Added `query` condition inside `else if`
        findQuery = { draft: false, title: new RegExp(query, "i") };
    }else if(author){
        findQuery = { author, draft: false };
    }


    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id") // Populate the `author` field with `personal_info`
        .sort({ publishedAt: -1 }) // Sort in descending order of published date
        .select("blog_id title des banner tags activity publishedAt -_id") // Select only the necessary fields for the blog
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs });
        })
      
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
})

server.post("/search-blogs-count", (req, res) =>{
    let {tag, author, query} = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) { // Added `query` condition inside `else if`
        findQuery = { draft: false, title: new RegExp(query, "i") };
    }else if(author){
        findQuery = { author, draft: false };
    }



    Blog.countDocuments(findQuery)
    .then(count =>{
        return res.status(200).json({totalDocs: count}) 
    })
    .catch(err =>{
        console.log(err.message)
        return res.status(500).json({error: err.message})
    })
})


server.post("/search-users", (req, res) => {
    let { query } = req.body; 


    User.find({ "personal_info.username": new RegExp(query, "i") })  // Use correct variable name
        .limit(50)
        .select("personal_info.username personal_info.fullname personal_info.profile_img -_id")
        .then(users => {  // Fixed typo in then
            return res.status(200).json({ users });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});


server.post("/get-profile", (req, res) =>{
    let {username} = req.body;
    User.findOne({"personal_info.username": username})
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user => {
        return res.status(200).json(user)
    })
    .catch(err =>{
        console.log(err)
        return res.status(500).json({error: err.message})
    })
})


server.post('/create-blog', verifyJWT, (req, res) => {
    let authorId = req.user;
    let { title, des, banner, tags, content, draft = undefined, id } = req.body;

    if (!title || !title.length) {
        return res.status(403).json({ "error": "You Must provide a blog title" });
    }

    if(!draft){
        
        if (!des || des.length > 200) {
            return res.status(403).json({ "error": "You must provide a blog description under 200 characters" });
        }
    
        if (!banner || !banner.length) {
            return res.status(403).json({ "error": "You must provide a banner to publish it" });
        }
    
        if (!content?.blocks || content.blocks.length === 0) { // Fixes 'undefined' error
            return res.status(403).json({ "error": "There must be some blog content to publish it" });
        }
    
        if (!tags || tags.length > 10) {
            return res.status(403).json({ "error": "Provide up to 10 tags to publish your blog" });
        }
    }

   

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if(id){
         Blog.findOneAndUpdate({blog_id}, {title, des, banner, content, tags, draft: draft ? draft : false})
         .then(blog =>{
            return res.status(200).json({ id: blog_id });
         })
         .catch(err =>{
            return res.status(500).json({error: err.message})
         })
    }else{
        let blog = new Blog({
            title, 
            des, 
            banner, 
            tags, 
            content, 
            author: authorId, 
            blog_id, 
            draft: Boolean(draft)
        });
    
        blog.save()
            .then(blog => {
                let incrementVal = draft ? 0 : 1;
    
                User.findOneAndUpdate(
                    { _id: authorId },
                    { 
                        $inc: { "account_info.total_posts": incrementVal }, 
                        $push: { "blogs": blog._id } 
                    }
                ).then(user => {
                    return res.status(200).json({ id: blog.blog_id });
                }).catch(err => {
                    return res.status(500).json({ "error": "Failed to update total post number" });
                });
    
            })
            .catch(err => {
                return res.status(500).json({ "error": err.message });
            });
    }

  
});



server.post("/get-blog", (req, res) =>{

    let { blog_id , draft, mode } = req.body;
    let incrementVal = mode !== 'edit' ? 1 : 0 ;

    Blog.findOneAndUpdate({blog_id}, { $inc : {"activity.total_reads": incrementVal}})
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then(blog =>{
       User.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username},{
        $inc: {"account_info.total_reads": incrementVal}
       })
       .catch(err =>{
        return res.status(500).json({error: err.message});
       })

       if(blog.draft && !draft){
          return res.status(500).json({error: "you can not access draft blogs"})
       }
      
       return res.status(200).json({blog})

    }).catch(err =>{
        return res.status(500).json({err: err.message})
    })

})


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


























