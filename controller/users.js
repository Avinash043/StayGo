const User = require("../models/user.js");

module.exports.renderSignup = (req,res)=>{
    res.render("user/signUp.ejs");
};

module.exports.signUp = async (req,res,next) => {
    try{
        let {username , email , password } = req.body;
        const newUser = new User ({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to StayGo");
            res.redirect("/listings");
        });
        
    } catch(e){
        req.flash("error", e.message);
        // console.log(e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogin = (req,res)=>{
    res.render("user/login.ejs");
};

module.exports.login = async( req,res)=>{
    req.flash("success", "Welcome to StayGo");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) =>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!!");
        res.redirect("/listings");
    });
};