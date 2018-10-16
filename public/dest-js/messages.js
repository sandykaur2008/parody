'use strict';

$(function () {
  var socket = io();
  $('form').submit(function () {
    var data = {
      message: $('#m').val(),
      username: $('#username').val()
    };
    socket.emit('chat message', data);
    $('#m').val('');
    return false;
  });

  socket.on('old msgs', function(chatMessagesArray){
    for(var i = 0; i<chatMessagesArray.length; i++){
      displayMsg(chatMessagesArray[i]); 
    }
  }); 

  socket.on('chat message', function (data) {
    if (data.message != '') {
      displayMsg(data); 
    }
  });

  function displayMsg(data){
    $('#messages').append($('<p>').text(data.username + ': ' + data.message));
  }
  socket.on("usersOnlineUpdated", function (data) {
    var usersOnlineUpdated = data.map(function (username) {
      return $('<p>' + username + '</p>');
    });
    $("#users").html(usersOnlineUpdated);
  });
});