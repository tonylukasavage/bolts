var _ = require('lodash'),
	async = require('async'),
	constants = require('./constants'),
	fs = require('fs'),
	path = require('path');

function bootstrap(project, opts, callback) {
	callback = maybeCallback(arguments[arguments.length-1]);
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	async.waterfall([

		// feed opts in waterfall
		function(cb) { return cb(null, opts); },

		// load any relevant config files
		loadConfig,

		// prompt for any missing required values
		promptForConfig,

		// write completed config to HOME
		writeConfig,

		// generate the bootstrapped project
		generateProject

	], function(err, results) {
		if (err) { return callback(err); }
		return callback(null, results);
	});
}

module.exports = bootstrap;

function loadConfig(opts, callback) {
	opts = opts || {};

	try {
		// explicit config file
		if (opts.config) {
			fs.readFile(opts.config, function(err, data) {
				return callback(null, JSON.parse(data));
			});

		// try to load local config file
		} else {
			var config = findConfig();
			return callback(null, config ? require(config) : null);
		}
	} catch (e) {
		return callback(e);
	}
}

function promptForConfig(config, callback) {
	config = config || {};
	return callback(null, config);
}

function writeConfig(config, callback) {
	config = config || {};
	var configFile = path.join(constants.HOME, constants.CONFIG_FILE);
	fs.writeFile(configFile, JSON.stringify(config, null, 2), function(err) {
		return callback(err, config, configFile);
	});
}

function generateProject(config, configFile, callback) {
	config = config || {};
	return callback(null, configFile);
}

// helpers
function findConfig() {
	var configs = [
		path.resolve(constants.CONFIG_FILE),
		path.join(constants.HOME, constants.CONFIG_FILE)
	], file = null;

	configs.every(function(config) {
		if (fs.existsSync(config)) {
			file = config;
			return false;
		}
		return true;
	});

	return file;
}

function maybeCallback(cb) {
	return _.isFunction(cb) ? cb : function(err) { if (err) { throw err; } };
}