var _ = require('lodash'),
	async = require('async'),
	camelCase = require('camel-case'),
	colors = require('colors'),
	exec = require('child_process').exec,
	fs = require('fs'),
	logger = require('./logger'),
	path = require('path'),
	prompt = require('prompt'),
	util = require('util'),
	wrench = require('wrench');

var HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
	CONFIG = '.bolts.json';

function bolts(opts, callback) {
	var defaults = {};
	callback = maybeCallback(arguments[arguments.length-1]);
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	async.waterfall([

		// feed opts in waterfall
		function(cb) { return cb(null, opts, defaults); },

		// load default values
		loadDefaults,

		// load any relevant config files
		// loadConfig,

		// prompt for any missing required values
		promptForConfig,

		// write completed config to HOME
		// writeConfig,

		// generate the bootstrapped project
		generateProject,

		// git init
		gitInit

	], function(err, results) {
		if (err) { return callback(err); }
		return callback(null, results);
	});
}

module.exports = bolts;

function loadDefaults(opts, defaults, callback) {
	defaults = defaults || {};

	opts.devDependencies = JSON.stringify({
		'grunt': '~0.4.5',
		'grunt-mocha-test': '~0.10.2',
		'grunt-contrib-jshint': '~0.10.0',
		'grunt-contrib-clean': '~0.5.0',
		'istanbul': '~0.2.10',
		'mocha': '~1.19.0',
		'should': '~3.3.1'
	}, null, '\t');

	var funcs = [];
	['name','email'].forEach(function(type) {
		funcs.push(function(cb) {
			exec('git config --get user.' + type, function(err, stdout, stderr) {
				if (stderr || err) { return cb(); }
				defaults[type] = (stdout || '').trim();
				return cb();
			});
		});
	});

	async.parallel(funcs, function() {
		return callback(null, opts, defaults);
	});
}

/*
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

function promptForConfig(opts, defaults, callback) {
	opts = opts || {};

	// get a list of required keys we don't have yet
	var required = ['project','github'];
	if (!defaults.name) { required.push('name'); }
	if (!defaults.email) { required.push('email'); }

	var missing = [];
	_.map(required, function(key) {
		if (!opts[key]) {
			missing.push(key);
		}
	});

	// if no prompting, make sure we have all necessary data
	if (!opts.prompt) {
		if (missing.length) {
			return callback(util.format('--no-prompt used but [%s] %s missing', missing,
				missing.length > 1 ? 'are' : 'is'));
		}
		_.defaults(opts, defaults);
		return callback(null, opts);
	}

	// print banner
	if (opts.banner) {
		var title = prepTitle();
		logger.log(title);
		logger.log('┌──'.grey + ' Gimme some info and I\'ll create an npm-ready node.js module for you.');
		logger.log('│'.grey);
		logger.log('▼'.grey);
	}

	// configure prompt
	prompt.message = '⚙'.green + '⚙'.white;
	prompt.delimiter = ' ';
	prompt.override = opts;

	var schema = {
		properties: {
			project: {
				description: 'project name',
				required: true
			},
			description: {
				description: 'description',
				default: 'a node.js module',
				required: true
			},
			name: {
				description: 'author name',
				default: defaults.name,
				required: true
			},
			email: {
				description: 'author email',
				default: defaults.email,
				required: true
			},
			github: {
				description: 'github username',
				required: true
			}
		}
	};

	// maunally add delimiter
	Object.keys(schema.properties).forEach(function(key) {
		schema.properties[key].description += ':';
	});

	// execute prompting
	prompt.start();
	prompt.get(schema, function (err, result) {
		if (err) { return callback(err); }
		return callback(null, _.extend(opts, result));
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

function generateProject(opts, callback) {
	opts = opts || {};

	// camel case project name
	opts.projectCamelCase = camelCase(opts.project);

	// create project directory
	var dest = path.resolve(opts.project);
	if (fs.existsSync(dest) && !opts.force) {
		return callback('"' + opts.project + '" already exists. Use --force to overwrite.');
	}

	// copy all files in
	wrench.copyDirSyncRecursive(path.join(__dirname, '..', 'src'), dest, {
		forceDelete: true
	});
	wrench.mkdirSyncRecursive(path.join(dest, 'node_modules'));

	// iterate through all files and update them with templates
	wrench.readdirSyncRecursive(dest).forEach(function(file) {
		var fullpath = path.join(dest, file);
		if (fs.statSync(fullpath).isFile()) {
			fs.writeFileSync(fullpath, _.template(fs.readFileSync(fullpath, 'utf8'), opts));
		}
	});

	// rename source project files
	fs.renameSync(path.join(dest, 'lib', 'module.js'), path.join(dest, 'lib', opts.project + '.js'));
	fs.renameSync(path.join(dest, 'test', 'module_test.js'), path.join(dest, 'test', opts.project + '_test.js'));

	return callback(null, opts);
}

function gitInit(opts, callback) {
	exec('cd "' + opts.project + '" && git init', function(err, stdout, stderr) {
		if (err) {
			logger.error('git init failed: ' + err);
		}
		return callback(null, opts);
	});
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

function prepTitle() {
	var title = fs.readFileSync(path.join(__dirname, '..', 'assets', 'title.txt'), 'utf8'),
		newTitle = '';

	title.split('\n').forEach(function(line) {
		newTitle += '            ' + line + '\n';
	});

	return '\n' + newTitle.replace(/\$/g, '$'.red).replace(/([\\\/_|])/g, '$1'.grey).bold + '\n';
}

function maybeCallback(cb) {
	return _.isFunction(cb) ? cb : function(err) { if (err) { throw err; } };
}
