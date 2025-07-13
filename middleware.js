module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be loggedIn to access features");
        return res.redirect('/login');
    }
    next();
}