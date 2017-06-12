var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// require('./socket.io.js')
// require('./SynxShooter.js')

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var firebaseDB = require('./firebase.js');

var player1status = new Array();
var player1uuid = new Array();
var player2status = new Array();
var player2uuid = new Array();

var Magics = new Array();
var Roomplayers = new Array();

var crypto = require('crypto');





var io_unity = require('socket.io')({
	transports: ['websocket'],
});

io_unity.attach(4567);

var send_x = 135;

io_unity.on('connection', function(socket){
	console.log("connect to unity");

	var data = '{"X":"135"}';
	var datajson = JSON.stringify(data);
	console.dir(datajson);

	socket.on('beep',function(){
		console.log("sent to unity");
		socket.emit('setX', {"X":send_x});
	});
	//socket.emit('setX',send_x);

})



function random (howMany, chars) {
	chars = chars || "a";
	var rnd = crypto.randomBytes(howMany), value = new Array(howMany), len = chars.length;

	for (var i = 0; i < howMany; i++) {
		value[i] = chars[rnd[i] % len];
	}

	return value.join('');
}

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use("/assets", express.static(__dirname + '/assets'));
app.use("/", express.static(__dirname + '/'));

io.on('connection', function(socket){

        console.log('someone knock my door');

	socket.once('magic', function(magic) {
	console.log('magic = %s', String(magic));
	var magic_id = Magics.indexOf(String(magic));
	if( magic_id > -1 ) { // check magic number exists or not
		Roomplayers[magic_id]++;	
		io.emit('connectOK', 'OK');
		socket.mobileMagic = String(magic);
		addMobileOwnSocket(socket, String(magic));
		console.log('a mobile user connected OK');
	} else {
		io.emit('connectOK', 'Failed');
		console.log('a mobile user connected Failed');
	}
});

socket.on('disconnect', function(){

	if( socket.mobileMagic != null ) {
	  console.log('Mobile user disconnected');
		var index = Magics.indexOf(socket.mobileMagic);
		if( index > -1 ){
			player1status[index] = false;
			player2status[index] = false;
			io.emit(player1uuid[index], 'checkConnect');
			io.emit(player2uuid[index], 'checkConnect');
		}
	}
	if( socket.magic != null ) {
	  console.log('Web client disconnected');
		var id = Magics.indexOf(socket.magic);
		Magics.splice(id, 1);
	}
});

// web to server
socket.on('reqMagic', function()  {
	var magic = random(5);
	// TODO: check duplication of random string
	console.log('random magic = %s', String(magic));
	io.emit('getMagic', magic);
	Magics.push(String(magic));
	Roomplayers.push(0);
	socket.magic = String(magic);
	for( var i = 0 ; i < Magics.length ; i ++ )
		console.log('magic[%d] = %s', i, Magics[i]);
		addWebOwnSocket(socket, String(magic));
	});
});

// web to android
function addWebOwnSocket(socket, magic) {
	socket.on('vibrate' + magic, function(msg){
		io.emit('connectOK'+magic, msg);
		console.log('vibrate' + magic + msg);
	});

	socket.on('ULT' + magic, function(msg){
		io.emit('connectOK'+magic, msg);
	});

	var index = Magics.indexOf(magic);
	if( index > -1 ){
		socket.on('vibrate1' + magic, function(msg){
			io.emit(player1uuid[index], msg);
		});
		socket.on('ULT1' + magic, function(msg){
			io.emit(player1uuid[index], msg);
		});
		socket.on('vibrate2' + magic, function(msg){
			io.emit(player2uuid[index], msg);
		});
		socket.on('ULT2' + magic, function(msg){
			io.emit(player2uuid[index], msg);
		});
	}
	socket.on('data' + magic, function(data){
		SaveToDB(data, magic);
	});
}

