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
        .pipe(clip())

        //.pipe(concat('temp.json'))
        
        .pipe(gulp.dest('build/log'));
});

gulp.task('sanitize', ['clean'], function () {
    return gulp.src('book_src/*.html')
        .pipe(plumber())

        // rewrite image paths to new subdirectory
        .pipe(replace('src="', 'src="/images/'))


        // try to fix table html
        .pipe(replace(/<table width=[0-9]*>/g, '<table>'))
        .pipe(replace(/<tr><td >[ ]*<\/td><\/tr>/g, ''))

     
        // === FILE SPECIFIC FIXES === //

       
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

gulp.task('striptags', ['clean'], function () {
    return gulp.src(['book_src/*.html'])
        .pipe(plumber())


        //--- remove the majority of broken code


        // should reliably be able create and close a figure elem
        .pipe(replace('<div class=figure><table width=100%>', '<figure>'))
        .pipe(replace('</table></div>', '</figure>'))
        .pipe(striptags([
            'div', // retain some structure.
            'h1',  'h2', 'h3', // headings are relevant
            'h4', // examples
            'img', // disgrams
            'b', 
            'caption', // relevant descriptions, 
            'tt',
            'a' // links are useful
            ]))

        // update <tt>s => <code>s
        .pipe(replace('<tt>', '<code>'))
        .pipe(replace('</tt>', '</code>'))

        // 'it just works' fix for html validation errors.
        .pipe(replace('<img', '<img alt="foo"'))

        // remove align attributes
        .pipe(replace(/[ ]?v?align=(top|bottom|left|right|center)/g, ''))

        // remove heading and footer navs
        .pipe(replace(/\<div class=navigation\>[a-zA-Z \n,;\&\]\[]*<\/div>/g, ''))

        // attempt to remove divs inside of h1s without losing content
        .pipe(replace('<div class=chapterheading>&nbsp;</div>', ''))
        .pipe(replace('<div class=chapterheading>', ''))
        .pipe(replace('</a></div>', '</a>'))

        // Removes percent signs added to elem IDs. doesn't appear to affect any content.
        .pipe(replace('%', ''))

        // replace name attrs with ids.
        .pipe(replace('<a name=', '<a id='))

        // remove bad or repeated ids across multiple files.
        .pipe(replace('id="_sec_IGNORE"', ''))
        .pipe(replace('id="_fig_5.17"', 'target="_fig_5.17"'))
        .pipe(replace('id="_fig_5.18"', 'target="_fig_5.18"'))
        .pipe(replace('id="_toc__chap_IGNORE"', ''))

        // removing empty anchor links.
        .pipe(replace(/<a[a-zA-Z0-9 "=#-_\.]*>[ ]*<\/a>/g, ''))

         // remove broken a link in file 4
        .pipe(replace('<a id="_toc_start">', ''))

        // remove broken tags in files 38,39
        .pipe(replace('<a id="_index_start">', ''))

        // fix unclosed img tags
        .pipe(replace('gif">', 'gif"/>'))

        // replace captions
        .pipe(replace('<caption>', '<div class="caption">'))
        .pipe(replace('</caption>', '</div>'))

        // add scaffolding
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
