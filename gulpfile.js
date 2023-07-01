const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const debug = require('gulp-debug');


const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');

const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
// const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const browsersync = require('browser-sync').create();


const srcPath = {
    scripts: './src/js/*.js',
    sass: './src/sass/main.scss',
    html: 'src/*.html'
};

const destPath = {
    scripts: './search/js/',
    css: './search/css/',
    html: './search/'
};

const errorHandler = (error) => {
    console.error(error.message);
    // виконайте додаткові дії при помилці
};

const clear = () => {
    return src('./search/*', {read: false})
        .pipe(clean());
};

const js = () => {
    return src(srcPath.scripts)
        .pipe(changed(srcPath.scripts))
        .pipe(dest(destPath.scripts))
        .pipe(browsersync.stream());
};

const styles = () => {
    return src(srcPath.sass)
        .pipe(sass().on('error', errorHandler))
        .pipe(dest(destPath.css))
        .pipe(browsersync.stream());
};

const includeHTML = async () => {
    console.log("paths.scripts.src", srcPath.scripts);
    return src(srcPath.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest(destPath.html))
};

const watchFiles = () => {
    watch('./src/sass/*', styles);
    watch('./src/js/*', js);
    watch(['./src/*.html', './src/*/*.html'], includeHTML);
};

const browserSync = () => {
    browsersync.init({
        server: {
            baseDir: ['./search/', './'],
        },
        port: 3000
    });
};

exports.run = parallel(watchFiles, browserSync);
exports.build = series(clear, series(js, styles, includeHTML));

// exports.default = includeHTML;
