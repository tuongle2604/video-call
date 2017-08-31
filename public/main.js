var socket = io('/chat');

 var email = $('.notification').attr('id');
 socket.emit('joinRoom',email)

 socket.on('updateListUserJoin',function(name){
   $("#listUser ul").append(`<li><p class="room-item">${name}</p> <button class="room-item" type="button" name="button" onclick="Call('${name}')">call</button></li>`);
 })
 socket.on('updateListUserLeave',function(name){
     $('#listUser ul li').each(function(){
       if($(this).children().first().text()==name){
         $(this).remove();
       }

     });
 })
 socket.on('getRequestVideoCall',function(sender,senderId){
   var flag = 0;
   var text = `bạn có một cuộc gọi từ ${sender}`;
   $(".notification ul li").each(function(){
        if($(this).children().first().text()==text){

        }else{
          flag ++;
        }
      })
      if(flag==$(".notification li").length){
        $(".notification ul").append(`<li><p>bạn có một cuộc gọi từ <strong style="color:red">${sender}</strong></p>
               <button onclick="ClickYes(this,'${senderId}')">yes</button>
               <button  onclick="ClickNo('${sender}')">no</button></li>`);
      }
 })
 function ClickYes(ele,id){
   var url = `http://localhost:3000/rooms${id}`;
   window.open(url,'window','toolbar=no, menubar=no, resizable=yes');
      socket.emit('aceptVideocall',id)
   $(ele).parent().remove();
 }

 function ClickNo(sender){
    $(".notification ul li:last-child").remove();
    var d = new Date();
    var month = d.getMonth()+1;
    var day = d.getDate();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();
    var output = d.getFullYear() + '-' +
    ((''+month).length<2 ? '0' : '') + month + '-' +
    ((''+day).length<2 ? '0' : '') + day + ' ' +
    ((''+hour).length<2 ? '0' :'') + hour + ':' +
    ((''+minute).length<2 ? '0' :'') + minute + ':' +
    ((''+second).length<2 ? '0' :'') + second;
    $(".notification ul").append(`<li><p>bạn bỏ lỡ một cuộc gọi từ <strong style="color:red">${sender}</strong> vào lúc: ${output}</p></li>`)
 }
socket.on('getAceptVideocall',function(id){
  var url = `http://localhost:3000/rooms${id}`;
  window.open(url,'window','toolbar=no, menubar=no, resizable=yes');
})

socket.on('endVideoCall',function(time,startTime){
  var d = new Date(startTime);
  var hour = d.getHours();
  var minute = d.getMinutes();
  var second = d.getSeconds();
  var output =  ((''+hour).length<2 ? '0' :'') + hour + ':' +  ((''+minute).length<2 ? '0' :'') + minute + ':' +  ((''+second).length<2 ? '0' :'') + second;
  $(".notification ul").append(`<li><p>cuoc goi bat dau vao luc: ${output}</p>
    <p>thoi gian goi: ${time}</p></li>`);
})

function ShowListUser(){
  var name = $("input:text").val();
  socket.emit('joinRoom',name);
  RemoveInput();
  $("#listUser").removeClass("hide");
}
function RemoveInput(){
  $(".getName").remove();
}
function Call(name){
  var reciver = name;
  var sender = $('.notification').attr('id');
  socket.emit('requestVideoCall',sender,reciver);
}

// function GetVideoCall(id){
//
// }
