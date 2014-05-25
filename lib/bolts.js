var _ = require('lodash'),
	async = require('async'),
	camelCase = require('camel-case'),
	exec = require('child_process').exec,
	fs = require('fs'),
	path = require('path'),
	prompt = require('prompt'),
	wrench = require('wrench');

var HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
	CONFIG = '.bolts.json';

function bolts(opts, callback) {
	var defaults = {};
	callback = maybeCallback(arguments[arguments.length-1]);
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	// config and defaults

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

function promptForConfig(config, defaults, callback) {
	config = config || {};

	var title = prepTitle();

	console.log(title);
	console.log('┌──'.grey + ' Gimme some info and I\'ll create an npm-ready node.js module for you.');
	console.log('│'.grey);
	console.log('▼'.grey);

	prompt.message = '⚙'.green + '⚙'.white;
	prompt.delimiter = ' ';
	prompt.override = config;

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

	Object.keys(schema.properties).forEach(function(key) {
		schema.properties[key].description += ':';
	});

	prompt.start();
	prompt.get(schema, function (err, result) {
		if (err) { return callback(err); }

		config.projectCamelCase = camelCase(result.project);
		config.devDependencies = JSON.stringify({
			'grunt': '~0.4.5',
			'grunt-mocha-test': '~0.10.2',
			'grunt-contrib-jshint': '~0.10.0',
			'grunt-contrib-clean': '~0.5.0',
			'istanbul': '~0.2.10',
			'mocha': '~1.19.0',
			'should': '~3.3.1'
		}, null, '\t');
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
	wrench.mkdirSyncRecursive(path.join(dest, 'node_modules'));

	// iterate through all files and update them with templates
	wrench.readdirSyncRecursive(dest).forEach(function(file) {
		var fullpath = path.join(dest, file);
		if (fs.statSync(fullpath).isFile()) {
			fs.writeFileSync(fullpath, _.template(fs.readFileSync(fullpath, 'utf8'), config));
		}
	});

	// rename source project files
	fs.renameSync(path.join(dest, 'lib', 'module.js'), path.join(dest, 'lib', config.project + '.js'));
	fs.renameSync(path.join(dest, 'test', 'module_test.js'), path.join(dest, 'test', config.project + '_test.js'));

function gitInit(opts, callback) {
	exec('cd "' + opts.project + '" && git init', function(err, stdout, stderr) {
		if (err) {
			console.error('git init failed: ' + err);
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

(function logs(level, color) {
	if (!level) { return; }
	var _console = console[level];
	console[level] = function() {
		var args = Array.prototype.slice.call(arguments, 0);
		args[0] = _.isString(args[0]) ? args[0][color] : args[0];
		_console.apply(console, args);
	};
	return logs;
})
('error','red')
('warn','yellow')
('log','white')
('debug','cyan');
