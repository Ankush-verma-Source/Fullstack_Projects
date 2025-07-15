const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../../middleware.js");
const GeneratedContent = require("../../models/content.js");
const wrapAsync = require("../../util/wrapAsync.js");
const User = require("../../models/User.js");

router.get("/" , isLoggedIn, wrapAsync(async (req,res)=>{
    const contents = await GeneratedContent.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.render("dashboard.ejs", { title: 'Dashboard', contents });

}));

router.get("/view/:id", isLoggedIn, wrapAsync(async (req, res) => {
  const content = await GeneratedContent.findById(req.params.id);

  if (!content || !content.user.equals(req.user._id)) {
    req.flash("error", "Access denied or content not found.");
    return res.redirect("/dashboard");
  }

  if (content.type === "summary") {
      res.render(`dashView/summary`, { summary:content.data });
  }else if (content.type === "mcq") {
    res.render(`dashView/mcq`, { mcqs : content.data });
  } else if (content.type === "quiz") {
    res.render(`dashView/quiz`, { quiz: content.data });
  } else {
    req.flash("error", "Invalid content type.");
    return res.redirect("/dashboard");
  }

}));

router.get("/filter", isLoggedIn, wrapAsync(async (req, res) => {
  const { type, date } = req.query;
  let query = { user: req.user._id };

  if (type) query.type = type;


  const contents = await GeneratedContent.find(query).sort({ createdAt: -1 });
  res.render("dashboard", { contents });
}));



// DELETE generated content by ID
router.post("/delete/:id", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;

  const deleted = await GeneratedContent.findOneAndDelete({
    _id: id,
    user: req.user._id, // Ensure users can only delete their own content
  });

  if (!deleted) {
    req.flash("error", "Content not found or unauthorized.");
    return res.redirect("/dashboard");
  }

  req.flash("success", "Content deleted successfully.");
  res.redirect("/dashboard");
}));


// profile route :
router.get("/profile", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("partials/profile", { user });
}));

// Update profile
router.post("/profile", isLoggedIn, wrapAsync(async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { username, email }, { new: true , runValidators: true});
    req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", "Profile updated successfully!");
    res.redirect("/dashboard");
  });
}));

module.exports = router;