var express = require ('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session  = require('express-session');
var bodyParser = require('body-parser');
app.set('views','views');
app.set('view engine','ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(session({secret:'learningpassport', resave: true, saveUnitialized: true}))
app.use(session({cookie: { maxAge: 60 * 1000 }}));
 app.use(passport.initialize());
 app.use(passport.session());
http.listen(3000, function(){
  console.log('listening on *:3000');
});
var arr = [];
var users = [{
              email:'tuong',
              password:'123',},
              {email:'tuyen',
              password:'123',},
							{email:'tuan',
              password:'123',},
							{email:'tinh',
              password:'123',}
            ]

            passport.serializeUser(function(user, done) {
              done(null, user.email);
            });

            passport.deserializeUser(function(email, done) {
              users.forEach(function(e){
                if(e.email==email){
                   return done(null,e);
                }
              })
            });

            passport.use('local-login',new LocalStrategy({
                  usernameField: 'email',
                  passwordField: 'password',
                  passReqToCallback : true
                },
              function(req,email, password, done) {
                users.forEach(function(e){
                  if(e.email==email){
                     return done(null,e);
                  }
                })


              }
            ));


app.get('/',isLoggedIn,function(req,res){
	for(var i=0;i<arr.length;i++){
		if(arr[i]==req.user.email){
			arr.splice(i, 1);
			break;
		}
	}
  res.render('home',{arr:arr,email:req.user.email});
})

app.get('/rooms/:id',isLoggedIn,function(req,res){
  res.render('room',{email:req.user.email});
});

app.get('/dangnhap',function(req,res){
  res.render('dangnhap');
})
app.post('/dangnhap',
  passport.authenticate('local-login', { failureRedirect: '/dangnhap' }),
  function(req, res) {
    res.redirect('/');
  });

io.of('/chat').on('connection', function(socket) {
	  socket.on('joinRoom', function(name){
			socket.name=name;
			arr.push(name);
			socket.emit('updateListUserJoin',name);
			socket.broadcast.emit('updateListUserJoin',name);
	  });
	  socket.on('requestVideoCall',function(sender,reciver){
			var chat = io.of('/chat');
			for (var i in chat.connected) {
	         var index = chat.connected[i];
					 if(index.name==reciver){
	                  socket.broadcast.to(index.id).emit('getRequestVideoCall',sender,socket.id);
	                }
	          }
	  })

	  socket.on('aceptVideocall',function(id){
	    socket.broadcast.to(id).emit('getAceptVideocall',id);
	  })

		socket.on('disconnect',function(){
		socket.broadcast.emit('updateListUserLeave',socket.name);
		})

	});


io.of('/rooms').on('connection', function(socket) {
	socket.on('startVideocCall',function(name){
		var d = new Date();
		socket.name=name;
		socket.startVideo = d;
	})

	socket.on('disconnect',function(){
		var d= new Date();
		var time = Math.abs(d - socket.startVideo);
		var realTime = millisToMinutesAndSeconds(time);
		var chat = io.of('/chat');
		for (var i in chat.connected) {
				 var index = chat.connected[i];
				 if(index.name==socket.name){
									io.of('/chat').to(index.id).emit("endVideoCall",realTime,socket.startVideo);
								}
					}
	})
})

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/dangnhap');
}
