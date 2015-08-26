var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('client-sessions');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var routes = require('./routes/routes');
var User = require('./models/users');
var UserLog = require('./models/userlog');
var Friends = require('./models/friends');
var Notification = require('./models/notification');
var Message = require('./models/messages');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
// Configuration

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("view options", { layout: false } );
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(session({
  cookieName: 'session',
  secret: 'mysecretsession',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
//app.get('/login', routes.getLogin);
app.get('/', function(req, res) {
        if(req.session && req.session.user) {
            res.render('chat', {users: req.session.user.username});

        } else {
         res.render('index');
    }
   
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/public/login1.html');
});
app.get('/signup', function(req, res) {
    res.render('signup', {users: ''});
});
app.get('/signin', function(req, res) {
    res.render('signin', {welcome: ''});
});
app.get('/api/getUser', routes.getUser);
app.get('/api/getSessionUser', routes.getSessionUser);
app.get('/api/getSearch/:key', routes.getSearch);
app.get('/api/getUserLog/:username', routes.getUserLog);
app.get('/api/getFriend/:username', routes.getFriend);
app.get('/api/checkUser/:username', routes.checkUser);
app.get('/api/checkEmail/:email', routes.checkEmail);
app.get('/api/getNotification/:username', routes.getNotification);
app.get('/api/getMessage/:param1/:param2', routes.getMessage);
app.post('/signup', routes.postSignUp);
app.post('/signin', routes.postSignIn);
app.post('/addFriend', routes.postFriend);

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

app.get('/logout', function(req, res) {
    UserLog.findOneAndUpdate(
                                {id: req.session.user.id},
                                {$set: {"status": "offline"}},
                                {safe: true, upsert: true, new : true},
                                function(err, model) {
                                    console.log(err);

                                }   
                                );
        req.session.reset();
  res.render('index');
});

function requireLogin (req, res, next) {
  if (!req.user) {
    res.render('index');
  } else {
    next();
  }
};

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
      console.log(data);
    // we tell the client to execute 'new message'
      console.log("username: " + data.username + " message: " + data.message);
      var participant = [socket.username, data.username]
      Message.addMessage(participant.sort(), data.message, socket.username, data.username, "single", "message", function(err, msg) {
          
      });
    socket.broadcast.to(data.username).emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    
    if(usernames[username] !== username) {
        socket.join(username);
        console.log("add user : " + username);
        User.findOne({username : username}, function(err, user) {
             UserLog.findOneAndUpdate(
                                {id: user.id},
                                {$set: {"status": "online"}},
                                {safe: true, upsert: true, new : true},
                                function(err, model) {
                                    console.log("online err " + err);

                                }   
                                );

        });
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
          numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
          username: socket.username,
          numUsers: numUsers
        });
    } else {
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
          username: username,
          numUsers: numUsers
        });
    }
    
  });
    
    socket.on('add friend', function(data) {
        //socket.broadcast.to(data.user.username).emit('friend request', data.user.username);
        var username = data.sessionUser.username;/*req.session.user.username*/;
        var id = data.sessionUser.id;/*req.session.user._id*/;
        var fid = data.user._id;
        var funame = data.user.username;
        Friends.findOne({id : id}, function(err, friend) {
            if(err) throw err;
            if(friend !== null) {
               Friends.updateFriends(id, fid, funame, 'pending', function(err, fri) {
                   if(err) throw err; 
                   console.log("afno friends ma update " + fri);
                   Friends.findOne({id : fid}, function(err, myfriend) {
                       if(err) throw err;
                       if(myfriend !== null) {
                                Friends.updateFriends(fid, id, username, 'requested', function(err, friend) {
                                   if(err) 
                                   {
                                        console.log("friends ko ma update ");
                                        console.log("friends ko ma update id " + fid);
                                        console.log("friends ko ma update fid" +  id);
                                        console.log("friends ko ma update funame" +  username);
                                   } else {
                                        if(friend !== null) {
                                             if(friend.status === "online") {
                                                   socket.broadcast.to(funame).emit('friend request', {'username': username, 'id': id,'funame' : funame, 'fid' : fid}); 
                                              } else {
                                                    writeNotification(fid, funame, username, id); 
                                                    console.log('update1 friend added ' +funame);
                                              }
                                        } else {
                                             writeNotification(fid, funame, username, id); 
                                            console.log('update2 friend added ' +funame);
                                        }
                                   }
                            });
                       } else {
                           addFriend(fid, funame, id, username);
                       }
                   })
                   
                });
            } else {
                 Friends.addFriends(id, username, fid, funame, 'pending', function(err, friend) {
                    if(err) throw err;
                      addFriend(fid, funame, id, username);
           
         });
            }
        });
    });
    
    function addFriend(fid, funame, id, username) {
        Friends.addFriends(fid, funame, id, username, 'requested', function(err, friend) {
                        if(err) throw err;
                          console.log('funame ' + funame);
                          UserLog.findOne({username : funame}, function(err, friend){  
                              if(err) throw err;
                              console.log('friend status ' + friend);
                             if(friend !== null) {
                                  if(friend.status === "online") {
                                  socket.broadcast.to(funame).emit('add1 friend request', {'username': username, 'id': id,'funame' : funame, 'fid' : fid});
                                  
                                    } else {
                                   writeNotification(fid, funame, username, id); 
                                
                                    }
                             }  else {
                                     writeNotification(fid, funame, username, id); 
                                    console.log('add2 friend added ' +funame);
                                }
                              
                          });
                          
            console.log('friend added ' +funame);
                      });
    }
    
    function writeNotification(fid, funame, username, id) {
        Notification.findOne({username : funame}, function (err, noti) {
            
            console.log("fid ", fid);
            console.log("funame ", funame);
            console.log("username ", username);
            console.log("id ", id);
            if(noti !== null) {
                console.log("yeta notification ", noti);
                 Notification.updateFriendNotification(fid, username, id, function(err, notify) {
                     //console.log("update notification ", "notify");
                 });
            }  else {
                 Notification.addFriendNotification(fid, funame, username, id, function(err, notify) {
                     //console.log("add notification ", "notify");
                 });
            }
        
        });
    };
    
    socket.on('notification', function(notify) {
       socket.emit('friend request', {'username': notify.notification[0].friend[0].from, 'id': notify.notification[0].friend[0].fid,'funame' : notify.username, 'fid' : notify.id}); 
        console.log("notification from on ", notify);
    });
    
     socket.on('friend accepted', function(data) {
         
         Friends.updateFriendStatus(data.id, data.fid, 'accepted', function(err, friend) {
            if(err) throw err;
              Friends.updateFriendStatus(data.fid, data.id, 'accepted', function(err, friend) {
                if(err) throw err;
                  Notification.findByIdAndRemove({_id:}, function(err, noti) {
                      
                  });
             });
         });
     });
    
    
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;
        User.findOne({username : socket.username}, function(err, user) {
             UserLog.findOneAndUpdate(
                                {id: user.id},
                                {$set: {"status": "offline"}},
                                {safe: true, upsert: true, new : true},
                                function(err, model) {
                                    console.log("offline err " +err);

                                }   
                                );

        });
         
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

