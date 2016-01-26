var mongoose = require('mongoose');
var cfg = require('../config.json');
var env = process.env.NODE_ENV || "development";
var url = cfg.MONGODB[env];
var single_connection;

module.exports = function() {
	if(!single_connection) {
		single_connection = mongoose.connect(url);
	}
	return single_connection;
};
