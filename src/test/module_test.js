var <%= projectCamelCase %> = require('<%= project %>');

describe('<%= project %>', function() {

	it('exists', function() {
		should.exist(<%= projectCamelCase %>);
	});

});