---
title: Create A Poster
description: Team Posters at Fujifilm
created: !!timestamp "2012-08-01 12:00:00"
tags:
    - fujifilm
    - website
    - ecommerce
    - python
    - django
---
{% from "mit_macros.j2" import project_info %}
{{ project_info(client='Fujifilm NZ', start='December 2009', end='July 2012') }}


After starting with the wrappz.co.nz site, we continued working with Fujifilm NZ
to create new shopping sites.
<!--more-->

Projects that went live are [Create A Poster](http://afl.createaposter.com.au)
and [The Corner Dairy](http://www.thecornerdairy.co.nz).

For [Create A Poster](http://afl.createaposter.com.au) we needed to make the clubs pages use the club logo
colours.
{% mark image -%}
![Club Page - background and logo vary according to the club](/media/images/createaposter.com.au-cats.png)
{%- endmark %}
![Club Page - background and logo vary according to the club]([[!!images/createaposter.com.au-suns.png]])

Then we needed a dynamic way to show what poster you are buying as you select your customisable options.
![Custom Poster - initial page]([[!!images/createaposter.com.au-bartel.png]])
![Custom Poster - choose a background]([[!!images/createaposter.com.au-bartel-bkg.png]])
![Custom Poster - choose a style for the name]([[!!images/createaposter.com.au-bartel-name.png]])
![Custom Poster - choose another combination]([[!!images/createaposter.com.au-bartel-other.png]])


Projects that did not make it into production are a cartoon site, a chemicals site, and a book covers site.

These new projects were developed in Python + Django + Satchmo (providing
a pre-built shopping cart).

