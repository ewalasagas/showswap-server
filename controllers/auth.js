const User = require('../models/user');
const jwt = require('jsonwebtoken'); //to generate signed token
const expressJwt = require('express-jwt'); //for authorization check
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.signup = (req, res) => {
    console.log("req.body", req.body);
    const user = new User(req.body);
    user.save((error, user) => {
        if(error) {
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        //To hide password and salt
        // user.hashed_password = undefined;
        // user.salt = undefined;
        res.json({
            user
        });
    });
};

exports.signin = (req, res) => {
    //find the user based on email
    const {email, password} = req.body;
    User.findOne({email}, (error, user) => {
        if(error || !user) {
            return res.status(400).json({
                error: 'User does not exist. Please register.'
            })
        }
        //if user found, then make sure email and password match
        //create authenticate model in user model
        if(!user.authenticate(password)) {
            console.log(user);
            return res.status(401).json({
                error: 'Email and password dont match'
            });
        } 
             //Generate signed token with user id and secret
            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
            console.log(token);
            //persist the token as 't' in cooke with expirty date
            res.cookie("t", token, {expire: new Date() + 9999});
            //return response with user and token to frontend client
            const {_id, firstName, lastName, email, role} = user;
            return res.json({token, user: {_id, email, firstName, lastName, role}});
    })
}

exports.signout = (req, res) => {
    //now just need to clear cookie
    res.clearCookie("t");
    res.json({message:"Sign out success!"});
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!user) {
        return res.status(403).json({
            error: 'Access denied'
        });
    };
    next();
};

exports.isAdmin = (req, res, next) => {
  if(req.profile.role === 0) {  //admin is 1
      return res.status(403).json({
          error: "Admin resource! Access denied"
      });
  }
  next();
};