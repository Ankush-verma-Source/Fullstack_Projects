const express = require('express');
const router = express.Router({mergeParams: true});
const ExpressError = require('../../util/expressError.js');
const wrapAsync = require('../../util/wrapAsync.js');
const passport = require("passport");
const User = require("../../models/User.js");



router.get("/signup" ,(req,res)=>{
    res.render("users/signup.ejs", { title: 'SignUp | Questiva ' });
});
router.post("/signup" ,wrapAsync(async(req,res)=>{
    try {
        let user = req.body.user;
        let userInfo = {
            username : user.username,
            name : user.name,
            email : user.email
        };
        let newUser = await User.register(userInfo,user.password);
        req.login(newUser, (err) => {
            if (err) {
                next(err); // error handling
                return;
            }

            req.flash("success","login successfully");
            res.redirect(`/home`);
            
        });
    }catch(err){
        // console.log(err.message);
        req.flash("error",err.message);
        res.redirect("/signup");
    }
    
    
}));

router.get("/login" ,(req,res)=>{
    res.render("users/login.ejs", { title: 'Login | Questiva' });
});

router.post("/login" ,passport.authenticate("local",{failureRedirect:"/login",failureFlash : true}) ,wrapAsync(async (req,res)=>{
    // console.log(req.user._id);
    req.flash("success", "Login successful!");

    res.redirect(`/home`);
    
}));


router.get("/logout" , (req,res)=>{
    req.logout((err)=>{
        if (err) {
            return next(err);
            
        }
        req.flash("success", "Logout successful!");
        res.redirect("/home");
    });
    
});


module.exports = router;