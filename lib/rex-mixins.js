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
var _ = require('underscore')._
  , cli = require('rex-shell')
  , fs = require('fs')
  , path = require('path')

_.mixin({

  /**
   * Helper method to quickly retrieve and parse all modules' local 'rex.json' config file.
   */
  rexfile : function(dir) {
    dir = dir || process.cwd()
    rexfilePath = _.osPath(dir+'/rex.json')
    if( fs.existsSync(rexfilePath) ) {
      return require(rexfilePath)
    } else {
      cli.error("No rex.json file found at "+ rexfilePath)
      return {}
    }
  },

  /**
   * Displays well-formatted version information for the provided package and all additional packages.
   * @param  {Object} package    Package.json for the module requested
   * @param  {Object} additional Additional package versions to display, in format: { packageName : version }
   */
  displayVersion : function(package, additional) {
    cli.$.blue(package.name +" Version Tree: ")
    cli.$.blue(cli.$$.g(  _.align(package.name, 20) )+" [ " + cli.$$.r( package.version ) + " ]")    
    _.each(additional, function(version, name) {
      cli.$.blue(cli.$$.g(  _.align(name, 20) )+" [ " + cli.$$.r( version ) + " ]")
    })
    cli.$.blue(cli.$$.g( _.align("Node.js", 20) )+" [ " + cli.$$.r( process.versions.node ) + " ]")
    cli.$.blue(cli.$$.g( _.align("V8 (Engine)", 20) )+" [ " + cli.$$.r( process.versions.v8 ) + " ]")
  },

  /**
   * Shell commands utilized by the whole rex-* ecosystem
   */
  rex_commands : function() {
    return {
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
      },
      'git' : {
        'branch' : 'git rev-parse --abbrev-ref HEAD',
        'status_quiet' : 'git fetch && git status -sb',
        'status_long' : 'git fetch && git status',
        'peek' : '',
        'porcelain' : 'if [ -n "$(git status --porcelain)" ]; then \n\
  echo >&2 "$(git status -sb)"; \n\
  exit 1; \n\
else \n\
  echo "CLEAN"; \n\
fi',
        'prePull' : 'if [ -n "$(git status --porcelain)" ]; then \n\
  echo >&2 "ERROR: Working tree dirty, aborting pull."; \n\
  exit 1; \n\
else \n\
  echo "Working tree clean, pulling"; \n\
  git pull \n\
fi'
      }
    }
  },

  /**
   * Displays well-formatted help/usage information based on package.json config.
   * @param  {Object} package Package.json for the module requested
   */
  showHelp : function(package) {
    console.log( cli.$$.r( package.name ))
    console.log( cli.$$.b("Description: \n  ")+ package.description)
    console.log( cli.$$.b("Usage: \n  ")+ package.config.cli.usage)
    console.log( cli.$$.b("Options:") )
    _.each(package.config.cli.args, function(description, name) {
      console.log( cli.$$.g( _.align(name) )+"- "+ description)
    })
    console.log( cli.$$.g( _.align('version') ) +"- Display the current version tree.")
    console.log( cli.$$.g( _.align('help') ) +"- Display this help text.")
  },  

  /**
   * Resolves the provided path, properly handling the ~ if present
   */
  osPath : function(pathString) {
    if (pathString.substr(0,1) === '~')
      pathString = process.env.HOME + pathString.substr(1)
    return path.resolve(pathString)
  },

  /**
   * Takes a directory and finds all the git repos within it. 
   * MaxDepth is coming soon!
   */
  gitTree : function(dir, maxDepth) {
    var repos = []
    var files = fs.readdirSync(path.resolve(dir))
    _.each(files, function(file) {
      // @todo: Bring in osPath() function in mixins from rex-utils
      var filePath = path.resolve(dir + path.sep + file)
      if(_.contains(['.DS_Store'], file))
        return false
      var stat = fs.statSync( filePath ) 
      if(stat.isDirectory()) {
        if( fs.existsSync( path.resolve(filePath+"/.git") ) )
          repos.push( filePath )
      }
      if( file == ".git" ) {
        repos.push( dir )
      }
    })
    return repos
  },

  /**
   * Combined with the npm module, this parses and returns an array of currently installed
   *   dependencies and their versions.
   * @param  {Object} dependencies NPM.ls Lite output
   */
  dependencyVersions : function(dependencies) {
    var versions = {}
    _.each(dependencies, function(meta, name) {
      // cli("Parsing dependency: ", name, meta.version )
      versions[name] = meta.version
    })
    return versions
  },

  /**
   * Format all console output so that it lines up properly and removes the stupidness.
   * @param  {String} string The text that needs to be formatted
   * @param  {Integer} width  The number of characters wide to make the string
   * @return {String}        The space-padded formatted string.
   */
  align : function(string, width) {
    string = "  "+ string
    width = width || 12
    while( string.length < width )
      string += " "
    return string
  },

  /**
   * Determine if the user is on Windows and stop them before they do something awful.
   * This is mostly for Git commands so far, but it will branch out quickly and surely.
   */
  killWindows : function() {
    if(process.platform == 'win32') {
      cli.error("Sorry, I haven't implemented Windows support for this operation yet. Soon, I promise!")
      process.exit(1)
    }
  }

})

exports._ = _