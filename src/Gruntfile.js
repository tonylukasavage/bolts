module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 3000,
				ignoreLeaks: false,
				reporter: 'spec'
			},
			src: ['test/*_test.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['lib/**/*.js', 'test/**/*.js']
		},
		clean: {
			src: ['tmp']
		}
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['jshint', 'mochaTest', 'clean']);

};