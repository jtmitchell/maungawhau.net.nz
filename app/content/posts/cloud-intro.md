---
title: What the Cloud means to me
description: First thoughts about cloud deployment
created: 2014-06-04 21:00:00
share: true
comments: true
image: stackato-cake-diagram.png
image_caption: Stackato cake diagram
tags:
    - cloud
    - paas
    - stackato
    - python
    - django
---

The Cloud, and specifically PaaS, has become a very exciting space to be in... but what advantage does it bring? And what is the difference between the Amazon EC2 cloud, and the Heroku or Cloud Foundry clouds?
<!--more-->

## Defining a Cloud

The meaning of cloud has been evolving for some time. The initial definition was just having a server co-located in a server room
somewhere off site, and that rapidly morphed into having a virtual server running on someone's (usually Amazon's) real hardware.
In this case, putting your data or application in *the cloud* means doing all the same things you would do locally, except you save the cost of buying a physical server. This cloud is now referred to as [Infrastructure-as-a-Service][iaas].

That isn't what I mean by _cloud_

## IaaS vs PaaS

[Infrastructure-as-a-Service][iaas] is pretty darn wonderful, and it enabled a huge leap forward in web services. I'm thinking here about how Google uses large clusters of "disposable" servers which their services run on top of. Or how Amazon revolutionised the industry by renting out their virtual EC2 servers.

The problem I have with IaaS is that a virtual server still needs to have software installed and configured before I can stand up my application - and it is the application, running and delivering content, that I am focused on.
In IaaS land you might choose to login and install the packages to support your application by hand, then configure the application and point the DNS at the new server. Once you do this the third time you are ready to use tools like [Puppet][puppet], [Chef][chef], or my favourite [Juju][juju] to automate the setup. But in the end you are still having to do the same things over and over. For a new web app you will probably take the boilerplate scripts from the last project, change the repository and server names, and start deploying again... which starts to sound a little dull.

How dull? Well [Heroku][heroku] shows me that I can deploy my web app just by pushing my git repository to the Heroku servers. Within 5 minutes the web app is running and you can use a generic url to access it - without changing DNS, firewalls, or spinning up a VM. 

If Heroku can do it, why can't I? 

I *can* - and PaaS is the tool to make it happen.

## Defining the PaaS

After doing a few searches, I settled on [Cloud Foundry][cf] as a good PaaS choice, and specifically the version that ActiveState offer, [Stackato][stackato]. Cloud Foundry is a suite of software that needs to be built, installed, and configured (perhaps on that nice IaaS you have?) - and Stackato is all that goodness packaged up into a VM image ready for instant deployment on AWS, OpenStack, or vSphere.

From now on, your IaaS will not have to bother with setup and configuration of all the super new services - that is now Cloud Foundry's job. The role of the IaaS is now to deploy new Cloud Foundry nodes as and when needed - and since we are going to use Stackato, that role becomes

* spin up a new VM on a server
* install the Stackato image
* run a command to add the VM into the cloud

That *must* be a win for the people who have to provision, scale, and monitor the Infrastructure!
Instead of dealing with any number of web apps, they now have to keep a single VM image running. (Does this change how you administer the database? No. But I suspect that is already pretty much under control, so why break what ain't broke?)

The shiny new Cloud Foundry cloud will now

* accept arbitrary code, pushed from developers
* determine how to deal with the code, and deploy the code into a container
* place the container of code onto 1 or more nodes to be run, and start them running
* link each running instance with any _services_ they require
    * services are databases, caches, other apps - and are defined when the app is pushed into the cloud
        * services are the idea that I loved in [Juju][juju] - which called them _relationships_ and defined how different generic apps would connect to and consume other services
* intercept requests into a wildcard DNS domain based on the app name and route them to a running instance
* provide a shiny web 2.0 interface to interact with the app
    * scale the instances up or down; start or stop them; even have a Facebook-like timeline of activity
    * view the logs in realtime

*That's* what I mean by _cloud_

![Stackato Cloud](/images/posts/stackato-cake-diagram.png)[Stackato cake diagram]

## But wait! There's more!

For the next blog, we'll think about how to use the new shiny toys and add some Jenkins and Git magic to support an enterprise-style deployment.


[paas]: http://en.wikipedia.org/wiki/Platform_as_a_service "PaaS"
[iaas]: http://en.wikipedia.org/wiki/Infrastructure_as_a_service#Infrastructure_as_a_service_.28IaaS.29 "IaaS"
[cf]: http://cloudfoundry.org/index.html "Cloud Foundry"
[stackato]: http://www.activestate.com/stackato "Stackato"
[Stackato cake diagram]: http://www.activestate.com/sites/default/files/images/stackato/stackato-cake-diagram_2013-simple-whitebg_0.png
[puppet]: http://puppetlabs.com/puppet/what-is-puppet "Puppet"
[chef]: http://www.getchef.com/chef/ "Chef"
[juju]: https://juju.ubuntu.com/ "Juju"
[heroku]: https://www.heroku.com/ "Heroku"


