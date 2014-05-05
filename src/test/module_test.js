var <% camelCase(project) %> = require('<%= project %>');

describe('<%= project %>', function() {

	it('exists', function() {
		should.exist(<% camelCase(project) %>);
	});

});