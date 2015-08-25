var db = require('../libs/db');
var NotificationSchema = new db.Schema({
    id : String,
    username : {type: String, unique: true},
    notification: [{
        friend : [{
            from: String,
            fid: String
        }],
        message : [{
            from: String,
            to: String,
            msg : String
        }]
    }]
})
var Notification = db.mongoose.model('Notification', NotificationSchema);
// Exports
module.exports = Notification;
module.exports.addFriendNotification = addFriendNotification;
module.exports.addMessageNotification = addMessageNotification;
module.exports.updateFriendNotification = updateFriendNotification;
module.exports.updateMessageNotification = updateMessageNotification;
// Add userLog to database
function addFriendNotification(id, username, from, fid, callback) {
    var instance = new Notification({
        id : id,
        username : username,
        notification : {friend : {
                            from: from, 
                            fid: fid
                        }
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

function addMessageNotification(id, username, notify, from, to, msg, callback) {
    var instance = new Notification({
        id : id,
        username : username,
        notification : {message : notify
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

    
function updateFriendNotification(id, from, fid, callback) {
     Notification.findOneAndUpdate(
        {id: id},
       {$push: {"notification": {"friend" : {"from" : from, "fid" : fid}}}},
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

function updateMessageNotification(id, notify, callback) {
     Notification.findOneAndUpdate(
        {id: id},
        {$push: {"notification": {"message" : notify}}},
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
