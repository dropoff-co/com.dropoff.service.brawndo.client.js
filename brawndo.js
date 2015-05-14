'use strict';
/**
 * Created by alwoss on 2/27/15.
 */
var request = require('superagent');

var signing = require('./signing');

var configured = false;

var public_key = void(0);
var private_key = void(0);
var hasher_url = void(0);

var API_INFO_PATH = '/info';
var API_ESTIMATE_PATH = '/estimate';
var API_ORDER_PATH = '/order';

var API_INFO_URL = void(0);
var API_ESTIMATE_URL = void(0);
var API_ORDER_URL = void(0);

var signing_mw = function(path, callback) {
  return function(request) {
    var timestamp = signing.generateXDropoffDate().x_dropoff_date;

    request.set('X-Dropoff-Date', timestamp);

    var headers = request._header;
    var headers_size = headers ? Object.keys(headers).length : 0;
    var req_header = request.header;
    var req_header_size = req_header ? Object.keys(req_header).length : 0;

    if ((!headers || headers_size === 0) && req_header && req_header_size > 0) {
      headers = req_header;
    } else if (!headers || headers_size === 0) {
      headers = {};
      headers['x-dropoff-date'] = request.get('X-Dropoff-Date');
      headers.accept = request.get('Accept');
    }

    var params = {
      method : request.method,
      return_as_auth_header : true,
      public_key : public_key,
      private_key : private_key,
      hasher_url : hasher_url,
      headers : headers,
      signed_headers : Object.keys(headers),
      path : path
    };

    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      headers['user-agent'] = navigator.userAgent;
      params.signed_headers.push('user-agent');
    } else if (request.get('user-agent')) {
      headers['user-agent'] = request.get('user-agent');
      params.signed_headers.push('user-agent');
    }

    if (typeof document !== 'undefined' && document.location && document.location.host) {
      headers.host = document.location.host;
      params.signed_headers.push('host');
    } else if (request.get('user-agent')) {
      headers.host = request.get('host');
      params.signed_headers.push('host');
    }

    if (typeof document !== 'undefined' && document.location && document.location.href) {
      headers.referer = document.location.href;
      params.signed_headers.push('referer');
    }

    if (callback) {
      signing.sign(params, function(error, data) {
        if (error) {
          callback(error);
        } else {
          request.set('Authorization', data);
          request.end(callback);
        }
      });
    }

    return request;
  };
};

module.exports.createHash = function(params) {
  return signing.createHash(params);
};

module.exports.getConfiguration = function() {
  return {
    public_key : public_key,
    private_key : private_key,
    hasher_url  : hasher_url
  };
};

module.exports.configure = function(params) {
  if (!params.public_key || !(params.private_key || params.hasher_url) || !params.api_url) {
    throw new Error('Set the public key, private key or hasher_url, and api url');
  }
  public_key  = params.public_key;
  private_key = params.private_key;
  hasher_url  = params.hasher_url;
  var api_url = params.api_url;

  if (api_url.indexOf('/') === (api_url.length - 1)) {
    api_url = api_url.substring(0, (api_url.length-1));
  }
  API_INFO_URL = api_url + API_INFO_PATH;
  API_ESTIMATE_URL = api_url + API_ESTIMATE_PATH;
  API_ORDER_URL = api_url + API_ORDER_PATH;
  configured = true;
};

module.exports.order = {};

module.exports.order.estimate = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  if (!params.origin || !params.destination) {
    throw new Error('Call requires pickup and destination query parameters');
  }

  request
    .get(API_ESTIMATE_URL)
    .set('Accept', 'application/json')
    .query(params)
    .use(signing_mw(API_ESTIMATE_PATH, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        callback(new Error('response.status is ' + response.status), response.body);
      }
    }));
};

module.exports.order.create = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }
  request
    .post(API_ORDER_URL)
    .set('Accept', 'application/json')
    .send(params)
    .use(signing_mw(API_ORDER_PATH, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        callback(new Error('response.status is ' + response.status), response.body);
      }
    }));
};


var getOrders = function(callback) {
  request
    .get(API_ORDER_URL)
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH, function (error, response) {
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        callback(new Error('response.status is ' + response.status), response.body);
      }
    }));
};

var getOrdersFrom = function(last_key, callback) {
  request
    .get(API_ORDER_URL)
    .query({ last_key : last_key })
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        callback(new Error('response.status is ' + response.status), response.body);
      }
    }));
};

var getOrder = function(order_id, callback) {
  if (!order_id) {
    throw new Error('Call requires pickup and destination query parameters');
  }

  request
    .get(API_ORDER_URL + '/' + order_id)
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/' + order_id, function(error, response) {
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        callback(new Error('response.status is ' + response.status), response.body);
      }
    }));
};

var startSimulation = function(market, callback) {
  if (!market) {
    throw new Error('Call requires you to specify a market (ie. austin or houston)');
  }

  request
    .get(API_ORDER_URL + '/simulate/' + market)
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH  + '/simulate/' + market, function(error, response) {
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        callback(new Error('response.status is ' + response.status), response.body);
      }
    }));

};

module.exports.order.read = function(params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  if (params.order_id) {
    getOrder(params.order_id, callback);
  } else if (params.last_key) {
    getOrdersFrom(params.last_key, callback);
  } else {
    getOrders(callback);
  }
};

module.exports.order.simulate = function(params, callback) {
  startSimulation(params.market, callback);
};