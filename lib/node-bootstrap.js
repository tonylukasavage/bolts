var _ = require('lodash');

function bootstrap(project, opts, callback) {
	callback = maybeCallback(arguments[arguments.length-1]);
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	return callback(null, { location: './' + project });
}
module.exports = bootstrap;

function maybeCallback(cb) {
	return _.isFunction(cb) ? cb : function(err) { if (err) { throw err; } };
}