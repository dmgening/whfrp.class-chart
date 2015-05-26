module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      build: {
        cwd: 'src',
        src: ['**', '!**/*.js', '!**/*.less', '!**/*.jade'],
        dest: 'dist',
        expand: true,
      }
    },
    clean: {
      build: {
        src: ['dist']
      },
      scripts: {
        src: ['dist/**/*.js', '!dist/app.min.js']
      },
      styles: {
        src: ['dist/**/*.css', '!dist/app.css']
      }
    },
    browserify: {
      build: {
        files: {
          'dist/app.js': ['src/**/*.js']
        }
      }
    },
    uglify: {
      build: {
        options: {
          banner: '/*! <%= pkg.name %> <=% pkg.version %> Build: <=% grunt.template.today("dd-mm-yyyy") %> */\n',
          minimaize: false
        },
        files: {
          'dist/app.min.js': ['dist/app.js']
        }
      }
    },
    less: {
      build: {
        files: {
          'dist/app.css': ['src/**/*.less']
        }
      }
    },
    jade: {
      build: {
        files: [{
          cwd: 'src',
          src: ['**/*.jade'],
          dest: 'dist',
          expand: true,
          ext: '.html'
        }]
      }
    },
    watch: {
      styles: {
        files: 'src/**/*.less',
        tasks: ['styles']
      },
      scripts: {
        files: 'src/**/*.js',
        tasks: ['scripts']
      },
      jade: {
        files: 'src/**/*.jade',
        tasks: ['jade']
      },
      copy: {
        files: ['src/**', '!src/**/*.js', '!src/**/*.less', '!src/**/*.jade'],
        tasks: ['copy']
      }
    }
  });

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.loadNpmTasks('grunt-contrib-jade');

  // define the tasks
  grunt.registerTask(
    'scripts',
    'Compile scripts and copy them to the dist directory.',
    ['browserify', 'uglify', 'clean:scripts']
  )
  grunt.registerTask(
    'styles',
    'Compile styles and copy them to the dist directory.',
    ['less', 'clean:styles']
  )
  grunt.registerTask(
    'build',
    'compiles all of the assets and copies the files to the build directory.',
    ['clean:build', 'copy', 'scripts', 'styles', 'jade']
  );
  grunt.registerTask(
    'default',
    'Watches changes in source code and runs assigned build tasks.',
    ['build', 'watch']
  )
}
