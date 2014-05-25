> **NOT YET FUNCTIONAL**

# bolts [![Build Status](https://travis-ci.org/tonylukasavage/bolts.svg?branch=master)](https://travis-ci.org/tonylukasavage/bolts)

An opinionated bootstrap for node.js project by [Tony Lukasavage](https://twitter.com/tonylukasavage). While this can be used for any node.js project, my focus has been primarily on tooling and CLI when building on Mac OSX. The core modules and tools used to create the bootstrapped module are:

* [grunt](http://gruntjs.com/) for task management
* [mocha](http://visionmedia.github.io/mocha/) for unit testing
* [should](https://github.com/visionmedia/should.js/) for assertions
* [istanbul](https://github.com/gotwarlost/istanbul) for test coverage
* [jshint](http://www.jshint.com/) for linting

## Install [![NPM version](https://badge.fury.io/js/bolts.svg)](http://badge.fury.io/js/bolts)

```bash
$ npm install -g bolts
```

## Usage

Below shows all possible options when running `bolts`. If any required values are omitted, you will be prompted for them.

```bash
$ bolts --help

  Usage: bolts [options]

  Options:

    -h, --help                       output usage information
    -v, --version                    output the version number
    -d, --description <description>  Description of the project
    -f, --force                      Overwrite existing project if present
    -e, --email <email>              You email address
    -g, --github <github>            Your github username
    -p, --project <project>          Name of the project
    -n, --name <name>                Your full name
    -u, --url <url>                  URL of the project
    -y, --year <year>                Year to use for copyright
```

## Testing [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

```bash
$ grunt
```
