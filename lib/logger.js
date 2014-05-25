var _ = require('lodash'),
	colors = require('colors');

function Logger() {}

(function logs(level, color) {
	if (!level) { return; }

	Logger.prototype[level] = function() {
		var args = Array.prototype.slice.call(arguments, 0);
		args[0] = _.isString(args[0]) ? args[0][color] : args[0];
		console[level].apply(console, args);
	};
	return logs;
})
('error','red')
('warn','yellow')
('log','white')
('debug','cyan');

module.exports = new Logger();
