var User = require('../models/users');
var UserLog = require('../models/userlog');
var Friends = require('../models/friends');
var register = require('../models/register');
var Message = require('../models/messages');
var Notification = require('../models/notification');
var crypto = require('crypto');
var rand = require('csprng');

module.exports = {
    getUser : function(req, res) {
      // app.get('/signinMobile', function(req, res) {
        //var username = "subin";//req.body.username;
       // var password = encryptPassword("subin");//req.body.password;
        User.find(function(err, user) {
            if(err) {
                //return res.send(err);
                throw err;
            } else {
                // res.render('index',{users: user[0].username});
                return res.json(user); 
            }
        });
    },
    
    getUserLog : function(req, res) {
      // app.get('/signinMobile', function(req, res) {
        var username = req.params.username;//req.body.username;
        UserLog.findOne({username : username}, function(err, userlog) {
            if(err) {
                //return res.send(err);
                throw err;
            } else {
                // res.render('index',{users: user[0].username});
                return res.json(userlog); 
            }
        });
    },
    
    getFriend : function(req, res) {
      // app.get('/signinMobile', function(req, res) {
        var username = req.params.username;
        /*, 'friend.username' user '.' parameter to acces element of array  */
        Friends.findOne({username : username}, function(err, friend) {
            if(err) {
                //return res.send(err);
                throw err;
            } else {
                // res.render('index',{users: user[0].username});
                return res.json(friend); 
            }
        });
    },
    
     checkUser : function(req, res) {
      // app.get('/signinMobile', function(req, res) {
        var username = req.params.username;//req.body.username;
        User.findOne({username : username}, function(err, user) {
            if(err) {
                //return res.send(err);
                throw err;
            } else {
                if(user) {
                    res.send('1');
                } else {
                    res.send('0');
                }
            }
        });
    },
    
     checkEmail : function(req, res) {
      // app.get('/signinMobile', function(req, res) {
        var email = req.params.email;//req.body.username;
        User.findOne({email : email}, function(err, user) {
            if(err) {
                //return res.send(err);
                throw err;
            } else {
                if(user) {
                    res.send('1');
                } else {
                    res.send('0');
                }
            }
        });
    },
    
    getSearch : function(req, res) {
        var key = req.params.key;
        User.find({'username' : new RegExp(key, 'i')}, function(err, docs){
        if (err) throw err;
          var users=[];
            if(req.session && req.session.user) {
                for(var i =0; i < docs.length; i++){
                    if(docs[i].username !== req.session.user.username) {
                     users.push(docs[i]);
                    }
                } 
            } else {
                users = docs;
            }
            res.json(users);
        });
    },
    
     getSessionUser : function(req, res) {
        var userinfo = [];
         if(req.session && req.session.user) {
                  User.findOne({username : req.session.user.username},function(err, user) {
                if(err) {
                    //return res.send(err);
                    throw err;
                } else {
                    // res.render('index',{users: user[0].username});
                    userinfo.push({'username' : user.username, 'id': user.id, 'email': user.email});
                   // userinfo.push({});
                    return res.json(userinfo); 
                }
            });
         } else {
             res.json({});
         }
        
    },
    
    getMessage : function(req, res) {
        var param1 = req.params.param1;
        var param2 = req.params.param2;
        var participant = [param1, param2]
        Message.find({participant: participant.sort()}, function(err, msg) {
            //if(msg !== null) {
                res.json(msg);
            //}
        });
    },
    
    getNotification : function(req, res) {
        Notification.findOne({username : req.params.username},function(err, user) {
                if(err) {
                    //return res.send(err);
                    throw err;
                } else {
                   
                    return res.json(user); 
                }
            });
    },
    
    postSignUp : function(req, res) {
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
		var gender = req.body.gender;
        console.log("gender " + gender);
        var mobile = req.body.mobile;
		register.register(email, username, password, gender,function (found) {
			console.log(found);
            if(mobile) {
                res.json(found);
            }
			 
            else {
                if(found.response === "Sucessfully Registered")
                    //res.redirect('/signinNew.html');
                     res.render('signin', {welcome : "Sucessfully Registered, Please sign in to continue"});
                else{
                    res.render('index');
                    //error aaunda signup page mai error display garaune ho so need some changes here
                }
            }
          });
    },
    
     postFriend : function(req, res) {
        var username = req.session.user.username;
        var id = req.session.user._id;
        var mobile = req.body.mobile;
        Friends.findOne({id : id}, function(err, friend) {
            if(err) throw err;
            if(friend !== null) {
               Friends.updateFriends(id, '123', 'subincha',/*req.body.friendId, req.body.friendUserName,*/ 'pending', function(err, friend) {
                   if(err) throw err; 
                   var fname = 'shreena';
                    //socket.emit('add friend', fname);

                    res.render('error', {users : 'friend added'});
                });
            } else {
                 Friends.addFriends(id, username, '55d07b2feb15a240167d3151', 'shreena', 'pending', function(err, friend) {
             if(err) throw err;
                   var fname = 'shreena';
                    //socket.emit('add friend', fname);

             res.render('error', {users : 'friend added'});
         });
            }
        });
       
    },
    

    postSignIn : function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var mobile = req.body.mobile;
        User.findOne({username : username}, function(err, user) {
            if(err) throw err;
           console.log(user);
            if(user !== null) {
               // console.log("password " + password);
               // console.log("db password " + user.hashed_password);
                var temp = user.salt;
                var hash_db = user.hashed_password;
                var newpass = temp + password;
                var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
                //console.log("hash_db " + hash_db);
                //console.log("hashed_pass " + hashed_password);
                if(hash_db == hashed_password){
                    
                    req.session.user = user;
                       //console.log(user._id);
                        UserLog.findOne({id : user._id}, function(err, userlog) {
                           // console.log(userlog);
                            if(userlog !== null) {
                                UserLog.findOneAndUpdate(
                                {id: user.id},
                                {$push: {"loggedOn": {"date" : Date.now()}}},
                                {safe: true, upsert: true, new : true},
                                function(err, model) {
                                    console.log("err " + err);
                                    UserLog.findOneAndUpdate(
                                    {id: user.id},
                                    {$set: {"status": "online"}},
                                    {safe: true, upsert: true, new : true},
                                    function(err, model) {
                                        console.log("err "+err);

                                    }   
                                    );
                                }   
                                );
                            } else {

                                UserLog.addUserLog(user._id, user.username, user.email,  "online", user.gender, function(err, userlog) {
                                    if(err) throw err;
                                   // console.log(userlog);
                                });

                            }
                        });
                        if(!mobile) {
                            console.log("user is " + user.username);
                            res.render('chat',{users: req.session.user.username});
                            //res.redirect('///');
                        }else {
                             res.json(user);
                        }

               } else {
                    if(mobile) {
                        res.json({});
                    }else {
                        res.render('error',{users:"password error"});
                    }
               }
            }else {
                 if(mobile) {
                        res.json({});
                    }else {
                        res.render('error',{users:"Username or password error"});
                    }
           }
        });

    }
}
    