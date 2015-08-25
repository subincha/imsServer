var db = require('../libs/db');
var MessageSchema = new db.Schema({
    participant : [String],
    message : String,
    from : String,
    to : String,
    groupName : String,
    type : String, //msg, stiker
    status : {type: String, default : "delivered"}, //seen or not
    date : {type: Date, default : Date.now}
})
var Message = db.mongoose.model('Message', MessageSchema);
// Exports
module.exports = Message;
module.exports.addMessage = addMessage;
module.exports.updateMessageStatus = updateMessageStatus;

function addMessage(participant, message, from, to, groupName, type, callback) {
    var instance = new Message({
                participant : participant,
                message : message,
                from : from,
                to : to,
                groupName : groupName,
                type : type
                });
     
                instance.save(function (err) {
                    if (err) {
                    callback(err);
                    }
                    else {
                    callback(null, instance);
                    }
                    }   );
};

function updateMessageStatus(id, callback) {
   Friends.update(
        {_id: id},
        {$set: {"status" : "seen"}},
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


    
/*
var MessageSchema = new db.Schema({
    id : String,
    username : {type: String, unique: true},
    message: [{
        form : String,
        participant : [String],
        content : [{
            name : String,
            message : String,
            date : Date.now()
        }],
    }]
})
var Message = db.mongoose.model('Message', MessageSchema);
// Exports
module.exports = Message;
module.exports.addMessage = addMessage;

// Add userLog to database
function addMessage(id, username, form, participant, name, message, callback) {
    Message.findOne({id : id}, function(err, msg) {
        if(msg === null) {
                var instance = new UserLog({
                id : id,
                username : username,
                message: [{
                form : form,
                participant : participant,
                content : [{
                    name : name,
                    message : message,
                        date : Date.now()
                    }],
                }]
                });
     
                instance.save(function (err) {
                    if (err) {
                    callback(err);
                    }
                    else {
                    callback(null, instance);
                    }
                    }   );
        } else {
            Message.findOne({'message.participant' : participant}, function(err, msg) {
                if(msg !== null) {
                    Message.findOneAndUpdate(
                    {id: id, 'message.form' : form, 'message.participant' : participant},
                    {$push: {"message": {"content" : {"name" : name,
                                                     "message" : message}}}},
                    {safe: true, upsert: true, new : true},
                    function(err, model) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            callback(null, model);
                        }

                        });
                } else {
                        Message.findOneAndUpdate(
                        {id: id},
                        {$push: {"message": {"form" : form,
                                             "participant" : participant,
                                             "content" : {"name" : name,
                                                         "message" : message}}}},
                        {safe: true, upsert: true, new : true},
                        function(err, model) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback(null, model);
                            }

                            });
                }
            });
            
            }
        });
    
};
*/
