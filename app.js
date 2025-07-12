if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
}


const express = require('express');
const app = express();
const port=process.env.PORT;
const path = require('path');
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User.js");
const ejsMate = require("ejs-mate");
const ExpressError = require('./util/expressError.js');
const wrapAsync = require('./util/wrapAsync.js');
const multer = require('multer');
const { storage } = require('./cloudinaryConfig.js');
const upload = multer({ storage });
const { v4 : uuidv4 } = require('uuid');
const { isLoggedIn } = require("./middleware.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// new add for : upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.engine("ejs", ejsMate);
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires :Date.now() + 1000 * 60 * 60 * 24,
        maxAge : 1000 * 60 * 60 * 24,
        httpOnly : true,
    }
}));
app.use(flash());

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/questiva');
}
main()
.then(()=>{
    console.log("Database connected");
})
.catch((err) =>{
    console.log("error occur :",err);
});



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    res.locals.title = "QuizCraft - AI MCQ Generator";
    next();
});

// gemini api setup :
let  { GoogleGenAI , createPartFromUri} = require("@google/genai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function gemminiAI(fileElement, questCount , difficulty) {
    
    const pdfBuffer = await fetch(fileElement.path)
        .then((response) => response.arrayBuffer());

    const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

    const file = await ai.files.upload({
        file: fileBlob,
        config: {
            displayName: 'A17_FlightPlan.pdf',
        },
    });

    // Wait for the file to be processed.
    let getFile = await ai.files.get({ name: file.name });
    while (getFile.state === 'PROCESSING') {
        getFile = await ai.files.get({ name: file.name });
        console.log(`current file status: ${getFile.state}`);
        console.log('File is still processing, retrying in 5 seconds');

        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });
    }
    if (file.state === 'FAILED') {
        throw new Error('File processing failed.');
    }

    // Add the file to the contents.
    const content = [
        ` You are an AI assistant helping the user generate multiple-choice questions (MCQs) based on the text in the provided document:
                        Please generate ${questCount} MCQs of ${difficulty} difficulty level of MCQs from the text. Each question should have:
                        - A clear question
                        - Four answer options (labeled A, B, C, D)
                        - The correct answer clearly indicated
                        Format:
                        Return the MCQs as a JSON array of objects, where each object has:
                        - "question": the question text
                        - "options": an array of four options (A, B, C, D)
                        - "correct": the correct option letter ("A", "B", "C", or "D")

                        Example:
                        [
                        {
                            "question": "What is the capital of France?",
                            "options": ["Paris", "London", "Berlin", "Madrid"],
                            "correct": "Paris"
                        },
                        ...
                        ]
                        NOTE: "Return without any code block or explanation." `
    ];

    if (file.uri && file.mimeType) {
        const fileContent = createPartFromUri(file.uri, file.mimeType);
        content.push(fileContent);
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: content,
    });

    return(response.text);

}



// Routing :

app.get('/home', (req, res) => {
    res.render('home.ejs', { title: "QuizCraft - AI MCQ Generator" } );
});


app.post('/home/generate', isLoggedIn, upload.single('file'), wrapAsync(async (req, res) => {
    if (!req.file) {
        req.flash("error", "No file uploaded.");
        return res.redirect("/home");
    }

    // this will never work b/c error caught during uploadin of document due to configuration:
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const fileName = req.file.originalname;
    const extension = fileName.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      req.flash("error", "Invalid file format. Only PDF, DOC, DOCX, or TXT files are allowed.");
      return res.redirect("/home");
    }

    let {questionCount , difficulty} = req.body; 
    console.log(req.file);

    let user = await User.findById(req.user._id);
    let fileId = uuidv4();
    user.fileUrl.push({path:req.file.path, fileId: fileId});
    let updatedUser = await user.save();

    console.log(updatedUser);

    for (let element of updatedUser.fileUrl) {
        if(element.fileId == fileId){
            let mcqs= await gemminiAI(element,questionCount, difficulty);
            mcqs = JSON.parse(mcqs);
            console.log(mcqs);
            return res.render("demo.ejs" ,{mcqs});
        }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home");

}));



app.use('/', require('./routes/user/user.js'));
// demo : 
// app.get("/demo" ,(req,res)=>{
//     res.render("demo.ejs");
// });

// app.post("/results",wrapAsync(async (req,res)=>{
//         let response = req.body.query;


//         let data = await geminiAI(response,1);
//         const mcqs = JSON.parse(data);
//         console.log(mcqs);
//         res.render("demo.ejs",{mcqs});

// }));




// error handling :
app.all('/{*any}', (req,res,next)=>{
    next( new ExpressError(404 , "Page Not Found"));
});


app.use((err,req ,res ,next)=>{
    // console.log(err);
    
    let { status=500 , message="some thing went wrong"} = err;
    res.status(status).render("error.ejs", {message});
});



app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})




