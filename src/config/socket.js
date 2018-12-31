'use strict';
/*This module handles chat functionality, with getchats.js*/
import socketio from 'socket.io';
import {openChatCol, getChatCol} from './getchats';
const usersOnline = []; 

module.exports.listen = function(server) {
  const io = socketio.listen(server); 
  
  io.on('connection', function(socket) {
    getChatCol().then((chatMessagesArray) => {
      socket.emit('old msgs', chatMessagesArray); 
    }); 

    socket.on('user signin', function(data) {
      if (usersOnline.indexOf(data) === -1) {
        usersOnline.push(data); 
      }
    });

    const emitUsersOnlineUpdated = () => {
      io.emit('usersOnlineUpdated', usersOnline); 
    }; 
    emitUsersOnlineUpdated(); 
    setInterval(emitUsersOnlineUpdated, 2500); 
  
    socket.on('chat message', function(data) {
      openChatCol().then((col) => {
        const chatMessage = {
          username: data.username,
          message: data.message,
          time: Date.now()
        }; 
        if (chatMessage.message !='') {
          col.insertOne(chatMessage);
        } 
      }); 
      io.emit('chat message', data); 
    }); 

    socket.on('user logout', function(data) {
      usersOnline.splice(usersOnline.indexOf(data), 1); 
    }); 
  }); 

}
