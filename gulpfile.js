const gulp = require('gulp');
const gulpts = require('gulp-typescript');
const browsersync = require('browser-sync');


gulp.task('build',()=>{
    BuildTs();
    BuildTemple();
    SyncWGLUT();
});


gulp.task('watch',()=>{
    gulp.watch('src/script/**/*.ts',BuildTs);
    gulp.watch('src/template/**/*',BuildTemple);
    gulp.watch('node_modules/wglut/dist/*.js',SyncWGLUT);

    browsersync.init({
        server: {
            baseDir: './dist/'
        },
        port: 6633,
        files: ['./dist/*.js', './dist/*.html']
    })
});


function BuildTs(){
    gulp.src('src/script/**/*.ts')
    .pipe(gulpts({
        outFile:'Dispersion.js',
        module:'amd',
        lib:['es2015','dom'],
        moduleResolution:'node'
    })).pipe(gulp.dest('dist/'));
}

function BuildTemple(){
    gulp.src('src/template/**/*').pipe(gulp.dest('dist/'));
}

function SyncWGLUT(){
    gulp.src('node_modules/wglut/dist/*.js').pipe(gulp.dest('dist/'));
}