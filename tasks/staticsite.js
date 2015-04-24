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
var gutil = require('gulp-util');

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
    var images = gulp.src(['app/content/posts/*.jpg','app/content/posts/*.png'])
    .pipe(gulp.dest('dist/images/posts'));
    var posts = gulp.src('app/content/posts/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(marked())
        .pipe(summarize('<!--more-->'))
        // Collect all the posts and place them on the site object.
        .pipe((function () {
            var posts = [];
            var tags = site.tags || [];
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
    return merge(images, posts);
});


gulp.task('projects', function () {
    // Copy project images over.
    var images = gulp.src(['app/content/projects/*.jpg', 'app/content/projects/*.png'])
        .pipe(gulp.dest('dist/images/projects'));

    var projects = gulp.src('app/content/projects/**/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(marked())
        // Collect all the projects and place them on the site object.
        .pipe((function () {
            var projects = [];
            var tags = site.tags || [];
            return through.obj(function (file, enc, cb) {
                file.page.url = 'projects/' + path.basename(file.path, '.md');
                projects.push(file.page);
                projects[projects.length - 1].content = file.contents.toString();
                
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
                projects.sort(function (a, b) {
                	return b.date - a.date;
                })
                site.projects = projects;
                site.tags = tags;
                cb();
            })
        })())
        .pipe(applyTemplate('app/assets/templates/post.html'))
        .pipe(gulp.dest('dist/projects'));

    return merge(images, projects);
});


gulp.task('cleanpages', function () {
    return gulp.src(['dist/*.html'], {read: false})
        .pipe(rimraf());
});


gulp.task('pages', ['cleanpages', 'projects'], function () {
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
        .pipe(gulp.dest('dist'));
});

gulp.task('sitemap', ['posts', 'pages', 'projects'], function () {
    return gulp.src(['assets/templates/sitemap.xml'])
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
        .pipe(gulp.dest('dist'));
});

function tags() {    
	var stream = through.obj(function(file, enc, cb) {
		this.push(file);
		cb();
	});
    
	if (site.tags) {
		site.tags.forEach(function (tag) {
			var file = new gutil.File({
				path: tag + '.html',
				contents: new Buffer('')
			});
			file.page = {title: tag, tag: tag}
            
			stream.write(file);        
		});
	}
  
	stream.end();
	stream.emit("end");

	return stream;
}

gulp.task('tags', ['posts', 'projects'], function () {
    return tags()
        .pipe(applyTemplate('app/assets/templates/tag.html'))
        .pipe(gulp.dest('dist/tag'));
});

gulp.task('content', ['posts', 'projects', 'pages', 'tags', 'rss', 'sitemap']);