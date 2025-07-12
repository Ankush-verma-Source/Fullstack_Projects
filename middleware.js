module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be logged In to access features");
        return res.redirect('/login');
    }
    next();
}