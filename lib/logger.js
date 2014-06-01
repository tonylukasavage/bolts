var _ = require('lodash'),
	colors = require('colors');

function Logger() {
	this.quiet = false;
}

(function logs(level, color) {
	Logger.prototype[level] = function() {
		if (this.quiet && level !== 'error') { return; }
		var args = Array.prototype.slice.call(arguments, 0);
		args[0] = _.isString(args[0]) ? args[0][color] : args[0];
		console[level].apply(console, args);
	};
	return logs;
})
('error','red')
('warn','yellow')
('log','white');

module.exports = new Logger();
