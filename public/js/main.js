$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
    
  var friendrequest = document.getElementById('friendNotification');
  var friendTab = document.getElementById('FriendTab');
 // var addfriend = document.getElementById('addfriend');

  // Prompt for setting a username
  var username;
    var activeFriend;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $inputMessage.focus();
  	var serverMessage=document.getElementById('serverMessage');
	var userLog=document.getElementById('userLog');
  var socket = io();
    
    setUsername();
    
            $.ajax({
                        type : 'GET',
                        url : '/api/getNotification/' + username
                }).done(function(notify) {
                    if(notify !== null) {
                         /* */
                        //socket.emit('notification', notify);
                        //alert("notification" + notify.username);
                         var html = '<span class="messageCount label label-success" id="notifyTopFriend">'+notify.notification.friend.length+'</span>';
                        addElement('notificationCount', 'span', 'notifyTopFriend', html);
                        var html = ' <li class="dropdown-header">Friend Reqest(s) From</li>';
                        addElement('notification', 'li', 'notify', html);
                       for(var i=0; i<notify.notification.friend.length; i++) {
                             var html = '<a class="launch-modal" data-modal-id="modal-notification" href="#">'+notify.notification.friend[i].from+'</a>';
                            addNotificationElement('notification', 'li', 'notify'+i, html);
                        }
                       
                    } else {
                        var html = ' <li class="dropdown-header">No New Notifications</li>';
                        addElement('notification', 'li', 'notify', html);
                    }
                       
                });
    
    function addNotificationElement(receivedMessage,div,id,html){
	var p= document.getElementById(receivedMessage);
	var newElement=document.createElement(div);
	newElement.setAttribute('id',id);
	newElement.innerHTML=html;
	p.appendChild(newElement);
        var notify = document.getElementById(id);
        notify.addEventListener('click', function() {
            //Friend request accept or reject dialog box dekhaune
            //accept vayo vane, socket.emit('friend accpepted'); friend database ma accepted garne
            //reject vayo vane, socket.emit('friend rejected'); friend database bata pending wala ra requested wala lai delete garne
            //tyalai notification bata hataune
            //cancel vayo vane kei ni nagarne
            
            //delete garne lai id main ho so id lai pathaunu parcha
        });
        
}
       
    
    getFriends();
    function getFriends() {
         var friendsAccepted = [];
                $.ajax({
                        type : 'GET',
                        url : '/api/getFriend/' + username
                }).done(function(friends) {
                    if(friends !== null) {
                        for(var i = 0; i < friends.friend.length; i++) {
                            if(friends.friend[i].status === "accepted") {
                                
                                addFriendListElement('user', 'div', 'friendid-' + i, friends.friend[i].username, i);
                            }
                        }
                    }
                       
                });
        
                    
    
                   function addFriendListElement(parentId, elementTag, elementId, user, i) {
                        $.ajax({
                        type : 'GET',
                        url : '/api/getUserLog/' + user
                        }).done(function(friendstatus) {
                            if(friendstatus !==null) {
                            // Adds an element to the document
                                var p = document.getElementById(parentId);
                                var newElement = document.createElement(elementTag);
                                newElement.setAttribute('id', elementId);
                                if(friendstatus.status === "online"){
                                    var html = '<div class="user" id="friend'+i+'"><img src="../assets/img/user.png" class="FriendProfile">'+
                                        '<label id="'+user+'" style="font-size:12pt;margin-left:-50px;">'+user+'</label>'+
                                        '<small class="badge pull-right bg-green" id="notify'+i+'">3</small>'+
                                        '</br>'+
                                        '<img src="../assets/img/online.png" id="'+user+'Status" style="margin-left:-230px;height:20px;width:20px;"></div>'+
                                        '<div class="break"></div>';
                                } else {
                                    var html = '<div class="user" id="friend'+i+'"><img src="../assets/img/user.png" class="FriendProfile">'+
                                        '<label id="'+user+'" style="font-size:12pt;margin-left:-50px;">'+user+'</label>'+
                                        '<small class="badge pull-right bg-green" id="notify'+i+'">3</small>'+
                                        '</br>'+
                                        '<img src="../assets/img/offline.png" id="'+user+'Status" style="margin-left:-230px;height:20px;width:20px;"></div>'+
                                        '<div class="break"></div>';
                                }
                                
                                newElement.innerHTML = html;
                                p.appendChild(newElement);
                                var myFriend = document.getElementById('friend'+i);
                                        myFriend.addEventListener('click', function() {
                                            document.getElementById('userTap').style.visibility="visible";
                                            //document.getElementById('userTap').style.visibility="visible";
                                            jQuery('.user').removeClass('active');
                                            jQuery(this).addClass('active');
                                            $('#notify'+i).fadeOut("slow");
	                                       $('#notifyTop').fadeOut("slow");
                                            activeFriend = user;
                                            $('#activeFriend').html(activeFriend);
                                             $.ajax({
                                                type : 'GET',
                                                url : '/api/getMessage/' + activeFriend + '/' + username
                                                }).done(function(messages) {
                                                    if(messages !== null) {
                                                        $('#receivedMessage div').empty();
                                                        for(var i=0; i < messages.length; i++) {
                                                            if(messages[i].from === username) {
                                                             var html='<ul class="messages triangle-border left" id="messageId" style="margin-top:20px;text-align:left;width:600px;"><li>'+ messages[i].message +'</li></ul><img src="../assets/img/user.png" style="float:left;width:50px;height:50px;margin-top:-50px;">'
                                                             } else {
                                                             var html='<ul class="messages triangle-border right" id="messageId" style="margin-top:20px;text-align:left;width:600px;margin-left:330px;"><li>'+ messages[i].message +'</li></ul><img src="../assets/img/user.png" style="float:right;width:50px;height:50px;margin-top:-50px;">'
                                                             }
                                                             addElement('receivedMessage','div','id',html);
                                                        }
                                                    } else {
                                                        $('#receivedMessage div').empty();
                                                    }
                                             });
                                });
                            }
                        });
                    }
    
    }
           
  
   /* addfriend.addEventListener('click', function() {
        //alert('Hello world');
       // socket.emit('add friend', {username :'xyz'}); 
        window.location.href='search.html';
    }, false);
*/
  socket.on('friend request', function(data) {
       log('message ' + data.funame);
        friendrequest.style.visibility="visible";
        friendrequest.addEventListener('click', function() {
            //loopthrough number of friend requests
        socket.emit('friend accepted', {'username' : data.username, 'id': data.id,'funame' : data.funame, 'fid' : data.fid});
            alert('Friend request sent by ' + data.username + ' is accepted');
    }, false);
    });
    
    
  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "chat(0)";
    } else {
      message +="chat("+ (data.numUsers-1) +")";
    }
   // log(message);
   $(serverMessage).html('<p>'+ message +'</p>');
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      //$loginPage.fadeOut();
      $chatPage.show();
      //$loginPage.off('click');
      //$currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      //socket.emit('new message', message);
	  var chatSend=document.getElementById('receivedMessage');
	  var html='<ul class="messages triangle-border left" id="messageId" style="margin-top:20px;text-align:left;width:600px;"><li>'+ message +'</li></ul><img src="../assets/img/user.png" style="float:left;width:50px;height:50px;margin-top:-50px;">'
	  addElement('receivedMessage','div','id',html);
        if(activeFriend !== '') {
            socket.emit('new message', {username: activeFriend, message: message});
        }
      
    }
  }
  
  function addElement(receivedMessage,div,id,html){
	var p= document.getElementById(receivedMessage);
	var newElement=document.createElement(div);
	newElement.setAttribute('id',id);
	newElement.innerHTML=html;
	p.appendChild(newElement);
}

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    //$messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
     // $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
   // addChatMessage(data);
    var html='<ul class="messages triangle-border right" id="messageId" style="margin-top:20px;text-align:left;width:600px;margin-left:330px;"><li>'+ data.message +'</li></ul><img src="../assets/img/user.png" style="float:right;width:50px;height:50px;margin-top:-50px;">'
	  addElement('receivedMessage','div','id',html);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    //log(data.username + ' joined');
    addParticipantsMessage(data);
      if(data.username !== username) {
          document.getElementById(data.username +'Status').src="../assets/img/online.png";//html('<img src="../assets/img/online.png" id="'+data.username+'Status" style="margin-left:-230px;height:20px;width:20px;">');
	       $(userLog).html('<p>'+ data.username +' is online</p>');	 //changes
      }
       
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    //log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
      document.getElementById(data.username +'Status').src="../assets/img/offline.png";//html('<img src="../assets/img/online.png" id="'+data.username+'Status" style="margin-left:-230px;height:20px;width:20px;">');
	 $(userLog).html('<p>'+ data.username +' is offline</p>');
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
});
