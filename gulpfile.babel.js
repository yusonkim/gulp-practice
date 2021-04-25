import gulp from 'gulp'
import gpug from 'gulp-pug'
import del from 'del'
import ws from 'gulp-webserver'
import gimage from 'gulp-imagemin'
import gscss from 'gulp-scss'
import gcssmin from 'gulp-cssmin'
import grename from 'gulp-rename'
import autoprefixer from 'gulp-autoprefixer'
import gbrowserify from 'gulp-bro' // browserify
import gbabelify from 'babelify'

const routes = {
  pug: {
    src: 'src/*.pug',
    dest: 'build',
    watch: 'src/**/*.pug'
  },
  img: {
    src: 'src/img/*',
    dest: 'build/img'
  },
  style: {
    src: 'src/scss/style.scss',
    dest: 'build/css',
    watch: 'src/scss/**/*.scss'
  },
  js: {
    src: 'src/js/main.js',
    dest: 'build/js',
    watch: 'src/js/**/*.js'
  }
}

// delete previous build
const clean = () => del(['build'])

// build images
const buildImage = () => 
  gulp
    .src(routes.img.src)
    .pipe(gimage({
      svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']
    }))
    .pipe(gulp.dest(routes.img.dest))

// build pug html
const buildHtml = () =>
  gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest))

// build style
const buildStyle = () =>
  gulp
    .src(routes.style.src)
    .pipe(gscss())
    .pipe(autoprefixer())
    .pipe(gcssmin())
    .pipe(grename({suffix: '.min'}))
    .pipe(gulp.dest(routes.style.dest))

// build js, babelify and browserify
const buildJs = () =>
  gulp
    .src(routes.js.src)
    .pipe(gbrowserify({
      transform: [
        gbabelify.configure({ presets: ['@babel/preset-env'] }),
        [ 'uglifyify', { global: true } ]
      ]
    }))
    .pipe(gulp.dest(routes.js.dest))


// dev: webserver
const webserver = () =>
  gulp
    .src('build')
    .pipe(ws({
      livereload: true,
      open: true
    }))

// dev: watch files and recompile pug
const watch = () => {
  gulp.watch(routes.pug.watch, buildHtml)
  gulp.watch(routes.img.src, buildImage)
  gulp.watch(routes.style.src, buildStyle)
  gulp.watch(routes.js.watch, buildJs)
}

const prepare = gulp.series([clean, buildImage])
const compile = gulp.series([buildHtml, buildStyle, buildJs])
const postCompile = gulp.parallel([webserver, watch])

// export for 'yarn dev'
export const dev = gulp.series([prepare, compile, postCompile])