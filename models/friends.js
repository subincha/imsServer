var db = require('../libs/db');
var FriendsSchema = new db.Schema({
    id : String,
    username : {type: String, unique: true},
    friend: [{
        id : {type: String, unique: true},
        username : {type: String, unique: true},
        status : String
    }]
})
var Friends = db.mongoose.model('Friends', FriendsSchema);
// Exports
module.exports = Friends;
module.exports.addFriends = addFriends;
module.exports.updateFriendStatus = updateFriendStatus;
module.exports.updateFriends = updateFriends;
// Add userLog to database
function addFriends(id, username, friendId, friendUserName, status, callback) {
    var instance = new Friends({
        id : id,
        username : username,
        friend : {id : friendId,
                 username : friendUserName,
                 status : status
                 }
    });
     
    instance.save(function (err) {
        if (err) {
        callback(err);
        }
        else {
        callback(null, instance);
        }
    });
};

function updateFriendStatus(id, friendId, status, callback) {
   Friends.update(
        {id: id, 'friend.id' : friendId},
        {$set: {"friend.$.status" : status}},
        {safe: true, upsert: true},
        function(err, model) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, model);
            }

        });
};
    
function updateFriends(id, friendId, friendUserName, status, callback) {
     Friends.findOneAndUpdate(
        {id: id},
        {$push: {"friend": {"id" : friendId,
                           "username" : friendUserName,
                           "status" : status}}},
        {safe: true, upsert: true, new : true},
        function(err, model) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, model);
            }

        });
};
