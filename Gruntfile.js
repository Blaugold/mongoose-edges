
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.initConfig({
		mochaTest: {
			test: {
				src: ['test/**/*.js']
			}
		},
		jsdoc : {
		    dist : {
		        src: ['src/**/*.js', 'README.md'], 
		        options: {
		            destination: 'doc',
		            template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
		            configure : "jsdoc.conf.json"
		        }
		    }
		},
		jshint: {
			all: ['src/**/*.js']
		},
		watch: {
			options: {
				atBegin: true
			},
			scripts: {
				files: ['src/**/*.js', 'test/**/*.js'],
				tasks: ['mochaTest', 'jshint']
			},
			doc: {
				files: ['src/**/*.js', 'README.md'],
				tasks: ['jsdoc']
			}
		}
	});	

	grunt.registerTask('default', 'watch');
}
