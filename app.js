var express     = require('express');
var bodyParser  = require('body-parser');
var logger      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var port        = process.env.PORT || 3000;
var jwt         = require('jwt-simple');

var config      = require('./config/database'); // get db config file
var User        = require('./models/user'); // get the mongoose model

var app         = express();

//get our request parameters
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

//log to console
app.use(logger('dev'));

//Use the passport package in our application
app.use(passport.initialize());

//demo route
/*app.get('/',function(req,res){
	res.json({
		message:'API is running successfully'
	});
});*/

app.use(express.static(__dirname+'/angular'));

//connect to database
mongoose.connect(config.url);

//require('./config/passport')(passport);

//bundle our routes
var router = express.Router();
app.use('/api',router);

//POST to create new user
router.post('/signup',function(req,res){
	if(!req.body.username || !req.body.password){
		res.json({ success: false, msg: 'Please enter username and password'});
	}
	else{
		User.findOne({username:req.body.username},function(err,user){
			if(err)
				res.json(err);
			
			if(user){
				res.json({ success: false, msg: 'Username already taken.Try others.'})
			}
			else{
				save();
			}
		});
		
		function save(){
			var newUser = new User({
				username:req.body.username,
				password:req.body.password,
				firstname:req.body.firstname,
				lastname:req.body.lastname
			});
			
			newUser.save(function(err,user){
				if (err) {
			        res.json({success: false, msg: 'Something going wrong.'});
			      }
				
			      res.json({success: true, msg: 'Successfully Registered.Please Login.',user:user});
			});
		}
		
	}
});

//POST to authenticate
router.post('/authenticate',function(req,res){
	if(!req.body.username || !req.body.password){
		res.json({ success: false, msg: 'Please enter username and password'});
	}
	else{
		User.findOne({ username:req.body.username},function(err,user){
			if(err)
				res.json({success:false, msg:'Error.Something going wrong'});
			
			if (!user) {
			      res.send({success: false, msg: 'Authentication failed. User not found.'});
			    }
			else{
				//check if password matches
				user.comparePassword(req.body.password,function(err,isMatch){
					if(isMatch && !err){
						//if user is found and password is right create a token
						var token = jwt.encode(user,config.secret);
						//return the token
						res.json({
							success: true,
							token: 'JWT '+token
						});
					}
					else{
						res.send({success: false, msg: 'Authentication failed. Wrong password.'});
					}
				});
			}
		});
	}
});

//route to restricted info
router.get('/memberinfo',function(req,res){
	//var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token = getToken(req.headers);
	if(token){
		var decoded = jwt.decode(token,config.secret);
		User.findOne({username:decoded.username},function(err,user){
			if(err)
				res.json({success:false, msg:'Error.Something going wrong'});
			
			if (!user) {
			      res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
			    } else {
			          res.json({success: true, user: user,  msg: 'Welcome in the member area ' + user.username + '!'});
		        }
		});
	}
	else {
	    return res.status(403).send({success: false, msg: 'No token provided.'});
	  }
});

//get all users
router.post('/users',function(req,res){
	//var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var token = getToken(req.headers);
	if(token){
		var decoded = jwt.decode(token,config.secret);
		User.find({},function(err,user){
			if(err)
				res.json({success:false, msg:'Error.Something going wrong'});
			
			if (!user) {
			      res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
			    } else {
			          res.json({success: true, users:user });
		        }
		});
	}
	else {
	    return res.status(403).send({success: false, msg: 'No token provided.'});
	  }
});

//count all users
router.get('/count',function(req,res){
	User.count().exec(function(err,count){
		if(err)
			res.json(err);
		
		res.json({success: true,count:count});
	});
});

getToken = function(headers){
	if(headers && headers.authorization){
		var parted = headers.authorization.split(' ');
		//console.log(parted);
		//console.log(parted[1]);
		if(parted.length === 2){
			return parted[1];
		}
		else{
			return null;
		}
	}
	else{
		return null;
	}
};


app.listen(port);
console.log('Server is litening at '+port);