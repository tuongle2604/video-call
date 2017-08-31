var socket = io('/rooms');
var email = $('#localVideo').attr('class');
socket.emit('startVideocCall',email)
