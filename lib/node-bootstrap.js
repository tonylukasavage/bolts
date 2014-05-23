var _ = require('lodash'),
	async = require('async'),
	camelCase = require('camel-case'),
	template = require('./template'),
	fs = require('fs'),
	path = require('path'),
	prompt = require('prompt'),
	wrench = require('wrench');

var HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
	CONFIG = '.node-bootstrap.json';

function bootstrap(opts, callback) {
	callback = maybeCallback(arguments[arguments.length-1]);
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	async.waterfall([

		// feed opts in waterfall
		function(cb) { return cb(null, opts); },

		// load default values
		// loadDefaults,

		// load any relevant config files
		// loadConfig,

		// prompt for any missing required values
		promptForConfig,

		// write completed config to HOME
		// writeConfig,

		// generate the bootstrapped project
		generateProject

	], function(err, results) {
		if (err) { return callback(err); }
		return callback(null, results);
	});
}

module.exports = bootstrap;

/*
function loadDefaults(opts, callback) {
	opts = opts || {};

	async.parallel([

		function(cb) {

		},

		function(cb) {

		}
	], function(err, results) {

	});

	return callback(null, opts);
}

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
*/

function promptForConfig(config, callback) {
	config = config || {};

	prompt.message = '⚙'.green + '⚙'.white;
	prompt.delimiter = '  ';
	prompt.override = config;

	var schema = {
		properties: {
			project: {
				description: 'project name',
				required: true
			},
			description: {
				description: 'description',
				required: true
			},
			name: {
				description: 'author name',
				required: true
			},
			email: {
				description: 'author email',
				required: true
			},
			github: {
				description: 'github username',
				required: true
			}
		}
	};

	prompt.start();
	prompt.get(schema, function (err, result) {
		config.projectCamelCase = camelCase(result.project);
		return callback(null, _.extend(config, result));
	});
}

/*
function writeConfig(config, callback) {
	config = config || {};
	var configFile = path.join(HOME, CONFIG);
	fs.writeFile(configFile, JSON.stringify(config, null, 2), function(err) {
		return callback(err, config, configFile);
	});
}
*/

function generateProject(config, callback) {
	config = config || {};

	var dest = path.resolve(config.project);
	if (fs.existsSync(dest) && !config.force) {
		return callback('"' + config.project + '" already exists. Use --force to overwrite.');
	}
	//wrench.mkdirSyncRecursive(dest, 0755);

	// copy all files in
	wrench.copyDirSyncRecursive(path.join(__dirname, '..', 'src'), dest, {
		forceDelete: true
	});

	// iterate through all files and update them with templates
	wrench.readdirSyncRecursive(dest).forEach(function(file) {
		var fullpath = path.join(dest, file);
		if (fs.statSync(fullpath).isFile()) {
			console.log('processing ' + file + '...');
			fs.writeFileSync(fullpath, _.template(fs.readFileSync(fullpath, 'utf8'), config));
		}
	});

	return callback(null, config);
}

// helpers
function findConfig() {
	var result = null,
		configs = [
			path.resolve(CONFIG),
			path.join(HOME, CONFIG)
		];

	// see if we have a config saved in either CWD or HOME
	configs.every(function(config) {
		if (fs.existsSync(config)) {
			result = config;
			return false;
		}
		return true;
	});

	return result;
}

function maybeCallback(cb) {
	return _.isFunction(cb) ? cb : function(err) { if (err) { throw err; } };
}