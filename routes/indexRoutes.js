/*Load Modules                                      */
/****************************************************/
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Merchant = require('../models/merchant');
var Queue = require('../models/queue');
var avgTime = 2; // MINUTES





/*Ensure User is Logged In before Page Render       */
/****************************************************/
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}





/*Render Homepage                                   */
/****************************************************/
router.get('/', ensureAuthenticated, function(req, res){
	Queue.find({businessname: req.user.businessname}, function(err, doc, c) {
        if(err) {
            res.send(500);
            return;
        }
		
        Merchant.find({}, function(err, result){
		console.log('merchant businessnames:', result)
		
		var merchants = result;
		
		res.render('index', {queuedata: doc, merchantdata: merchants});
        });
		});		
});





/*Register Route to Render 'register' Page          */
/****************************************************/
router.get('/register', function(req, res){
    res.render('register');
});





/*Login Route to Render 'login' Page                */
/****************************************************/
router.get('/login', function(req, res){
    res.render('login');
});





/*Validate User Exists in Database                  */
/****************************************************/
passport.use('user', new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
        return done(null, false, {message: 'Unknown Username'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, user);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
}));





/*Validate Merchant Exists in Database              */
/****************************************************/
passport.use('merchant', new LocalStrategy(
  function(username, password, done) {
   Merchant.getMerchantByUsername(username, function(err, merchant){
    if(err) throw err;
    if(!merchant){
        return done(null, false, {message: 'Unknown Username'});
    }

    Merchant.comparePassword(password, merchant.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, merchant);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
}));





/*Passport Serialize and Deserialize                */
/****************************************************/
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Merchant.getMerchantById(id, function(err, user){
    if(err) done(err);
        if(user){
            done(null, user);
        } else {
            User.getUserById(id, function(err, user){
                if(err) done(err);
                done(null, user);
            })
        }
    })
});





/*If Not Logged In, Route to Index                  */
/****************************************************/
router.post('/loginuser',
  passport.authenticate(['user', 'merchant'], {successRedirect:'/', 
  failureRedirect:'/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});





/*Log Out User                                      */
/****************************************************/
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});





/*Export Router                                     */
/****************************************************/
module.exports = router;