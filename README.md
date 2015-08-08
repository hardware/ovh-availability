# ovh-availability

OVH, Kimsufi & SoYouStart servers availability checker

![build](https://img.shields.io/codeship/ad642cb0-6e4f-0132-b9bf-66f2bf861e14.svg)
[![dependency](https://img.shields.io/david/hardware/ovh-availability.svg?label=Dependencies)](https://github.com/hardware/ovh-availability/blob/master/package.json#L9)
[![release](https://img.shields.io/github/release/hardware/ovh-availability.svg?label=Release)](https://github.com/hardware/ovh-availability/releases)
[![stars](https://img.shields.io/github/stars/hardware/ovh-availability.svg?label=Likes)](https://github.com/hardware/ovh-availability/stargazers)
[![license](https://img.shields.io/github/license/hardware/ovh-availability.svg?label=License)](https://raw.githubusercontent.com/hardware/ovh-availability/master/LICENSE)

## Overview

Ovh-availability is a web-based application written in Javascript. Main idea behind this project is to make your life easier by searching for you OVH offers automatically and notify you as aoon as servers are available for purchase. E-mail and Pushbullet notifications are available.

Pushbullet is an application that allows you to receive notification directly to your mobile, tablet, browser etc...

Device compatibility : https://www.pushbullet.com/apps

## Hosting

App is hosted on Heroku using traditional dynos. I use following add-ons :

- Heroku Postgres - Free plan
- Logentries - Free plan
- SendGrid - Free plan
- New Relic APM - Free plan
- New Relic Insights (Statistics)

Database is hosted on Amazon EC2.

## Features

- All OVH, Kimsufi & Soyoustart offers available ([Offers map](https://github.com/hardware/ovh-availability/blob/master/map.json))
- Datacenter location selection (Europe, Canada, Any)
- Push notification with Pushbullet OAUTH API
- Statistics using NewRelic Insights (offers recently available, number of notifications)
- French and English translation (need contributors for others languages)

## Contribute

- Fork this repository
- Create a new feature branch for a new functionality or bugfix
- Commit your changes
- Push your code and open a new pull request
- Use [issues](https://github.com/hardware/ovh-availability/issues) for any questions

## Support

https://github.com/hardware/ovh-availability/issues

## Contact

- [contact@meshup.net](mailto:contact@meshup.net)
- [http://twitter.com/hardvvare](http://twitter.com/hardvvare)

## License

The MIT License (MIT)

Copyright (c) 2014-2015 Quentin PANISSIER, <contact@meshup.net>
