/*eslint-env node*/
var gulp = require('gulp');
//var fileinclude = require('gulp-file-include');
var replace = require('gulp-replace');
var del = require('del');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var htmlv = require('gulp-html-validator');
var prettify = require('gulp-jsbeautifier');
var extention = require('gulp-ext-replace');
var clip = require('gulp-clip-empty-files');
var striptags = require('striptags').init_streaming_mode();


gulp.task('htmllint', ['sanitize'], function () {
    return gulp.src('build/markup/*.html')
        .pipe(plumber())
        .pipe(htmlv())
        .pipe(replace('{"messages":[]}', ''))
        .pipe(replace('{"messages":[],"language":"en"}', ''))
        .pipe(extention('.json'))
        .pipe(prettify({
            'js': {
                'file_types': ['.json', '.bowerrc']
            }
        }))
        // .pipe(concat('temp.json'))
        .pipe(clip())
        .pipe(gulp.dest('build/log'));
});

gulp.task('sanitize', ['clean'], function () {
    return gulp.src('book_src/*.html')
        .pipe(plumber())


        // replace outdated html/head
        .pipe(replace(/<!doctype .*\n/m, '<!doctype html>'))

        // remove multiline comments in head
        .pipe(replace(/<!--.*(\n)[ ]*.*/m, ''))

        // add lang to html
        .pipe(replace('<html>', '<html lang="en">'))

        // replace css
        .pipe(replace(/<link .*>/, '<link rel="stylesheet" href="css/main.css">'))

        // remove all <p> and <b> tags.  may want to convert p -> br and b -> strong.
        .pipe(replace(/<\/?(p|b])[ ]*\/?>/g, ''))

        // remove align attributes
        .pipe(replace(/[ ]?v?align=(top|bottom|left|right|center)/g, ''))

        // Removes percent signs added to elem IDs. doesn't appear to affect any content.
        .pipe(replace('%', ''))

        // replace name attrs with ids.
        .pipe(replace('<a name=', '<a id='))

        // probably a suitable replacement tt -> code
        .pipe(replace('<tt>', '<code>'))
        .pipe(replace('</tt>', '</code>'))

        // rewrite image paths to new subdirectory
        .pipe(replace('src="', 'src="/images/'))

        // 'it just works' fix for html validation errors.
        .pipe(replace('<img', '<img alt="foo"'))

        // deal with invalid markup inside heading elements.  May want to be able to style these in css.
        .pipe(replace('<h1', '<div'))
        .pipe(replace('</h1>', '</div>'))

        // try to handle out-of-control whitespace
        .pipe(replace('&nbsp;', ' '))
        .pipe(replace(/^[ ]*$/g, ''))

        // removing empty anchor links.
        .pipe(replace(/<a[a-zA-Z0-9 "=#-_\.]*>[ ]*<\/a>/g, ''))

        // try to fix table html
        .pipe(replace(/<table width=[0-9]*>/g, '<table>'))
        .pipe(replace('<caption><div>', '<tr><td>'))
        .pipe(replace('</div></caption>', '</td></tr>'))
        .pipe(replace(/<tr><td >[ ]*<\/td><\/tr>/g, ''))

        // remove footer links on ever page.
        //.pipe(replace(/<p><div class=navigation>.*\n<a .*\n<a .*<(\/)?p>/g, ''))
        .pipe(replace(/<p><div class=navigation>.*\n?<a[a-zA-Z0-9 "=#-_\.]*>[a-zA-Z ]*<\/a>[a-zA-Z ;&]*<a[a-zA-Z0-9 "=#-\._]*>[a-zA-Z ;&]*<\/a>\]<\/div><p>/g, ''))

        // remove page navigation links
        .pipe(replace(/(<p>)?<div class=navigation>.*(\n.*){3}/g, ''))

        // === FILE SPECIFIC FIXES === //

        // remove broken a link in file 4
        .pipe(replace('<a id="_toc_start">', ''))

        // remove broken tags in files 38,39
        .pipe(replace('<a id="_index_start">', ''))

        // remove bad or repeated ids across multiple files.
        .pipe(replace('id="_sec_IGNORE"', ''))
        .pipe(replace('id="_fig_5.17"', ''))
        .pipe(replace('id="_fig_5.18"', ''))
        .pipe(replace('id="_toc__chap_IGNORE"', ''))



        .pipe(gulp.dest('build/markup'));

});

gulp.task('clean', function () {
    return del('build');
});


gulp.task('images', function () {
    return gulp.src(['book_src/*.gif', 'book_src/*.jpg'])
        // Pass in options to the task
        .pipe(imagemin({
            optimizationLevel: 5
        }))
        .pipe(gulp.dest('build/images'));
});

gulp.task('compare', function() {
    return gulp.src(['book_src/*.html'])
        .pipe(plumber())
        //.pipe(striptags())
        .pipe(concat('source.txt'))
        .pipe(gulp.dest('build/compare'));
});

gulp.task('default', ['sanitize', 'htmllint']);
