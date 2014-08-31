var _ = require('lodash'),
	constants = require('../../lib/constants'),
	fs = require('fs'),
	logger = require('../../lib/logger'),
	path = require('path'),
	prompt = require('prompt'),
	should = require('should'),
	wrench = require('wrench');

// the test environment constants
var TMP = path.resolve('tmp'),
	HOME = path.join(TMP, 'home'),
	CONFIG = path.join(HOME, constants.CONFIG),
	FOO = path.resolve('foo'),
	SRC = path.resolve('src'),
	FIXTURES = path.resolve('test','fixtures'),
	RESULTS = {
		project: 'foo',
		description: 'test description',
		name: 'test person',
		email: 'test@test.com',
		github: 'testuser'
	};

// prep test environment
constants.HOME = HOME;

// make sure to load bolts _after_ setting HOME
var bolts = require('../..');

// test suite
describe('bolts.js', function() {

	beforeEach(function() {
		logger.quiet = true;
		wrench.mkdirSyncRecursive(HOME, 0755);
		this._get = prompt.get;
		this._consoleLog = console.log;
		this._env = process.env;
		this._HOME = process.env.HOME;
	});

	it('exports a function', function() {
		should.exist(bolts);
		bolts.should.be.a.Function;
	});

	it('should return error when no reqs and no config', function(done) {
		stubPromptGet('missing', null);
		bolts(function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('should print banner if not --quiet and not --no-prompt', function(done) {
		var ctr = 0, output;
		logger.quiet = false;
		console.log = function(str) {
			if (ctr++ === 0) {
				output = str;
			}
		};

		bolts({ prompt: false }, function(err) {
			// lazy check for banner
			output.should.containEql('\u001b[31m$\u001b[39m\u001b[31m$\u001b[39m\u001b[31m$\u001b[39m');
			logger.log();

			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('should return error when no reqs and no config', function(done) {
		bolts({ quiet: true, prompt: false, banner: false }, function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('should return error when no reqs and and empty config in HOME', function(done) {
		fs.writeFileSync(CONFIG, '{}');
		bolts({ quiet: true }, function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('should return error when no project and and empty config in HOME', function(done) {
		fs.writeFileSync(CONFIG, '{}');
		bolts({ quiet: true }, function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('should return error with incomplete config', function(done) {
		fs.writeFileSync(CONFIG, '{"name":"x","description":"x","email":"x","github":"x"}');
		bolts({ quiet: true }, function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('should return error with invalid config', function(done) {
		fs.writeFileSync(CONFIG, '{{{}');
		bolts({ quiet: true }, function(err) {
			should.exist(err);
			err.should.match(/SyntaxError/);
			done();
		});
	});

	it('should return error when given config that does not exist', function(done) {
		bolts({ quiet: true, config: '/i/do/not/exist' }, function(err) {
			should.exist(err);
			should.exist(err.code);
			err.code.should.equal('ENOENT');
			done();
		});
	});

	it('should return error when project folder exists with --force', function(done) {
		wrench.mkdirSyncRecursive(FOO, 0755);
		bolts({ quiet: true, config: path.join(FIXTURES, constants.CONFIG) }, function(err) {
			should.exist(err);
			err.should.match(/already exists/);
			done();
		});
	});

	it.skip('should execute using explicit config file', function(done) {
		var opts = {
			prompt: false,
			config: path.join(FIXTURES, constants.CONFIG)
		};
		var config = require(opts.config);

		bolts(opts, function(err) {
			should.not.exist(err);

			var fixFiles = wrench.readdirSyncRecursive(path.join(FIXTURES,'foo')),
				fooFiles = wrench.readdirSyncRecursive(FOO);

			// do we have all the files?
			var diff = _.difference(fixFiles, fooFiles);
			_.difference(fixFiles, fooFiles).length.should.equal(0);

			// compare the files
			fixFiles.forEach(function(file) {
				var fixFilePath = path.join(FIXTURES,'foo',file),
					fooFilePath = path.join(FOO,file);
				if (!fs.statSync(fixFilePath).isFile()) { return; }

				var fixContent = fs.readFileSync(fixFilePath, 'utf8'),
					fooContent = fs.readFileSync(fooFilePath, 'utf8');
				fixContent.should.equal(fooContent);
			});

			// // get expected source file listing and update JS file names
			// var srcFiles = wrench.readdirSyncRecursive(SRC);
			// srcFiles = _.map(srcFiles, function(file) {
			// 	var basename = path.basename(file);
			// 	if (_.contains(['module.js','module_test.js'], basename)) {
			// 		return path.join(path.dirname(file), basename.replace('module', 'foo'));
			// 	}
			// 	return file;
			// });

			// // make sure we have all expected files, and validate where possible
			// var actualFiles = wrench.readdirSyncRecursive(FOO);
			// srcFiles.forEach(function(file) {
			// 	actualFiles.should.containEql(file);

			// 	if (file === 'package.json') {
			// 		var json = require(path.join(FOO, 'package.json'));
			// 		json.name.should.equal(config.project);
			// 		json.description.should.equal(config.description);
			// 		json.author.name.should.equal(config.name);
			// 		json.author.email.should.equal(config.email);
			// 		json.repository.url.should.equal(
			// 			'git://github.com/' + config.github + '/' + config.project + '.git');
			// 	}
			// });

			done();
		});
	});

	afterEach(function() {
		process.env = this._env;
		process.env.HOME = this._HOME;
		prompt.get = this._get;
		console.log = this._consoleLog;
		wrench.rmdirSyncRecursive(TMP, true);
		wrench.rmdirSyncRecursive(FOO, true);
	});

});

function stubPromptGet(err, opts) {
	prompt.get = function(schema, callback) {
		callback(err, opts);
	};
}
