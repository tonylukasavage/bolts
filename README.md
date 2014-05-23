> **NOT YET FUNCTIONAL**

# node-bootstrap

A highly opinionated bootstrap for node.js project by [Tony Lukasavage](https://twitter.com/tonylukasavage). While this can be used for any node.js project, my focus has been primarily on tooling and CLI when building on Mac OSX. The core modules and tools used to create the bootstrapped module are:

* [grunt]() for task management
* [mocha]() for unit testing
* [should]() for assertions
* [istanbul]() for test coverage
* [ti-mocha]() for Titanium unit testing (_optional_)

## Install

```bash
$ npm install -g node-bootstrap
```

## Usage

```bash
$ node-boostrap PROJECT_NAME --dest /path/to/new_project
```