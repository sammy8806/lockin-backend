'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const exec = require('child_process').exec;
const concat = require('gulp-concat');
const mocha = require('gulp-mocha');

const log = (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);

    console.log(err);
};

//gulp.task('watch', function() {
//    gulp.watch('client.js', ['babel']);
//});

function test(string) {
    return gulp.src('test/socketTest.js')
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({
            compilers: {
                js: babel
            },
            grep: string
        }));
}

gulp.task('test-all', () => {
  test('');
});

gulp.task('test-register', () => {
    test('should register');
});

gulp.task('test-login', () => {
    test('should login');
});

gulp.task('test-create-room', () => {
    test('should create a room');
});

gulp.task('test-join-room', () => {
    test('should let a user join a room');
});

gulp.task('test-send-message', () => {
    test('should let a user send a message to a room');
});


gulp.task('_es_transpile', () => {
    return gulp.src(['src/**/*.es6', 'src/**/*.es7'])
        .pipe(babel({
            'presets': [
                'es2015',
                'stage-0'
            ],
            'plugins': [
                'syntax-async-functions',
                'transform-regenerator'
            ]
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('_js_copy', () => {
    return gulp.src(['src/**/*.js'])
        .pipe(gulp.dest('dist'));
});

gulp.task('ssh_restart', () => {
    exec('vagrant ssh -c "sudo systemctl restart cl-node"', log);
});

gulp.task('ssh_logwatch', () => {
    exec('vagrant ssh -c "sudo journalctl -ef | grep node"', log);
});

gulp.task('compile', ['_es_transpile', '_js_copy']);
gulp.task('restart', ['compile', 'ssh_restart']);