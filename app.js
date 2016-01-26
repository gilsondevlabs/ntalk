var express = require('express');
var cfg = require('./config.json');
var load = require('express-load');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var methodOverride = require('method-override');
var compression = require('compression');
var csurf = require('csurf');
var error = require('./middlewares/error');
var redisAdapter = require('socket.io-redis');
var RedisStore = require('connect-redis')(expressSession);

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookie = cookieParser(cfg.SECRET);
var store = new expressSession.MemoryStore();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(compression());
app.use(cookie);
app.use(expressSession({
	secret: cfg.SECRET,
	name: cfg.KEY,
	resave: true,
	saveUnitialized: true,
	store: store
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public', cfg.CACHE));
app.use(csurf());
app.use(function(req, res, next) {
	res.locals._csrf = req.csrfToken();
	next();
});

app.disable('x-powered-by');

io.adapter(redisAdapter(cfg.REDIS));
io.use(function(socket, next) {
	var data = socket.request;
	cookie(data, {}, function(err) {
		var sessionID = data.signedCookies[cfg.KEY];
		store.get(sessionID, function(err, session) {
			if (err || !session) {
				return next(new Error("Acesso Negado"));
			} else {
				socket.handshake.session = session;
				return next();
			}
		});
	});
});

load('models')
	.then('controllers')
	.then('routes')
	.into(app);

load('sockets')
	.into(io);

app.use(error.notFound);
app.use(error.serverError);

server.listen(3000, function() {
	console.log("Ntalk no ar");
});

module.exports = app;