// android to web
function addMobileOwnSocket(socket, magic) {
	socket.on('message' + magic, function(msg){
		if(msg == 'fire'){
			io.emit('shoot' + magic, msg);
		} else if(msg == 'start'){
			io.emit('start' + magic, msg);
		}
	});
	socket.on('message1' + magic, function(msg){
		if(msg == 'fire'){
			io.emit('shoot', msg);
			//unity code
			console.log("shooting");
			io_unity.emit('shoot',{"shoot":"1"});
		} else if(msg == 'start'){
			io.emit('start1' + magic, msg);
		}
	});
	socket.on('message2' + magic, function(msg){
		if(msg == 'fire'){
			io.emit('shoot2' + magic, msg);
		} else if(msg == 'start'){
			io.emit('start2' + magic, msg);
		}
	});
	socket.on('X' + magic, function(msg){
		io.emit('setX'+magic, msg);
	});
	socket.on('Y' + magic, function(msg){
		io.emit('setY'+magic, msg);
	});
	socket.on('X1' + magic, function(msg){
		console.log("update_x");
		send_x = msg;
		io.emit('setX1' + magic, msg);
	});
	socket.on('Y1' + magic, function(msg){
		io.emit('setY1' + magic, msg);
		if( msg > 70 ){
			console.log("reloading");
			//unity code
			io_unity.emit('reload',{"reload":"1"});
		}
	});
	socket.on('X2' + magic, function(msg){
		io.emit('setX2' + magic, msg);
	});
	socket.on('Y2' + magic, function(msg){
		io.emit('setY2' + magic, msg);
	});
	socket.on('ultra' + magic, function(msg){
		if(msg == 'start') io.emit('start'+magic, msg);
		else io.emit('ultra'+magic, msg);
	});
	socket.on('switch_weapon1' + magic, function(msg){
		io.emit('switch_weapon1'+magic, msg);
	});
	socket.on('switch_weapon2' + magic, function(msg){
		io.emit('switch_weapon2'+magic, msg);
	});
	socket.on('gameStart' + magic, function(msg){
		io.emit('gameStart' + magic, msg);

		var index = Magics.indexOf(String(magic));
		if (Roomplayers[Magics.indexOf(String(magic))] > 1){
		    console.log("multiple players");
		    setTimeout(function(){
		        io.emit(player2uuid[index], 'p2go');
			io.emit('players' + magic, '2');
			io.emit('players' + magic, 'go');
			},5000);
		}else{
		    setTimeout(function(){
			io.emit('players' + magic, 'go');
			},5000);
		}

	});

//change username
	socket.on('username1' + magic, function(msg){
		console.log("user1 is: "+msg);
		setTimeout(function(){
			io.emit('username1' + magic, msg);
		},5000);
	});
	socket.on('username2' + magic, function(msg){
		console.log("user2 is: "+msg);
		setTimeout(function(){
			io.emit('username2' + magic, msg);
		},5000);
	});

// android to server
	socket.on('requestPlayer'+magic, function(msg){
	
	console.log('handling requetPlayer');

	var index = Magics.indexOf(String(magic));
		if( index > -1 ){
			if(player1status[index] == null && player2status[index] == null && player1uuid[index] == null && player2uuid[index] == null){
				player1status[index] = false;
				player2status[index] = false;
				player1uuid[index] = '';
				player2uuid[index] = '';
			}
			if(msg == player1uuid[index] || msg == player2uuid[index]){ return;}
			if(!player1status[index]){
				player1status[index] = true;
				player1uuid[index] = msg;
				//io.emit(player1uuid[index], '/Room/total' + Roomplayers[index]);
				io.emit(player1uuid[index], 'player1');
				//io.emit('totalPlayers' + magic, Roomplayers[index]);
				console.log("player one sent, total player "+Roomplayers[index]);
				//server to web
				//io.emit('players' + magic, Roomplayers[index]);
			} else if(!player2status[index]){
				player2status[index] = true;
				player2uuid[index] = msg;
				io.emit(player2uuid[index], 'player2');
				//io.emit(player1uuid[index], 'ready');
				io.emit(player2uuid[index], 'ready');
				//server to web
				console.log("player two sent, total player " + Roomplayers[index]);
				//io.emit('totalPlayers' + magic, Roomplayers[index]);
				//io.emit('players' + magic, 'go');
			} else{
				io.emit(msg, 'full');
			}
		}
	});
	socket.on('stillConnect'+magic, function(msg){
		var index = Magics.indexOf(String(magic));
		if( index > -1 ){
			if(msg == player1uuid[index]){
				player1status[index] = true;
			}
			if(msg == player2uuid[index]){
				player2status[index] = true;
			}
		}
	});
	socket.on('gameStart'+magic, function(msg){
		console.log("game start!!!!");
		var index = Magics.indexOf(String(magic));
		if( index > -1 ){
		}
	});
}

http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *: %d', process.env.PORT);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

http.listen('error', function(err)  {
  console.log('error = ' + err);
});

var scoreBoard;

firebaseDB.scoresRef.orderByChild("score").limitToLast(10).on("value", function(snapshot) {
	var count = snapshot.numChildren();
	scoreBoard = '';
	snapshot.forEach(function(data) {
		var user = data.val();
		scoreBoard = count + ((count == 10)?' ' : '  ') + user.name + ' ' + user.score + '\n' + scoreBoard;
		count --;
	});
});

function SaveToDB(data, magic) {
	firebaseDB.updateScore({
		name: data.name,
		score: parseInt(data.score),
		time: data.time
	}, function(err) {
		if( err == null ) { // success
			io.emit("scoreBoard"+magic, scoreBoard); // send scoreBoard string to web
		}
	});
	console.log(magic + 'save to db');
}
