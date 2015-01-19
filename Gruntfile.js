
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-github-pages');

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
		            destination: '_site',
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
		},
		githubPages: {
			target: {
				options: {
					// The default commit message for the gh-pages branch
					commitMessage: 'push'
				},
				// The folder where your gh-pages repo is
				src: '_site'
			}
		}

	});	

	grunt.registerTask('default', 'watch');
	grunt.registerTask('deploy', ['githubPages:target']);
}
