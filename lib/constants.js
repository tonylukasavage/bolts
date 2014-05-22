exports.CONFIG_FILE = '.node-bootstrap.json';
exports.HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
exports.FIELDS = [
	'project',
	'description',
	'email',
	'license',
	'github',
	'url',
	'tiGlobals'
];

exports.DEV_DEPENDENCIES = [
	'grunt',
	'grunt-mocha-test',
	'grunt-contrib-jshint',
	'grunt-contrib-clean',
	'istanbul',
	'mocha',
	'should',
	'wrench'
];

exports.TI_DEV_DEPENDENCIES = [
	'grunt-alloy',
	'grunt-titanium',
	'ti-mocha'
];