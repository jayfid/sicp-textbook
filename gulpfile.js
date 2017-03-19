/*eslint-env node*/
var gulp = require('gulp');
//var fileinclude = require('gulp-file-include');
var replace = require('gulp-replace');
var del = require('del');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var htmlv = require('gulp-html-validator');
var prettify = require('gulp-jsbeautifier');


gulp.task('htmllint', function () {
    gulp.src('build/markup/*.html')
        .pipe(plumber())
        .pipe(htmlv())
        .pipe(replace('{"messages":[]}', ''))
        .pipe(concat('temp.json'))
        
        .pipe(prettify({
            'js': {
                'file_types': ['.json', '.bowerrc']
            }
        }))
        .pipe(gulp.dest('build/log'));
});

var topDoc = `<!doctype html>
<html lang="en">
  <head>
  <title>LALALA</title>
  <link rel="stylesheet" href="/styles/layout.css">
</head>
<body>`;

gulp.task('sanitize', function () {
    gulp.src('book_src/*.html')
        .pipe(plumber())

        // attempt to reduce the amount of giant whitespace
        .pipe(replace(/\n{3,}/mg, ''))

        // replace outdated html/head
        .pipe(replace(/<!doctype.*(\n.*)*<body>/m, topDoc))

        // remove footer navigation links
        .pipe(replace(/<p><div class=navigation>.*(\n.*)*<p>/, ''))

        // remove top navigation links
        .pipe(replace(/<p><div class=navigation>.*(\n.*)*]<\/div><p>/, ''))

        // remove all <p> tags.  they have no hope.
        .pipe(replace('<p><br><p>', '<br />'))
        .pipe(replace('<p>', ''))
        .pipe(replace('</p>', ''))
        .pipe(replace(/[ ]?v?align=(top|bottom|left|right|center)/g, ''))

        // doesn't appear to affect any text
        .pipe(replace('%', ''))

        .pipe(replace(/<table width=[0-9]*>/, '<table>'))

        // remove outdated attributes.
        .pipe(replace(/name="\%?/, 'id="'))

        // probably a suitable replacement
        .pipe(replace('<tt>', '<code>'))
        .pipe(replace('</tt>', '</code>'))

        // rewrite image paths to new subdirectory
        //.pipe(replace('src="', 'src="/images/'))

        // temp fix (bad)
        .pipe(replace('<img', '<img alt="temp"'))


        // .pipe(replace('<ul>', '<div>'))
        // .pipe(replace('</ul>', '</div>'))
        // .pipe(replace(/<li>.*/, '<div>$&</div>'))
        // .pipe(replace('<li>', ''))
        // .pipe(replace('</li>', ''))

        // doesnt seem useful
        .pipe(replace('<div class=chapterheading>&nbsp;</div>', ''))

        // removing useless anchor links.
        .pipe(replace(/<a name=".*"><\/a>/, ''))

        // changing anchor links to ids:
        .pipe(replace('<a name="', '<a id="'))

        //.pipe(replace(' id="-sec_IGNORE"', ''))

        .pipe(replace('table width=100%', 'table'))

        // .pipe(replace('<caption >', ''))
        // .pipe(replace('</caption>', ''))

        // remove broken tags in files 38,39
        .pipe(replace('<a id="_index_start">', ''))


        // remove footer links on ever page.
        .pipe(replace(/<a href="book.*[next](\n.*)*<\/a>\]\<\/div><a id="_.*<\/a>/m, ''))


        // .pipe(replace('<tr><td  >&nbsp;&nbsp;</td></tr>', ''))
        // .pipe(replace('</tr><div >', '</tr><tr><td>'))
        // .pipe(replace('</div><tr>', '</td></tr><tr>'))

        .pipe(gulp.dest('build/markup'));

});

gulp.task('clean', function () {
    return del('build');
});

gulp.task('default', ['clean', 'sanitize', 'htmllint']);
