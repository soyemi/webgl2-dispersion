const gulp = require('gulp');
const gulpts = require('gulp-typescript');
const browsersync = require('browser-sync');
const through = require('through2');
const path = require('path');
const fs = require('fs');
const util = require('util');


gulp.task('build',()=>{
    BuildTs();
    BuildTemple();
    BuildShader();
    SyncWGLUT();
});


gulp.task('watch',()=>{
    gulp.watch('src/script/**/*.ts',BuildTs);
    gulp.watch('src/template/**/*',BuildTemple);
    gulp.watch('node_modules/wglut/dist/*.js',SyncWGLUT);
    gulp.watch('src/shader/**.glsl',BuildShader);

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

function BuildShader(){
    gulp.src('src/shader/**.glsl').pipe(gulpGLSLMerge('src/script/ShaderLib.ts'));
}

function SyncWGLUT(){
    gulp.src('node_modules/wglut/dist/*.js').pipe(gulp.dest('dist/'));
}


function gulpGLSLMerge(targetFile) {
    var tarFile = targetFile;
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }
        if (file.isBuffer()) {
            var fname = path.basename(file.path);
            let contents = file.contents;
            let tspath = path.join(process.cwd(), targetFile);
            let tscontent = fs.readFileSync(tspath, { encoding: 'utf8' });
            tscontent = MergeShaderLibTs(fname, contents.toString(), tscontent);
            fs.writeFileSync(tspath, tscontent, { encoding: 'utf8' });
            cb(null, file);
            return;
        }
        if (file.isStream()) {
            console.log("stream: skip");
            cb(null, file);
            return;
        }
    });
}
function MergeShaderLibTs(fname, source, ts) {
    fname = fname.toString();
    if (fname.endsWith('.glsl')) fname = fname.substr(0, fname.length - 5);
    fname = 'GLSL_' + fname.toUpperCase();
    let srcSplit = source.split('\n');

    for (var i = 0; i < srcSplit.length; i++) {
        srcSplit[i] = srcSplit[i].trim();
    }

    let mergetdGlsl = srcSplit.join('\\n');
    mergetdGlsl = '\'' + mergetdGlsl + '\';';

    let tsSplit = ts.split('\n');
    let shLines = {};
    tsSplit.forEach(line => {
        if (line.includes('export const')) {
            let match = line.match(/export const\s+([\w\d_]+)\s*=(.+)/);
            if (match) {
                shLines[match[1]] = match[2];
            }
        }
    });
    shLines[fname] = mergetdGlsl;

    let result = '';// 'namespace cis {\n';
    for (var sh in shLines) {
        result += util.format('export const %s = %s \n', sh, shLines[sh]);
    }
    //result+='}';
    return result;
}