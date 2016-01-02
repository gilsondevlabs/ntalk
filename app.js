var express = require('express');
var load = require('express-load');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var methodOverride = require('method-override');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var error = require('./middlewares/error');

var app = express();


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser('ntalk'));
app.use(expressSession());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

load('models')
	.then('controllers')
	.then('routes')
	.into(app);

app.use(error.notFound);
app.use(error.serverError);

io.sockets.on('connection', function(client) {
	client.on('send-server', function(data) {
		var msg = "<b>" + data.nome + ":</b>" + data.msg + "<br/>";
		client.emit('send-client', msg);
		client.broadcast.emit('send-client', msg);
	});
});

server.listen(3000, function() {
	console.log("Ntalk no ar");
});
