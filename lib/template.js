var _ = require('lodash'),
	path = require('path');

module.exports = function template(opts) {
	var o = {};
	opts = opts || {};

	o.project = opts.project;
	o.devDependencies = {
		'grunt': '~0.4.5',
		'grunt-mocha-test': '~0.10.2',
		'grunt-contrib-jshint': '~0.10.0',
		'grunt-contrib-clean': '~0.5.0',
		'istanbul': '~0.2.10',
		'mocha': '~1.19.0',
		'should': '~3.3.1'
	};
	if (opts.titanium || opts.alloy) {
		_.extend(o.devDependencies, {
			'grunt-titanium': '~0.1.0',
			'ti-mocha': '~0.1.3'
		});
	}
	if (opts.alloy) {
		_.extend(o.devDependencies, {
			'grunt-alloy': '~0.1.0'
		});
	}

	return o;
};
