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
    res.render('index');
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
    socket.join(username);
    console.log("add user : " + username);
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
               Friends.updateFriends(id, fid, funame, 'pending', function(err, friend) {
                   if(err) throw err; 
                   Friends.updateFriends(fid, id, username, 'requested', function(err, friend) {
                       if(err) throw err; 
                       if(friend.status === "online") {
                                   socket.broadcast.to(funame).emit('friend request', {'username': username, 'id': id,'funame' : funame, 'fid' : fid}); 
                              } else {
                                    writeNotification(fid, funame, username, id); 
                       console.log('fid ' +fid);
                              }
                   });
                   
                });
            } else {
                 Friends.addFriends(id, username, fid, funame, 'pending', function(err, friend) {
                    if(err) throw err;
                      Friends.addFriends(fid, funame, id, username, 'requested', function(err, friend) {
                        if(err) throw err;
                          console.log('funame ' + funame);
                          UserLog.findOne({username : funame}, function(err, friend){  
                              if(err) throw err;
                              console.log('friend status ' + friend);
                              if(friend.status === "online") {
                                  socket.broadcast.to(funame).emit('friend request', {'username': username, 'id': id,'funame' : funame, 'fid' : fid});
                                  
                              } else {
                                   writeNotification(fid, funame, username, id); 
                                
                              }
                              
                          });
                          
            console.log('friend added ' +funame);
                      });
           
         });
            }
        });
    });
    
    function writeNotification(fid, funame, username, id) {
        Notification.findOne({username : funame}, function (err, noti) {
            if(noti !== null) {
                 Notification.updateFriendNotification(fid, username, id, function(err, notify) {});
            }  else {
                 Notification.addFriendNotification(fid, funame, username, id, function(err, notify) {});
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

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

