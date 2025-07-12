if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT;
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./util/expressError.js");
const wrapAsync = require("./util/wrapAsync.js");
const multer = require("multer");
const { storage } = require("./cloudinaryConfig.js");
const upload = multer({ storage });
const { v4: uuidv4 } = require("uuid");
const { isLoggedIn } = require("./middleware.js");

const { generateMCQs, generateSummary, generateQuiz } = require("./apiCalls.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// new add for : upload folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.engine("ejs", ejsMate);
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24,
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);
app.use(flash());

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/questiva");
}
main()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("error occur :", err);
  });

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.currentUser = req.user;
  res.locals.title = "QuizCraft - AI MCQ Generator";
  next();
});

// Routing :

app.get("/home", (req, res) => {
  res.render("home.ejs", { title: "Questiva AI Learning Platform" });
});

app.post(
  "/user/generate/mcq",
  isLoggedIn,
  upload.single("file"),
  wrapAsync(async (req, res) => {
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/home");
    }

    // this will never work b/c error caught during uploadin of document due to configuration:
    const allowedExtensions = ["pdf", "doc", "docx", "txt"];
    const fileName = req.file.originalname;
    const extension = fileName.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      req.flash(
        "error",
        "Invalid file format. Only PDF, DOC, DOCX, or TXT files are allowed."
      );
      return res.redirect("/home");
    }

    let { questionCount, difficulty } = req.body;
    console.log(req.file);

    let user = await User.findById(req.user._id);
    let fileId = uuidv4();
    user.fileUrl.push({ path: req.file.path, fileId: fileId });
    let updatedUser = await user.save();

    console.log(updatedUser);

    for (let element of updatedUser.fileUrl) {
      if (element.fileId == fileId) {
        let mcqs = await generateMCQs(element, questionCount, difficulty);
        mcqs = JSON.parse(mcqs);
        console.log(mcqs);
        req.session.mcqs = mcqs;
        return res.redirect("/user/generated-MCQs");
        // return res.render("mcq.ejs" ,{mcqs});
      }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home");
  })
);
app.get("/user/generated-MCQs", (req, res) => {
  if (!req.session.mcqs) {
    req.flash("error", "No MCQs generated. Please try again.");
    return res.redirect("/home");
  }
  res.render("mcq.ejs", { mcqs: req.session.mcqs });
});




// generate summary:
app.post(
  "/user/generate/summary",
  isLoggedIn,
  upload.single("file"),
  wrapAsync(async (req, res) => {
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/home");
    }


    let { summaryLength} = req.body;

    let user = await User.findById(req.user._id);
    let fileId = uuidv4();
    user.fileUrl.push({ path: req.file.path, fileId: fileId });
    let updatedUser = await user.save();

    console.log(updatedUser);

    for (let element of updatedUser.fileUrl) {
      if (element.fileId == fileId) {
        let generatedSummary = await generateSummary(element , summaryLength);
        // summary = JSON.parse(summary);
        console.log(generatedSummary);
        // req.session.summary = summary;
        // return res.redirect("/user/generated-summary");
        return res.render("summary.ejs" ,{summary : generatedSummary});
      }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home")

  })
);


// generate quiz:
app.post(
  "/user/generate/quiz",
  isLoggedIn,
  upload.single("file"),
  wrapAsync(async (req, res) => {
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/home");
    }


    let { quizType} = req.body;

    let user = await User.findById(req.user._id);
    let fileId = uuidv4();
    user.fileUrl.push({ path: req.file.path, fileId: fileId });
    let updatedUser = await user.save();

    console.log(updatedUser);

    for (let element of updatedUser.fileUrl) {
      if (element.fileId == fileId) {
        let generatedQuiz = await generateQuiz(element , quizType);
        // generatedQuiz = JSON.parse(generatedQuiz);
        console.log(generatedQuiz);

        // console.log("typeof quiz:", typeof generatedQuiz);
        // console.log("isArray:", Array.isArray(generatedQuiz));
        // console.log("quiz value:", generatedQuiz);


        if (typeof generatedQuiz === 'string') {
        try {
            generatedQuiz = generatedQuiz.trim();

            // Remove ```json ... ```
            if (generatedQuiz.startsWith('```')) {
            generatedQuiz = generatedQuiz.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            }

            generatedQuiz = JSON.parse(generatedQuiz);
        } catch (err) {
            console.error("Failed to parse quiz JSON", err);
            req.flash("error", "Invalid quiz format received.");
            return res.redirect("/home");
        }
        }

        return res.render("quiz.ejs" ,{quiz : generatedQuiz});
      }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home")

  })
);

app.post('/quiz/fixed', isLoggedIn, async (req, res) => {
  try {
    const { questionIndex, timestamp } = req.body;

    const user = await User.findById(req.user._id);
    user.quizInteractions = user.quizInteractions || [];

    const existing = user.quizInteractions.find(
      (entry) => entry.questionIndex === Number(questionIndex)
    );

    if (existing) {
      existing.fixed = true;
      existing.fixedTimestamp = timestamp;
    }

    await user.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Error in /quiz/fixed:", err);
    res.status(500).json({ error: 'Fixed tracking failed.' });
  }
});

app.post('/quiz/mark', isLoggedIn, async (req, res) => {
  try {
    const { questionIndex, timestamp } = req.body;

    const user = await User.findById(req.user._id);
    user.quizInteractions = user.quizInteractions || [];

    const existing = user.quizInteractions.find(
      (entry) => entry.questionIndex === Number(questionIndex)
    );

    if (existing) {
      existing.marked = !existing.marked;
      existing.markTimestamp = timestamp;
    } else {
      user.quizInteractions.push({
        questionIndex: Number(questionIndex),
        marked: true,
        markTimestamp: timestamp,
      });
    }

    await user.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Error in /quiz/mark:", err);
    res.status(500).json({ error: 'Mark tracking failed.' });
  }
});


app.post('/quiz/track', isLoggedIn, async (req, res) => {
  try {
    const { questionIndex, question, type, known, timestamp } = req.body;

    const user = await User.findById(req.user._id);
    user.quizInteractions = user.quizInteractions || [];

    const existing = user.quizInteractions.find(
      (entry) => entry.questionIndex === Number(questionIndex) && entry.type === type
    );

    if (existing) {
      existing.known = known;
      existing.timestamp = timestamp;
    } else {
      user.quizInteractions.push({
        questionIndex: Number(questionIndex),
        question,
        type,
        known,
        timestamp
      });
    }

    await user.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error("Error in /quiz/track:", err);
    res.status(500).json({ error: 'Tracking failed.' });
  }
});





app.use("/", require("./routes/user/user.js"));



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
app.all("/{*any}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  console.log(err);

  let { status = 500, message = "some thing went wrong" } = err;
  res.status(status).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
