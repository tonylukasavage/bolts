var constants = require('../../lib/constants'),
	fs = require('fs'),
	path = require('path'),
	should = require('should'),
	wrench = require('wrench');

// the test environment constants
var TMP = path.resolve('tmp'),
	HOME = path.join(TMP, 'home'),
	CONFIG = path.join(HOME, constants.CONFIG);

constants.HOME = HOME;

// make sure to load bolts _after_ setting HOME
var bolts = require('../..');

describe('bolts.js', function() {

	beforeEach(function() {
		wrench.mkdirSyncRecursive(HOME, 0755);
	});

	it('exports a function', function() {
		should.exist(bolts);
		bolts.should.be.a.Function;
	});

	it('returns error when no opts and no config', function(done) {
		bolts(function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	it('returns error when no project and no config', function(done) {
		bolts({}, function(err) {
			should.exist(err);
			err.should.match(/missing/);
			done();
		});
	});

	afterEach(function() {
		wrench.rmdirSyncRecursive(TMP, true);
	});

});