var _ = require('lodash');
var debug = require('debug')('sanji:openapi:mock');
var express = require('express');
var middleware = require('swagger-express-middleware');
var resolveRefs = require('json-refs').resolveRefs;
var YAML = require('js-yaml');
var fs = require('fs');
var joinPath = require('path').join;

var app = express();
var defaultOptions = {
  host: '0.0.0.0',
  port: process.env.PORT || 8000,
  filename: 'index.yaml'
};

var aggregate = function(data) {
  if (_.isArray(data)) {
    var obj = {}
    data.forEach(function(v) {
      _.merge(obj, v);
    });
    data = obj;
  }
  return data;
}

var injectMockResponse = function (results, options) {

  return function(req, res, next) {

    const method = _.lowerCase(req.method);
    const pathObj = results.resolved.paths;
    const paths = Object.keys(pathObj);
    const basePath = results.resolved.basePath;

    if (method === 'delete') {
      return res.json(req.body);
    }

    for (const path of paths) {
      // for example, /network/interfaces/{id} to /network/interfaces/([^/])
      let replacedPath = path.replace(/{.+}/, '([^/]+)');
      if (basePath) {
        replacedPath = joinPath(basePath, replacedPath);
      }
      const matchRoute = new RegExp(`^${replacedPath}$$`).test(req.path);

      if (matchRoute) {
        const example = _.get(pathObj, `${path}.${method}.responses.${res.statusCode}.examples.['application/json']`);

        if (! example) {
          return next();
        }

        const shouldOverrideResponse = _.get(pathObj, `${path}.${method}.responses.${res.statusCode}.examples.['x-override-response']`);

        if ((method === 'put') && shouldOverrideResponse) {
          return res.json(Object.assign({}, example, req.body));
        }

        if ((method === 'post') && (typeof example.id === 'number')) {
          return res.json(Object.assign({}, example, {id: _.random(1, Number.MAX_SAFE_INTEGER)}));
        }
        return res.json(example);
      }
    }
    next();
  }
}

var createMockServer = function(options, cb) {

  options = _.defaults(options, defaultOptions);

  var doc = YAML.load(
    fs.readFileSync(options.rootFolderPath + '/' + options.filename).toString());

  var resolveOptions = {
    relativeBase: options.rootFolderPath,
    loaderOptions: {
      processContent: function (content, cb) {
        return cb(null, YAML.safeLoad(content.text));
      }
    }
  };

  return new Promise((resolve, reject) => {

  resolveRefs(doc, resolveOptions)
    .then(function (results) {

      results.resolved.paths = aggregate(results.resolved.paths);
      results.resolved.definitions = aggregate(results.resolved.definitions);

      app.use((req, res, next) => {

        if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Credentials', true);
          res.header('Access-Control-Allow-Origin', req.headers.origin);
          res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
          res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Authorization, mx-api-token, Content-Type, Accept');
          return res.status(200).end();
        }
        next();
      });

      app.get('/favicon.ico', function(req, res) {
        res.status(404);
      });

      app.get('/', function(req, res) {
        res.json(results.resolved);
      });

      middleware(results.resolved, app, function(err, middleware) {
        app.use(
          middleware.metadata(),
          middleware.CORS(),
          middleware.parseRequest(),
          middleware.validateRequest(),
          injectMockResponse(results, options),
          middleware.mock()
        );

        const server = app.listen(options.port, function() {
          debug('Visit http://%s:%d', options.host, options.port);
          if (typeof cb === 'function') {
            cb();
          }
        });
        resolve({app, server});
      });
    })
    .catch(function(err) {
      debug(err);
      if (typeof cb === 'function') {
        cb(err);
      }
      reject(err);
    });
  });
}

module.exports =  createMockServer;
