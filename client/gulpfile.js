'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const babel = require('gulp-babel');

gulp.task('watch', function() {
    gulp.watch('client.js', ['babel']);
});

gulp.task('babel', function () {
    return gulp.src('client.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('client-compiled.js'))
        .pipe(gulp.dest('.'));
});
