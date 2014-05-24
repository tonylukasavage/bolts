var bootstrap = require('..'),
	should = require('should');

describe('bolts.js', function() {

	it('exports a function', function() {
		should.exist(bootstrap);
		bootstrap.should.be.a.Function;
	});

});