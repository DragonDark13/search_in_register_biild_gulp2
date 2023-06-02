const gulp        = require('gulp');
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


function clear() {
    return src('./search/*', {
            read: false
        })
        .pipe(clean());
}




function js() {
    const source = './src/js/*.js';

    return src(source)
        .pipe(changed(source))
        // .pipe(concat('bundle.js'))
        // .pipe(uglify())
        // .pipe(rename({
        //     extname: '.min.js'
        // }))
        .pipe(dest('./search/js/'))
        .pipe(browsersync.stream());
}

//  gulp.task('styles', () => {
//
// });

function styles() {
     return gulp.src('./src/sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./search/css/')).pipe(browsersync.stream());
}

function css() {
    const source = './src/sass/main.scss';

    return src(source)
        .pipe(changed(source))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        // .pipe(rename({
        //     extname: '.min.css'
        // }))
        // .pipe(cssnano())
        .pipe(dest('./search/css/'))
        .pipe(browsersync.stream());
}

function html() {
        const source = './src/*.html';

        return src(source).pipe(changed(source)).pipe(dest('./search/')).pipe(browsersync.stream());


}



const paths = {
  scripts: {
    src: './src/',
    dest: '../search/'
  }
};

async function includeHTML(){

  console.log("paths.scripts.src",paths.scripts.src);
  return gulp.src('src/*.html').pipe(debug({title: 'unicorn:'}))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })).pipe(debug({title: 'unicorn:'}))
    .pipe(gulp.dest('./search/')).pipe(debug({title: 'unicorn:'}));
}

function watchFiles() {
    watch('./src/sass/*', styles);
    watch('./src/js/*', js);
    watch(['./src/*.html','./src/*/*.html'],includeHTML)
    // watch('./libs/images/*', img);
}

function browserSync() {
    browsersync.init({
        server: {
            baseDir: ['./search/','./'],
        },
        port: 3000
    });
}

exports.watch = parallel(watchFiles, browserSync);
exports.default = series(clear, series([js, styles, includeHTML]));

// exports.default = includeHTML;
