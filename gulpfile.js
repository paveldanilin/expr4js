var gulp		= require('gulp');
var clean		= require('gulp-clean');
var uglify	= require('gulp-uglify');
var notify	= require('gulp-notify');
var include	= require('gulp-include');
var rename	= require('gulp-rename');

var src 					= './src/main.js';
var dest 					= './build';
var mod_min_name 	= 'expr4js.min.js';
var mod_name 			= 'expr4js.js';


gulp.task('build-clean', function() {
	return gulp.src('build/*').pipe(clean());
});

gulp.task('build-min', function() {
  return gulp.src(src)
    .pipe(include())
    .pipe(uglify())
		.pipe(rename(mod_min_name))
    .pipe(gulp.dest(dest))
    .pipe(notify({ message: 'Build task completed' }));
});

gulp.task('build', function() {
  return gulp.src(src)
    .pipe(include())
		.pipe(rename(mod_name))
    .pipe(gulp.dest(dest))
    .pipe(notify({ message: 'Build task completed' }));
});
