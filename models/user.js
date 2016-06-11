var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
	username:{
		type:String,
		unique:true,
		required:true
	},
	password:{
		type:String,
		required:true
	},
	firstname:String,
	lastname:String
});

userSchema.pre('save',function(next){
	var user = this;
	if(this.isModified('password') || this.isNew){
		bcrypt.genSalt(10,function(err,salt){
			if(err)
				return next(err);
			
			bcrypt.hash(user.password,salt,function(err,hash){
				if(err)
					return next(err);
				
				user.password = hash;
				next();
			});
		});
												}
	else{
		return next();
	}
	
});

userSchema.methods.comparePassword = function(passw,cb){
	bcrypt.compare(passw,this.password,function(err,isMatch){
		if(err)
			return cb(err);
		
		return cb(null,isMatch);
	});
}

module.exports = mongoose.model('User',userSchema);