var db = require('../libs/db');
var UserSchema = new db.Schema({
    token : String,
	email: String,
    username : String,
	hashed_password: String, 
	salt : String,
	temp_str:String, 
    gender : String
})
var MyUser = db.mongoose.model('User', UserSchema);
// Exports
module.exports = MyUser;
/*module.exports.addUser = addUser;
// Add user to database
function addUser(username, password, email, gender, callback) {
    var instance = new MyUser();
    instance.username = username;
    instance.password = password;
    instance.email = email;
    instance.gender = gender;
    instance.save(function (err) {
        if (err) {
        callback(err);
        }
        else {
        callback(null, instance);
        }
    });*/
//}
