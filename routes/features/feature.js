const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../../util/expressError.js");
const wrapAsync = require("../../util/wrapAsync.js");
const User = require("../../models/User.js");
const { isLoggedIn } = require("../../middleware.js");
const { generateMCQs  ,generateSummary, generateQuiz} = require("../../apiCalls.js");
const multer = require("multer");
const { storage } = require("../../cloudinaryConfig.js");
const upload = multer({ storage });
const { v4: uuidv4 } = require("uuid");
const GeneratedContent = require("../../models/content.js");


router.post(
  "/mcq",
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

        let content = await GeneratedContent.create({
          user: req.user._id,
          type: "mcq",
          fileId: fileId,
          meta: {
            questionCount,
            difficulty
          },
            data: mcqs
          });
        console.log(content);
        return res.render("generate/mcq.ejs" ,{mcqs});
      }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home");
  })
);

// generate summary:
router.post(
  "/summary",
  isLoggedIn,
  upload.single("file"),
  wrapAsync(async (req, res) => {
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/home");
    }

    let { summaryLength } = req.body;

    let user = await User.findById(req.user._id);
    let fileId = uuidv4();
    user.fileUrl.push({ path: req.file.path, fileId: fileId });
    let updatedUser = await user.save();

    console.log(updatedUser);

    for (let element of updatedUser.fileUrl) {
      if (element.fileId == fileId) {
        let generatedSummary = await generateSummary(element, summaryLength);
        console.log(generatedSummary);

        await GeneratedContent.create({
          user: req.user._id,
          type: "summary",
          fileId: fileId,
          meta: {
            summaryLength
          },
          data: generatedSummary
        });


        return res.render("generate/summary.ejs", { summary: generatedSummary });
      }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home");
  })
);


// generate quiz:
router.post(
  "/quiz",
  isLoggedIn,
  upload.single("file"),
  wrapAsync(async (req, res) => {
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/home");
    }

    let { quizType } = req.body;

    let user = await User.findById(req.user._id);
    let fileId = uuidv4();
    user.fileUrl.push({ path: req.file.path, fileId: fileId });
    let updatedUser = await user.save();

    console.log(updatedUser);

    for (let element of updatedUser.fileUrl) {
      if (element.fileId == fileId) {
        let generatedQuiz = await generateQuiz(element, quizType);

        if (typeof generatedQuiz === "string") {
          try {
            generatedQuiz = generatedQuiz.trim();

            // Remove ```json ... ```
            if (generatedQuiz.startsWith("```")) {
              generatedQuiz = generatedQuiz
                .replace(/^```json/, "")
                .replace(/^```/, "")
                .replace(/```$/, "")
                .trim();
            }
            generatedQuiz = JSON.parse(generatedQuiz);
            console.log(generatedQuiz);
          } catch (err) {
            console.error("Failed to parse quiz JSON", err);
            req.flash("error", "Invalid quiz format received.");
            return res.redirect("/home");
          }
        }

        await GeneratedContent.create({
          user: req.user._id,
          type: "quiz",
          fileId: fileId,
          meta: {
            quizType
          },
          data: generatedQuiz
        });

        return res.render("quiz.ejs", { quiz : generatedQuiz });
      }
    }
    req.flash("error", "File upload failed. Please try again.");
    return res.redirect("/home");
  })
);

module.exports = router;
