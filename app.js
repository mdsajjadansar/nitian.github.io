require('dotenv').config();
const express = require("express");

const app = express();

app.use(express.json());
const _ = require("lodash");
const md5 = require("md5");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const https = require("https");
const request = require("request");
app.set("view engine", "ejs");
const otpGenerator = require('otp-generator');
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const fast2sms = require("fast-two-sms");
//app.use(bodyParser.json());
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/auth", { useNewUrlParser: true });
//mongoose.set("useCreateIndex", true);
let userSchema = new mongoose.Schema({
        email: String,
        password: String,
        googleId: String,
    })
    //const secret = "thisisourlitlesecret";
    //userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
passport.use(new GoogleStrategy({
        clientID: process.env.Client_Id,
        clientSecret: process.env.client_secret,
        callbackURL: "http://localhost:5000/auth/google/secret",
        userProfileUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));
app.post("/sendMessage", function(req, res) {
    const options = { authorization: process.env.API_KEY, message: req.body.message, numbers: [req.body.number] };
    return fast2sms.sendMessage(options).then((response) => {
            console.log(response)
        }).catch((err) => {
            console.log(err);
        })
        // console.log(req.body.number);
        //console.log(req.body.message);
})
app.get("/", function(req, res) {
    res.render("home.ejs");
})
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/secret',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/home');
    });
app.get("/register", function(req, res) {
    res.render("register");
})
app.get("/login", function(req, res) {
    res.render("login");
});
app.get("/header", function(req, res) {
    res.render("header");
})
app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("home");
    } else {
        res.redirect("/login");
    }
})
app.listen(5000, function(req, res) {

    console.log("your server is running at 9000");
});
app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.email,
        password: md5(req.body.password)
    });
    newUser.save().then((success) => {
        console.log('user saved successfull');
    }).catch((err) => {
        console.log(`error while saving ${err}`);
    })
    res.render("home");

});
app.get("/sendMessage", function(req, res) {
    res.render("sendMessage");
})
app.post("/login", function(req, res) {
    const username = req.body.email;
    const password = md5(req.body.password);
    User.findOne({ email: username }).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password == password) {
                //  console.log("susfsf");
                res.render("home");
            }
        }
    }).catch((err) => {
        console.log(err);
    })

})