var _ = require('lodash'),
	constants = require('../../lib/constants'),
	fs = require('fs'),
	logger = require('../../lib/logger'),
	path = require('path'),
	should = require('should'),
	wrench = require('wrench');

// the test environment constants
var TMP = path.resolve('tmp'),
	HOME = path.join(TMP, 'home'),
	CONFIG = path.join(HOME, constants.CONFIG);

// prep test environment
constants.HOME = HOME;
logger.quiet = true;

// make sure to load bolts _after_ setting HOME
var bolts = require('../..'),
	log = '';

// test suite
describe('bolts.js', function() {

	beforeEach(function() {
		log = '';
		wrench.mkdirSyncRecursive(HOME, 0755);
	});

	it('exports a function', function() {
		should.exist(bolts);
		bolts.should.be.a.Function;
	});

	it('returns error when no project and no config', function(done) {
		bolts({ prompt: false }, function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	afterEach(function() {
		wrench.rmdirSyncRecursive(TMP, true);
	});

});


