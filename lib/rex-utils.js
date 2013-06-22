/*###############################################################################
#
#             _ __ _____  __   Welcome to the      _
#            | '__/ _ \ \/ / ___ __ ___ ____  _ __| |_ ___ _ __
#            | | |  __/>  < / -_) _/ _ (_-< || (_-<  _/ -_) '  \
#            |_|  \___/_/\_\\___\__\___/__/\_, /__/\__\___|_|_|_|
#                                          |__/
#
# The rex-* ecosystem is a collection of like-minded modules for Node.js/NPM
#   that allow developers to reduce their time spent developing by a wide margin.
#
#   Header File Version: 0.0.1, 06/08/2013
#
# The MIT License (MIT)
#
# Copyright (c) 2013 Pierce Moore <me@prex.io>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
#######*/
var cli = require('rex-shell')
  , exec = require('rex-exec')
  , _ = require('./rex-mixins')._
  , fs = require('fs')
  , path = require('path')
  // , optimist = require('optimist')
  // , optimist = require('optimist')
  //     .usage('Perform simple operations on MongoDB locally. \nUsage: $0')
  //     .alias('c','count')
  //     .describe('c','Count the collections in a database. Leave empty for a list of databases.')
  //     .alias('l','list')
  //     .describe('l','List the collections in a database. Leave empty for a list of databases.')
  //     .alias('d','drop')
  //     .describe('d','Drop an entire database. Leave empty for a list of databases.')
  // , argv = optimist.argv

cli.config.appName("rex-utils")

exports.version = version = function(app, die) {
  cli.$.blue(app.name +" Version Tree: ")
  _.each(app.parts, function(version, name) {
    cli.$.blue("  "+ cli.$$.g( name +":")+" \t [ " + cli.$$.r( version ) + " ]")
  })
  cli.$.blue("  "+ cli.$$.g("Node.js:")+" \t [ " + cli.$$.r( process.versions.node ) + " ]")
  cli.$.blue("  "+ cli.$$.g("V8 (Engine):")+" \t [ " + cli.$$.r( process.versions.v8 ) + " ]")
  if(typeof die == undefined || die !== false)
    process.exit(0)
}

exports.help = help = function(params, die) {
  console.log( cli.$$.r( params.name ))
  console.log( cli.$$.b("Description: \n  ")+ params.description)
  console.log( cli.$$.b("Usage: \n  ")+ params.usage)
  console.log( cli.$$.b("Options:") )
  _.each(params.args, function(description, name) {
    console.log("  "+ cli.$$.g(name) +"\t - "+ description)
  })
  console.log("  "+ cli.$$.g('help')+"\t - Display this help text.")
  if(typeof die == undefined || die !== false)
    process.exit(0)
}

exports.commands = commands = {
  'mongo' : {
    'list' : 'mongo {{dbname}} --quiet --eval "printjson(db.getCollectionNames())"',
    'count' : 'mongo {{dbname}} --quiet --eval "printjson(db.getCollectionNames().forEach(function(coll){printjson(coll+\"-\"+db[coll].count())}))"',
    'drop' : 'mongo {{dbname}} --eval "db.getCollectionNames().forEach( function(coll) { if(coll!=\'system.indexes\') { db[coll].drop(); db[coll].dropIndexes()}})"',
    'snapshot' : '',
    'restore' : '',
  },
  'redis' : {
    'count' : 'redis-cli keys "*" | wc -l',
    'clear' : 'redis-cli flushall'
  }
}

exports.init = function() {
  // if(process.argv.version)
  //   version()
  // else
  //   optimist.showHelp()
}

// Class Exports
exports._ = _
