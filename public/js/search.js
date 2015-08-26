 $(document).ready(function() {
            var socket = io();
            var sessionUser = [];
                $.ajax({
                        type : 'GET',
                        url : '/api/getSessionUser/'
                }).done(function(found) {
                    sessionUser = found[0];
                });
            var btnSearch = document.getElementById('btnsearch');
               btnSearch.addEventListener('click', function() {
                   makeSearch();
               });
           
			   function makeSearch() {
				   
					$('#demo div').empty();
                   $.ajax({
                        type : 'GET',
                        url : '/api/getSearch/' + $('.search').val()
                    }).done(function(found) {
                        if(found.length >= 1) {
                            var list = document.getElementById('demo');
                            for(var i = 0; i < found.length; i++) {
                                var gender = found[i].gender;
                                var img = '';
                                if(gender === 'male' || gender === 'Male') {
                                    img = "male.jpg";
                                } else {
                                    img ="female.jpg";
                                }
                               var html = '<div>' +
       ' <img src="assets/img/avatar/'+img+'"style="height:90px;width:80px;margin:5px;"/>' +
        '<ul style="width:400px;padding-left:100px;margin-top:-70px;list-style-type:none;">' +
       ' <li name="username" value="username">'+found[i].username+'</li>' +
        '<li name="email" value="email">'+found[i].email+'</li>' +
        '</ul>' +
            '<input type="button" class="btn btn-link-1" href="#" value="Add Friend" style="height:50px;width:500px;margin-left:0px;padding-bottom:15px;text-align:center;margin-top:20px;" id="addfriend'+i+'">' +
	'</div>' ;                     
                                    addElement('demo', 'div', 'fileid-' + i, html, i, found[i]);
                            }
                           
                        } else {
                            var html = '<p style="color:red;text-align:center;font-style:bold;">No users found</p>';
                            addElement('demo', 'div', 'fileid-' + i, html, i, '');
                        }
                    });
			   }
                function addElement(parentId, elementTag, elementId, html, i, found) {
                    // Adds an element to the document
                    var p = document.getElementById(parentId);
                    var newElement = document.createElement(elementTag);
                    newElement.setAttribute('id', elementId);
                    newElement.innerHTML = html;
                    p.appendChild(newElement);
                    var addFriend = document.getElementById('addfriend' + i);
                    $.ajax({
                        type : 'GET',
                        url : '/api/getFriend/' + sessionUser.username
                    }).done(function(reply) {
                       if(reply !== null) {
                            if(i < reply.friend.length) {
                                if(found.username === reply.friend[i].username) {
                                    $(addFriend).attr('disabled', true);
                                   if(reply.friend[i].status == 'pending') {
                                        $(addFriend).val('Friend Request Sent');
                                   } else {
                                       $(addFriend).val('Friend');
                                   }

                               //addFriend.removeEventListener('click', function());
                                } else {
                                    myfunction(addFriend, found);
                                }
                    
                            } else {
                                myfunction(addFriend, found);
                            }
                       } else {
                           myfunction(addFriend, found);
                       }
                   
                    });
                    
                }
     
            function myfunction(addFriend, found) {
				if(addFriend !== null) {
					addFriend.addEventListener('click', function() {
                    alert(found.username);
                    $(addFriend).attr('disabled', true);
                    $(addFriend).val('Friend Request Sent');
                    socket.emit('add friend', {user : found, sessionUser : sessionUser});
                }); 
				}
                
            }
                
                 
});