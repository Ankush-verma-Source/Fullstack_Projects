module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to generate a quiz.");
        return res.redirect('/home');
    }
    next();
}