/*Load Modules                                      */
/****************************************************/
var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Queue = require('../models/queue');
var Merchant = require('../models/merchant');

var avgTime = 2; //Time Listed in Minutes





/*Register User                                     */
/****************************************************/
router.post('/registeruser', function(req, res){
	
	/*Validation*/
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
		var newUser = new User({
			firstname: firstname,
			lastname: lastname,
			phonenumber: phonenumber,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		
		res.redirect('/login');
	}
});





/*Add to Queue                                      */
/****************************************************/
router.post('/addtoqueue', function(req, res){
	
	Merchant.find({}, function(err, merchant){
		console.log('merchant businessnames:', merchant)
		
	var merchants = merchant;	
	var merchantemail = req.body.merchantemail;
	
		console.log('merchant username/email:', merchantemail);
		
	Merchant.findOne({username: merchantemail}, function(err, merchantresult){
			if (err) throw err;
			console.log('found merchant business name:', merchantresult.businessname);
		
	/*Get User Info*/
	var businessname = merchantresult.businessname;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var phonenumber = req.body.phonenumber;
	var email = req.body.email;
	var statusButton = req.body.statusButton;
	
	/*Verify Business Name*/
	console.log('The business name is', businessname);
	console.log('The button clicked is', statusButton);
	
	
	if (statusButton == 'checkLine')
	{
		 Queue.count({businessname: businessname}, function(err, count){
            console.log('Total number in Queue', count);
			res.render('index', {count: count, merchantdata: merchants});
        });
	} else {
	/*Check if User Exists in Queue*/
	Queue.findOne({email:email}, function(err, result){
		if(err) throw err;
		
		/*If User is not in Queue, then Add to Queue*/
		if(!result)
		{
			var newQueue = new Queue({
				businessname: businessname,
				firstname: firstname,
				lastname: lastname,
				phonenumber: phonenumber,
				email: email
			});
	
			Queue.createQueue(newQueue, function(err, queue){
				if(err) throw err;
			});
		
			console.log('The following user added to queue:', businessname);
			console.log(firstname, lastname);
			console.log(phonenumber);
			console.log(email);
			
			
			Queue.count({businessname: businessname}, function(err, inQueue){
			console.log('inqueue is', inQueue);
			if(inQueue == 0)
			{ 
				var waitTime = 0;
			} else {
			    var waitTime = inQueue * avgTime;
			}
			inQueue = inQueue + 1;
			console.log('inqueue is', inQueue);
			res.render('queuestatus', {inQueue: inQueue, waitTime: waitTime, businessname: businessname});
			})
			
		}
		else
		{
			Queue.findOne({email: email}, function(err, result){
				if (err) throw err;
				console.log('found', result.businessname);
			
			var businessname = result.businessname;
			
			Queue.count({businessname: businessname}, function(err, inQueue){
			console.log('Refresh: inqueue is', inQueue);
			if(inQueue == 0)
			{ 
				var waitTime = 0;
			} else {
			    var waitTime = (inQueue - 1) * avgTime;
			}
			
			console.log('Refresh: inqueue is', inQueue);
			res.render('queuestatus', {inQueue: inQueue, waitTime: waitTime, businessname: businessname});
			})
			})
		}
	});
	}
	});
});
});




/*Remove from Queue                                 */
/****************************************************/
router.post('/queueOut', function(req,res){
	
	var id = req.body.id;
	console.log('the id is', id);
	User.findOne({_id: id}, function(err, result){
		if (err) throw err;
		console.log('found id, and their email is', result.username);
		
		var email = result.username;
		
		Queue.findOneAndRemove({email: email}, function(err, result){
			if (err) throw err;
			console.log('the result of deleting:', result);
		})
	})
	res.redirect('/');
});



/*Export Router                                     */
/****************************************************/
module.exports = router;