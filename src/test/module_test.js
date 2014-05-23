var <%= projectCamelCase %> = require('..'),
	should = require('should');

describe('<%= project %>', function() {

	it('exists', function() {
		should.exist(<%= projectCamelCase %>);
	});

});