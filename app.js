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
// const path = require('path');
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

// new add for : upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));







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





app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})











// app.get('/download/:filename', (req, res) => {
//     const filePath = path.join('results', req.params.filename);
//     res.download(filePath);
// });



// Implement the extractTextFromFile, createPDF, and generateMCQs functions as needed
