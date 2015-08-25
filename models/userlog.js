var db = require('../libs/db');
var UserLoginSchema = new db.Schema({
    id : String,
    username : {type: String, unique: true},
    email : String,
    status : String,
    gender : String,
    loggedOn: [{
        date : {type : Date, default : Date.now()}
    }]
})
var UserLog = db.mongoose.model('UserLog', UserLoginSchema);
// Exports
module.exports = UserLog;
module.exports.addUserLog = addUserLog;
// Add userLog to database
function addUserLog(id, username, email, status, gender, callback) {
    var instance = new UserLog({
        id : id,
        username : username,
        email : email,
        
        status : status,
        gender : gender,
        loggedOn : {date : Date.now()}
    });
     
    instance.save(function (err) {
        if (err) {
        callback(err);
        }
        else {
        callback(null, instance);
        }
    });
}
