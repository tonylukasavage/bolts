> **NOT YET FUNCTIONAL**

# node-bootstrap [![Build Status](https://travis-ci.org/tonylukasavage/node-bootstrap.svg?branch=master)](https://travis-ci.org/tonylukasavage/node-bootstrap)

An opinionated bootstrap for node.js project by [Tony Lukasavage](https://twitter.com/tonylukasavage). While this can be used for any node.js project, my focus has been primarily on tooling and CLI when building on Mac OSX. The core modules and tools used to create the bootstrapped module are:

* [grunt](http://gruntjs.com/) for task management
* [mocha](http://visionmedia.github.io/mocha/) for unit testing
* [should](https://github.com/visionmedia/should.js/) for assertions
* [istanbul](https://github.com/gotwarlost/istanbul) for test coverage
* [jshint](http://www.jshint.com/) for linting

## Install [![NPM version](https://badge.fury.io/js/node-bootstrap.svg)](http://badge.fury.io/js/node-bootstrap)

```bash
$ npm install -g node-bootstrap
```

## Usage

```bash
$ node-boostrap PROJECT_NAME --dest /path/to/new_project
```

## Test [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

```bash
$ grunt
```