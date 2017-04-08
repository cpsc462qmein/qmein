/*Load Modules                                      */
/****************************************************/
var express = require('express');
var router = express.Router();

var Merchant = require('../models/merchant');
var Queue = require('../models/queue');

var avgTime = 2; //Time Listed in Minutes




/*Register Merchant                                 */
/****************************************************/
router.post('/registermerchant', function(req, res){
	
	/*Validation*/
	var businessname = req.body.businessname;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var username = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	req.checkBody('firstname', 'First Name is required.').notEmpty();
	req.checkBody('lastname', 'Last Name is required.').notEmpty();
	req.checkBody('phonenumber', 'Phone Number is required.').notEmpty();
	req.checkBody('phonenumber', 'Phone Number not valid.').isInt();
	req.checkBody('email', 'Email is required.').notEmpty();
	req.checkBody('email', 'Email is not valid.').isEmail();
	req.checkBody('password', 'Password is required.').notEmpty();
	req.checkBody('password2', 'Passwords do not match.').equals(req.body.password);

	var errors = req.validationErrors();

	/*Register and Render Page*/
	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newMerchant = new Merchant({
			businessname: businessname,
			firstname: firstname,
			lastname: lastname,
			phonenumber: phonenumber,
			username: username,
			password: password
		});

		Merchant.createMerchant(newMerchant, function(err, merchant){
			if(err) throw err;
			console.log(merchant);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/login');
	}
});




/*Delete from Queue                                 */
/****************************************************/
router.post('/completeTransaction', function(req, res){
	// find the user with id 
	Queue.findByIdAndRemove(req.body.id, function(err) {
		if (err) throw err;
		// deleted the user
		console.log('User deleted!');
		});

	res.redirect('/');
});




/*Export Router                                     */
/****************************************************/
module.exports = router;