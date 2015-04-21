'use strict';

var _ = require('underscore');
var argv = require('yargs').argv;
var frontMatter = require('gulp-front-matter');
var merge = require('merge-stream');
var swig = require('swig');
var swigExtras = require('swig-extras');
var through = require('through2');
var rimraf = require('gulp-rimraf');
var marked = require('gulp-marked');
var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');

var site = {
		'title': 'Maungawhau IT',
	    'url': 'http://localhost:9000',
	    'urlRoot': '/',
	    'author': 'James Mitchell',
	    'email': 'james.mitchell@maungawhau.net.nz',
	    'google_verify': 'ly8QgWAy0wwtyg5EoDAcuzhxRvsglDkNS740NVwHLco',
	    'analytics_id': '',
	    'time': new Date()
}

if (argv._.indexOf('deploy') > -1) {
    site.url = 'http://www.maungawhau.net.nz'
    site.urlRoot = '/'
}

swig.setDefaults({
    loader: swig.loaders.fs(__dirname + '/../app/assets/templates'),
    cache: false
});
swigExtras.useFilter(swig, 'truncate');

function summarize(marker) {
    return through.obj(function (file, enc, cb) {
        var summary = file.contents.toString().split(marker)[0]
        file.page.summary = summary
        this.push(file)
        cb()
    })
}


function applyTemplate(templateFile) {
    var tpl = swig.compileFile(path.join(__dirname, '..', templateFile));

    return through.obj(function (file, enc, cb) {
        var data = {
            site: site,
            page: file.page,
            content: file.contents.toString()
        };
        file.contents = new Buffer(tpl(data), 'utf8');
        this.push(file);
        cb();
    });
}

gulp.task('cleanposts', function () {
    return gulp.src(['dist/posts'], {read: false})
        .pipe(rimraf());
});

gulp.task('posts', ['cleanposts'], function () {
    return gulp.src('app/content/posts/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(marked())
        .pipe(summarize('<!--more-->'))
        // Collect all the posts and place them on the site object.
        .pipe((function () {
            var posts = []
            var tags = []
            return through.obj(function (file, enc, cb) {
                file.page.url = 'posts/' + path.basename(file.path, '.md');
                posts.push(file.page);
                posts[posts.length - 1].content = file.contents.toString();

                if (file.page.tags) {
                    file.page.tags.forEach(function (tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                }

                this.push(file);
                cb();
            },
            function (cb) {
                posts.sort(function (a, b) {
                    return b.date - a.date;
                });
                site.posts = posts;
                site.tags = tags;
                cb();
            })
        })())
        .pipe(applyTemplate('app/assets/templates/post.html'))
        .pipe(gulp.dest('dist/posts'));
});


gulp.task('testimonials', function () {
    // Copy testimonial images over.
    var images = gulp.src('app/content/testimonials/*.jpg')
        .pipe(gulp.dest('dist/images/testimonials'))

    var testimonials = gulp.src('app/content/testimonials/**/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(marked())
        // Collect all the testimonials and place them on the site object.
        .pipe((function () {
            var testimonials = [];
            return through.obj(function (file, enc, cb) {
                testimonials.push(file.page);
                testimonials[testimonials.length - 1].content = file.contents.toString();
                this.push(file);
                cb();
            },
            function (cb) {
                testimonials.sort(function (a, b) {
                    if (a.author < b.author) {
                        return -1;
                    }
                    if (a.author > b.author) {
                        return 1;
                    }
                    return 0;
                })
                site.testimonials = testimonials;
                cb();
            })
        })())

    return merge(images, testimonials);
});


gulp.task('cleanpages', function () {
    return gulp.src(['dist/*.html'], {read: false})
        .pipe(rimraf());
});


gulp.task('pages', ['cleanpages', 'testimonials'], function () {
    var html = gulp.src(['app/content/pages/*.html'])
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(through.obj(function (file, enc, cb) {
            var data = {
                site: site,
                page: {}
            };
            var tpl = swig.compileFile(file.path);
            file.contents = new Buffer(tpl(data), 'utf8');
            this.push(file);
            cb();
        }));

    var markdown = gulp.src('app/content/pages/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(marked())
        .pipe(applyTemplate('app/assets/templates/page.html'))
        .pipe(rename({extname: '.html'}));

    return merge(html, markdown)
        .pipe(gulp.dest('dist'));
});

gulp.task('rss', ['posts'], function () {
    return gulp.src(['assets/templates/atom.xml'])
        .pipe(through.obj(function (file, enc, cb) {
            var data = {
                site: site,
                page: {}
            }
            var tpl = swig.compileFile(file.path)
            file.contents = new Buffer(tpl(data), 'utf8')
            this.push(file)
            cb()
        }))
        .pipe(gulp.dest('dist'))
});
gulp.task('content', ['posts', 'pages', 'rss']);