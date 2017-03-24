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
var striptags = require('gulp-striptags');
var header = require('gulp-header');
var footer = require('gulp-footer');
var removeEmptyLines = require('gulp-remove-empty-lines');


gulp.task('htmllint', ['striptags'], function () {
    return gulp.src('build/stripped/*.html')
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
        .pipe(concat('temp.json'))
        //.pipe(clip())
        .pipe(gulp.dest('build/log'));
});

gulp.task('sanitize', ['clean'], function () {
    return gulp.src('book_src/*.html')
        .pipe(plumber())


        // replace outdated html/head
        .pipe(replace(/<!doctype .*\n/m, ''))

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

        // output the final cleaned markup.
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

var HTMLheader = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Structure and Interpretation of Computer Programs</title>
<link rel="stylesheet" href="css/main.css">
</head>
<body>`;

var HTMLfooter = '</body></html>';

gulp.task('striptags', function () {
    return gulp.src(['book_src/*.html'])
        .pipe(plumber())
        .pipe(striptags(['div', 'h2', 'img', 'h3', 'b', 'caption', 'tt']))
        .pipe(replace('<tt>', '<code>'))
        .pipe(replace('</tt>', '</code>'))
        .pipe(replace(/\<div class=navigation\>[a-zA-Z \n,;\&\]\[]*<\/div>/g, ''))
        //.pipe(replace('&nbsp;', ' '))
        //.pipe(concat('stripped.html'))
        .pipe(header(HTMLheader))
        .pipe(removeEmptyLines(HTMLfooter))
        .pipe(gulp.dest('build/stripped'));
});

gulp.task('outline', function() {
    return gulp.src(['book_src/*.html'])
        .pipe(plumber())

        // get 
        .pipe(striptags(['h1', 'h2', 'h3']))
        
        
        .pipe(replace('&nbsp;', ' '))

        .pipe(gulp.dest('build/intermediate'))

        // replace all non-heading elements 
        //.pipe(replace(/^(?!<h[1,2,3])[ a-zA-Z0-9\[\];\.,():\n\+\*\^\/\-`'\&\=\?\#\!\^\$\%\}\{]*/gm, ''))


        .pipe(replace(/^(?!<h[1,2,3])(?!Chapter)[ a-zA-Z0-9\[\];\.,():\n\+\*\^\/\-`'\&\=\?\#\!\^\$\%\}\{]*$/gm, ''))
        .pipe(removeEmptyLines())
        .pipe(concat('outline.txt'))
        
        .pipe(gulp.dest('build/outline'));
});

// gulp.task('compare', function () {

// });

gulp.task('default', ['sanitize', 'htmllint']);
