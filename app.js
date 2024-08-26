if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose= require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings= require("./routes/listing.js");
const review= require("./routes/review.js");
const userRouter= require("./routes/userRouter.js");
//const paymentRoute = require('./routes/paymentRoute');

const dbUrl = "mongodb://127.0.0.1:27017/wonderlust";

//const dbUrl= process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connect");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// app.get("/",(req,res) =>{
//     res.send("hii");
// });
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 *1000,
    httpOnly: true,
  },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser",async (req, res) =>{
//   let fakeuser =  new User({
//     email: "a@gmail.com",
//     username: "delta",
//   });
//   let registeredUser = await User.register(fakeuser,"hello");
//   res.send(registeredUser);
// });

app.use("/listings", listings);
app.use("/listings/:id/reviews", review);
app.use("/", userRouter);
//app.use('/',paymentRoute);

app.all("*",(req ,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{ message });
  //  res.status(statusCode).send(message);
});

// app.get('/listings/<%= listing._id %>/payment', function (req, res) {
//   res.render('payPage', {
//       key: process.env.PUBLISHABLE_KEY
//   })
// });

// app.post('/listings/<%= listing._id %>/pay', function (req, res) {

//   stripe.customers.create({
//       email: req.body.stripeEmail,
//       source: req.body.stripeToken,
//       name: 'John Doe',
//       address: {
//           line1: '123 Main Street',
//           postal_code: '12345',
//           city: 'Anytown',
//           state: 'California',
//           country: 'USA',
//       }
//   })
//       .then((customer) => {

//           return stripe.charges.create({
//               amount: 3500,
//               description: 'Web Development Service',
//               currency: 'USD',
//               customer: customer.id
//           });
//       })
//       .then((charge) => {
//           res.send("<h2>Success</h2>")
//       })
//       .catch((err) => {
//           res.send(err)
//       });
// })


app.listen(8000,() =>{
    console.log("server is listening tp 8000");
});