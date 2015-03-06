'use strict';
/**
 * Created by alwoss on 2/27/15.
 */
var async         = require('async');
var request       = require('superagent');
var CryptoJS      = { enc : {} };

CryptoJS.HmacSHA512  = require('crypto-js/hmac-sha512');
CryptoJS.enc.Hex     = require('crypto-js/enc-hex');

var NO_ERROR  = void(0);
var DONE      = 'DONE';
var NOOP      = 'NOOP';

var isServer  = true;

var validateParams = function(params) {
  return (
  (params.private_key || params.hasher_url) &&
  params.method &&
  params.path &&
  params.headers &&
  (params.signed_headers && params.signed_headers.length > 0) &&
  params.headers['x-dropoff-date']);
};

var doHmac = function(message, key) {
  var hash = CryptoJS.HmacSHA512(message, key);
  return hash.toString(CryptoJS.enc.Hex);
};

var doPrependZero = function(value) {
  if (value < 10) {
    value = '0' + value;
  }
  return '' + value;
};

module.exports.generateXDropoffDate = function() {
  var timestamp = new Date();

  var x_dropoff_date_key = timestamp.getUTCFullYear() + doPrependZero((timestamp.getUTCMonth() + 1)) + doPrependZero(timestamp.getUTCDate());
  var x_dropoff_date = x_dropoff_date_key + 'T' + doPrependZero(timestamp.getUTCHours()) + doPrependZero(timestamp.getUTCMinutes()) + doPrependZero(timestamp.getUTCSeconds()) + 'Z';

  return {
    x_dropoff_date : x_dropoff_date,
    x_dropoff_date_key : x_dropoff_date_key
  };
};

module.exports.createHash = function(params) {
  var canonical_string    = params.canonical_string;
  var private_key         = params.private_key;
  var resource            = params.resource;
  var x_dropoff_date      = params.x_dropoff_date;
  var x_dropoff_date_key  = params.x_dropoff_date_key;

  var string_to_sign = 'HMAC-SHA512\n' + x_dropoff_date + '\n' + resource + '\n' + doHmac(canonical_string, private_key);
  var intermediate_key = doHmac(x_dropoff_date_key, 'dropoff' + private_key);
  intermediate_key = doHmac(resource, intermediate_key);
  return doHmac(string_to_sign, intermediate_key);
};

module.exports.sign = function(params, callback) {
  var signature;
  var index                 = 0;
  var canonical_request     = isServer ? new Buffer(8192) : '';
  var resource              = void(0);
  var x_dropoff_date        = void(0);
  var x_dropoff_date_key    = void(0);

  var doWrite = function(data) {
    if (isServer) {
      index = index + canonical_request.write(data, index, 'utf-8');
    } else {
      canonical_request += data;
      index = canonical_request.length;
    }
  };

  var canonicalRequestToString = function() {
    if (isServer) {
      return canonical_request.toString('utf-8', 0, index);
    } else {
      return canonical_request;
    }
  };

  var doValidateParams = function(cb) {
    if (validateParams(params)) {
      x_dropoff_date = params.headers['x-dropoff-date'];
      x_dropoff_date_key = x_dropoff_date.substring(0, 8);

      var transformed_headers = {};
      for (var key in params.headers) {
        if (params.headers.hasOwnProperty(key)) {
          transformed_headers[key.toLowerCase()] = params.headers[key];
        }
      }
      params.headers = transformed_headers;

      var transformed_signed_headers = [];
      params.signed_headers.forEach(function(value) {
        transformed_signed_headers.push(value.toLowerCase());
      });
      params.signed_headers = transformed_signed_headers;

      cb(NO_ERROR, DONE);
    } else {
      cb(new Error('Expected private_key, method, url, headers, and signed_headers in params.  query is optional.'));
    }
  };

  var writeMethodAndPathToBuffer = function(cb) {
    doWrite(params.method.toUpperCase());
    doWrite('\n', index, 'utf-8');
    var path = params.path;
    if (path && path.indexOf('?') !== -1) {
      path = path.substring(0,path.indexOf('?'));
    }
    doWrite((path ? path : '/'));
    doWrite('\n');

    if (path && path.split('/').length > 1) {
      resource = path.split('/')[1];
    }

    if (resource) {
      cb(NO_ERROR, DONE);
    } else {
      cb(new Error('No resource found in url ' + params.url));
    }
  };

  var writeQueryToBuffer = function(cb) {
    if (params.query) {
      var keys = _.keys(params.query).sort();
      var index = 0;
      _.forEach(keys, function(key) {
        doWrite((key + '=' + encodeURIComponent(params.query[key])));
        index++;
        if (index !== keys.length) {
          doWrite('&');
        }
        doWrite('\n');
      });
    }
    doWrite('\n');
    cb(NO_ERROR, DONE);
  };

  var writeHeaderToBuffer = function(cb) {
    var header_keys = void(0);
    if (params.headers && params.signed_headers) {
      header_keys = '';
      var keys = params.signed_headers.sort();
      var indx = 0;
      _.forEach(keys, function(key) {
        header_keys += key.toLowerCase();
        doWrite((key.toLowerCase() + ':' + params.headers[key].trim()));
        indx++;
        if (indx !== keys.length) {
          header_keys += ';';
        }
        doWrite('\n');
      });
    }
    doWrite('\n');
    if (header_keys) {
      doWrite(header_keys);
    }
    doWrite('\n');
    cb(NO_ERROR, DONE);
  };

  var generateSignature = function(cb) {
    var signature_params = {
      canonical_string : canonicalRequestToString(),
      resource : resource,
      x_dropoff_date : x_dropoff_date,
      x_dropoff_date_key : x_dropoff_date_key
    };

    if (params.private_key) {
      signature_params.private_key = params.private_key;
      cb(NO_ERROR, signature = module.exports.createHash(signature_params));
    } else if (params.hasher_url) {
      request
        .post(params.hasher_url)
        .send(signature_params)
        .end(function(error, response) {
          if (error) {
            cb(error);
          } if (response && response.status === 200 && response.body && response.body.signature) {
            cb(NO_ERROR, response.body.signature);
          } else {
            cb(new Error('Could not generate signature with url: ' + params.hasher_url));
          }
        });
    } else {
      cb(new Error('Not enough data to create proper signature'));
    }
  };

  var seriesHandler = function (error, results) {
    if (params.return_as_auth_header && params.public_key) {
      signature = 'Authorization: HMAC-SHA512 Credential=' + params.public_key + ',SignedHeaders=' + params.signed_headers.join(';') + ',Signature=' + signature;
    }
    callback(error, signature);
  };

  async.series({
    validate : doValidateParams,
    method_and_path : writeMethodAndPathToBuffer,
    query : writeQueryToBuffer,
    header : writeHeaderToBuffer,
    generate : generateSignature
  }, seriesHandler);
};

