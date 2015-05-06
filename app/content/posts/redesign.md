---
title: Site Refresh
description: A mobile responsive site redesign
created: 2015-05-06 19:45:00
share: true
comments: true
image: redesign-header.jpg
image_caption: Site Redesign
tags:
    - website
    - refresh
---

After a very long time, and much prompting from Google about the upcoming
[Mobilegeddon](http://searchengineland.com/library/google/google-mobile-friendly-update),
we have redesigned our site to be less cluttered and mobile responsive.

<!--more-->

![New Site](/images/posts/redesign-header.jpg)

The underlying HTML and CSS has been replaced with the 
[Google Web Starter Kit](https://developers.google.com/web/starter-kit/),
then the content has been layered on top.

The site itself was statically generated using [Hyde](http://hyde.github.io/),
but since the Google Kit is based on NPM and Gulp, we have written Gulp tasks to
create static pages from simple [Markdown](http://en.wikipedia.org/wiki/Markdown) files.
Many thanks to [Sean Farrell](https://github.com/rioki/www.rioki.org) 
and [Daniel Naab](https://github.com/danielnaab/wunderdog/) for their excellent examples.

[The code for this site is available on GitHub](https://github.com/jtmitchell/maungawhau.net.nz).