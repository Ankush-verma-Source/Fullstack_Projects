if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
}


const express = require('express');
const app = express();
const port=process.env.PORT;
const path = require('path');


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// const fs = require('fs');
// const { GoogleAuth } = require('google-auth-library');
// const { PDFDocument } = require('pdf-lib');
// const { generateMCQs } = require('./mcqGenerator'); // Assume this is a separate module for MCQ generation

// app.use(express.urlencoded({ extended: true }));


// Ensure upload and results directories exist
// if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
// if (!fs.existsSync('results')) fs.mkdirSync('results');


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// new add for : upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// gemini api setup :
let  { GoogleGenAI } = require("@google/genai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main(input_text,num_questions) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
                        You are an AI assistant helping the user generate multiple-choice questions (MCQs) based on the following text:
                        '${input_text}'
                        Please generate ${num_questions} MCQs from the text. Each question should have:
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
                        NOTE: "Return without any code block or explanation."

                 
                `,
    });
    return response.text
}



// Routing :

app.get('/home', (req, res) => {
    res.render('index.ejs');
});


app.post('/generate', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.send("No file uploaded.");
    }

    // const filePath = path.join(__dirname, req.file.path);
    console.log(req.file.path);
    // const text = await extractTextFromFile(filePath); // Implement this function to extract text from PDF, DOCX, or TXT

    // if (text) {
    //     const numQuestions = parseInt(req.body.num_questions);
    //     const mcqs = await generateMCQs(text, numQuestions); // Implement this function to generate MCQs

    //     if (!mcqs) {
    //         return res.send("Failed to generate MCQs.");
    //     }

    //     const txtFilename = `generated_mcqs_${path.basename(req.file.originalname, path.extname(req.file.originalname))}.txt`;
    //     const pdfFilename = `generated_mcqs_${path.basename(req.file.originalname, path.extname(req.file.originalname))}.pdf`;

    //     fs.writeFileSync(path.join('results', txtFilename), mcqs);
    //     await createPDF(mcqs, path.join('results', pdfFilename)); // Implement this function to create a PDF

    //     res.render('results', { mcqs, txtFilename, pdfFilename });
    // } else {
    //     res.send("Failed to extract text from the uploaded file.");
    // }
    res.redirect("/home");
});



// demo : 
app.get("/demo" ,(req,res)=>{
    res.render("demo.ejs");
});

app.post("/results",async (req,res)=>{
        let response = req.body.query;


        let data = await main(response,1);
        const mcqs = JSON.parse(data);
        console.log(mcqs);
        res.render("demo.ejs",{mcqs});

});

app.get("/signup" ,(req,res)=>{
    res.render("signup.ejs");
});

app.get("/login" ,(req,res)=>{
    res.render("login.ejs");

});



app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})











// app.get('/download/:filename', (req, res) => {
//     const filePath = path.join('results', req.params.filename);
//     res.download(filePath);
// });



// Implement the extractTextFromFile, createPDF, and generateMCQs functions as needed
