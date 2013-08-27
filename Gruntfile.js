module.exports = function (grunt) {
  // * Read command-line switches
  // - Read in --browsers CLI option; split it on commas into an array if it's a string, otherwise ignore it
  var browsers = typeof grunt.option('browsers') == 'string' ? grunt.option('browsers').split(',') : undefined;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    library: grunt.file.readJSON('bower.json'),
    concat: {
      options: {
        separator: ''
      },
      library: {
        src: [
          'src/<%= library.name %>/<%= library.name %>.prefix',
          'src/<%= library.name %>/<%= library.name %>.js',
          'src/<%= library.name %>/directives/**/*.js',
          'src/<%= library.name %>/filters/**/*.js',
          'src/<%= library.name %>/services/**/*.js',
          'src/<%= library.name %>/<%= library.name %>.suffix'
        ],
        dest: 'build/<%= library.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      jid: {
        files: {
          'build/<%= library.name %>.min.js': ['<%= concat.library.dest %>']
        }
      }
    },
    jshint: {
      beforeConcat: {
        src: ['gruntfile.js', '<%= library.name %>/**/*.js']
      },
      afterConcat: {
        src: [
          '<%= concat.library.dest %>'
        ]
      },
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true,
          angular: true
        },
        globalstrict: false
      }
    },
    testFiles: {
      karmaUnit: 'karma.conf.js'
    },
    karma: {
      unit: {
        options: {
          configFile: '<%= testFiles.karmaUnit %>',
          autoWatch: false,
          singleRun: true,
          browsers: browsers || ['Chrome']
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      files: [
        'Gruntfile.js',
        'src/**/*'
      ],
      tasks: ['default']
    }
  });

  // Load grunt-karma task plugin
  grunt.loadNpmTasks('grunt-karma');

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('default', ['jshint:beforeConcat', 'concat', 'jshint:afterConcat', 'uglify']);
  grunt.registerTask('livereload', ['default', 'watch']);

};