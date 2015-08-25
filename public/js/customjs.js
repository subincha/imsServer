$(document).ready(function() {
    $('.uname').blur(function(e) {
        $.ajax({
            type: 'GET'
            , url: '/api/checkUser/' + $('.uname').val()
            }).done(function(found) {
            if (found == '1') {
                $('#imagePlaceHolder')
                .html('<img src="http://spbooks.github.com/nodejs1/cross.png" alt="cross"> Username already taken');
                $('.create-button').addClass('disabled')
                .attr('disabled', true);
            }
            else {
                $('#imagePlaceHolder').html('<img src="http://spbooks.github.com/nodejs1/tick.png" alt="tick">');
                $('.create-button').removeClass('disabled')
                .attr('disabled', false);
            }
        });
    });
    
    
     $('.email').blur(function(e) {
         $.ajax({
            type: 'GET'
            , url: '/api/checkEmail/' + $('.email').val()
            }).done(function(found) {
            if (found == '1') {
                $('#imagePlaceHolderEmail')
                .html('<img src="../assets/img/cross.png" alt="cross"> Seems like you have already registered');
                $('.create-button').addClass('disabled')
                .attr('disabled', true);
            }
            else {
                $('#imagePlaceHolderEmail').html('<img src="../assets/img/tick.png" alt="tick">');
                $('.create-button').removeClass('disabled')
                .attr('disabled', false);
            }
        });
    });
    
});