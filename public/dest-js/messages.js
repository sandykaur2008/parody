'use strict';

$(function () {
  var socket = io();
  $('form').submit(function () {
    var data = {
      message: $('#m').val(),
      user: $('#username').val()
    };
    socket.emit('chat message', data);
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function (data) {
    if (data.message != '') {
      $('#messages').append($('<p>').text(data.user + ': ' + data.message));
    }
  });
  socket.on("usersOnlineUpdated", function (data) {
    var usersOnlineUpdated = data.map(function (username) {
      return $('<p>' + username + '</p>');
    });
    $("#users").html(usersOnlineUpdated);
  });
});