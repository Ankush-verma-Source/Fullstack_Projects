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


app.use("/dashboard", require("./routes/dashboard/dashboard.js"));
app.use("/user/generate", require("./routes/features/feature.js"));

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
