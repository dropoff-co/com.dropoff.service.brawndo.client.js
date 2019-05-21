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
var host = void(0);

var API_ESTIMATE_PATH = '/estimate';
var API_INFO_PATH = '/info';
var API_ORDER_PATH = '/order';

var API_ESTIMATE_URL = void(0);
var API_INFO_URL = void(0);
var API_ORDER_URL = void(0);

module.exports.TEMPERATURES = {
  NA: 0,
  AMBIENT: 100,
  REFRIGERATED: 200,
  FROZEN: 300
};

module.exports.CONTAINERS = {
  NA: 0,
  BAG: 100,
  BOX: 200,
  TRAY: 300,
  PALLET: 400,
  BARREL: 500,
  BASKET: 600,
  BUCKET: 700,
  CARTON: 800,
  CASE: 900,
  COOLER: 1000,
  CRATE: 1100,
  TOTE: 1200
};

var signing_mw = function(path, callback) {
  return function(sa_request) {
    var timestamp = signing.generateXDropoffDate().x_dropoff_date;

    sa_request.set('X-Dropoff-Date', timestamp);

    var headers = sa_request._header;
    var headers_size = headers ? Object.keys(headers).length : 0;
    var req_header = sa_request.header;
    var req_header_size = req_header ? Object.keys(req_header).length : 0;

    if ((!headers || headers_size === 0) && req_header && req_header_size > 0) {
      headers = req_header;
    } else if (!headers || headers_size === 0) {
      headers = {};
      headers['x-dropoff-date'] = sa_request.get('X-Dropoff-Date');
      headers.accept = sa_request.get('Accept');
    }

    var params = {
      method : sa_request.method,
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
    } else if (sa_request.get('user-agent')) {
      headers['user-agent'] = sa_request.get('user-agent');
      params.signed_headers.push('user-agent');
    }

    if (host) {
      headers.host = host;
      params.signed_headers.push('host');
    } else if (typeof document !== 'undefined' && document.location && document.location.host) {
      headers.host = document.location.host;
      params.signed_headers.push('host');
    } else if (sa_request.get('user-agent')) {
      headers.host = sa_request.get('host');
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
          sa_request.set('Authorization', data);
          sa_request.end(callback);
        }
      });
    }

    return sa_request;
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
  if (!params.public_key || !(params.private_key || params.hasher_url) || !params.api_url || !params.host) {
    throw new Error('Set the public key, private key or hasher_url, host, and api url');
  }
  public_key  = params.public_key;
  private_key = params.private_key;
  hasher_url  = params.hasher_url;
  host = params.host;
  var api_url = params.api_url;

  if (api_url.indexOf('/') === (api_url.length - 1)) {
    api_url = api_url.substring(0, (api_url.length - 1));
  }

  API_ESTIMATE_URL = api_url + API_ESTIMATE_PATH;
  API_INFO_URL = api_url + API_INFO_PATH;
  API_ORDER_URL = api_url + API_ORDER_PATH;
  configured = true;
};

module.exports.info = function(callback) {
  request
    .get(API_INFO_URL)
    .set('Accept', 'application/json')
    .use(signing_mw(API_INFO_PATH, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order = {
  tip : {}
};

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
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.create = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  var req = request.post(API_ORDER_URL);

  if (params.company_id) {
    req = req.query({
      company_id : params.company_id
    });
    delete params.company_id;
  }

  req
    .set('Accept', 'application/json')
    .send(params)
    .use(signing_mw(API_ORDER_PATH, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.cancel = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }
  var order_id = params;

  var req = void(0);

  if (params.company_id && params.order_id) {
    order_id = params.order_id;
    req = request
      .post(API_ORDER_URL + '/' + order_id + '/cancel')
      .query({
        company_id : params.company_id
      });
  } else {
    req = request
      .post(API_ORDER_URL + '/' + order_id + '/cancel');
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/' + order_id + '/cancel', function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.properties = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  var req = void(0);

  if (params && params.company_id) {
    req = request
      .get(API_ORDER_URL + '/properties')
      .query({
        company_id : params.company_id
      });
  } else {
    req = request
      .get(API_ORDER_URL + '/properties');
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/properties', function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.driver_actions_meta = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  var req = void(0);

  if (params && params.company_id) {
    req = request
      .get(API_ORDER_URL + '/driver_actions_meta')
      .query({
        company_id : params.company_id
      });
  } else {
    req = request
      .get(API_ORDER_URL + '/driver_actions_meta');
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/driver_actions_meta', function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.driver_actions = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  var req = void(0);

  if (params && params.company_id) {
    req = request
      .get(API_ORDER_URL + '/driver_actions')
      .query({
        company_id : params.company_id
      });
  } else {
    req = request
      .get(API_ORDER_URL + '/driver_actions');
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/driver_actions', function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};


module.exports.order.items = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  var req = void(0);

  if (params && params.company_id) {
    req = request
      .get(API_ORDER_URL + '/items')
      .query({
        company_id : params.company_id
      });
  } else {
    req = request
      .get(API_ORDER_URL + '/items');
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/items', function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.signature = function(params, callback) {
  if (!configured) {
    throw new Error('Call configure before calling the api');
  }

  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  if (!params.order_id) {
    throw new Error('Call requires order_id');
  }

  var req = void(0);

  if (params && params.company_id) {
    req = request
      .get(API_ORDER_URL + '/signature/' + params.order_id)
      .query({
        company_id : params.company_id
      });
  } else {
    req = request
      .get(API_ORDER_URL + '/signature/' + params.order_id);
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/signature/' + params.order_id, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.tip.create = function(params, callback) {
  if (!params.order_id || !params.amount) {
    throw new Error('Call requires order_id and amount parameters');
  }

  var tip_url = API_ORDER_URL + '/' + params.order_id + '/tip/' + params.amount;
  var tip_path = API_ORDER_PATH + '/' + params.order_id + '/tip/' + params.amount;

  var req = request.post(tip_url);

  if (params.company_id) {
    req = req.query({
      company_id : params.company_id
    });
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(tip_path, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.tip.read = function(params, callback) {
  if (!order_id) {
    throw new Error('Call requires order_id');
  }

  var order_id = params;

  if (params.order_id && params.company_id) {
    order_id = params.order_id;
  }

  var tip_url = API_ORDER_URL + '/' + order_id + '/tip';
  var tip_path = API_ORDER_PATH + '/' + order_id + '/tip';

  var req = request.get(tip_url);

  if (params.company_id) {
    req = req.query({
      company_id : params.company_id
    });
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(tip_path, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

module.exports.order.tip.delete = function(params, callback) {
  if (!order_id) {
    throw new Error('Call requires order_id');
  }

  var order_id = params;

  if (params.order_id && params.company_id) {
    order_id = params.order_id;
  }

  var tip_url = API_ORDER_URL + '/' + order_id + '/tip';
  var tip_path = API_ORDER_PATH + '/' + order_id + '/tip';

  var delete_func = request.del ? request.del : request.delete;

  var req = delete_func(tip_url);

  if (params.company_id) {
    req = req.query({
      company_id : params.company_id
    });
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(tip_path, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

var getOrders = function(company_id, callback) {
  var req = request.get(API_ORDER_URL);

  if (company_id) {
    req.query({
      company_id : company_id
    });
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH, function (error, response) {
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

var getOrdersFrom = function(last_key, company_id, callback) {
  var query = { last_key : last_key };

  if (company_id) {
    query.company_id = company_id;
  }

  request
    .get(API_ORDER_URL)
    .query(query)
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH, function(error, response){
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

var getOrder = function(order_id, company_id, callback) {
  if (!order_id) {
    throw new Error('Call requires pickup and destination query parameters');
  }

  var req = request.get(API_ORDER_URL + '/' + order_id);

  if (company_id) {
    req = req.query({
      company_id : company_id
    });
  }

  req
    .set('Accept', 'application/json')
    .use(signing_mw(API_ORDER_PATH + '/' + order_id, function(error, response) {
      if (error) {
        callback(error);
      } else if (response.status === 200 && response.body) {
        callback(void(0), response.body);
      } else {
        var error = new Error('response.status is ' + response.status);
        error.response = response;
        callback(error);
      }
    }));
};

var startSimulation = function(params, callback) {
  if (params.market) {
    var market = params.market;
    var req = request.get(API_ORDER_URL + '/simulate/' + market);

    if (params.company_id) {
      req = req.query({
        company_id : params.company_id
      });
    }

    req
      .set('Accept', 'application/json')
      .use(signing_mw(API_ORDER_PATH  + '/simulate/' + market, function(error, response) {
        if (error) {
          callback(error);
        } else if (response.status === 200 && response.body) {
          callback(void(0), response.body);
        } else {
          var error = new Error('response.status is ' + response.status);
          error.response = response;
          callback(error);
        }
      }));
  } else if (params.order_id) {
    var order_id = params.order_id;
    var req = request.get(API_ORDER_URL + '/simulate/order/' + order_id);


    if (params.company_id) {
      req = req.query({
        company_id : params.company_id
      });
    }

    req
      .set('Accept', 'application/json')
      .use(signing_mw(API_ORDER_PATH  + '/simulate/order/' + order_id, function(error, response) {
        if (error) {
          callback(error);
        } else if (response.status === 200 && response.body) {
          callback(void(0), response.body);
        } else {
          var error = new Error('response.status is ' + response.status);
          error.response = response;
          callback(error);
        }
      }));
  } else {
    callback(new Error('Call requires you to specify a market (ie. austin or houston), or a valid order id'));
  }
};

module.exports.order.read = function(params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  if (params.order_id) {
    getOrder(params.order_id, params.company_id, callback);
  } else if (params.last_key) {
    getOrdersFrom(params.last_key, params.company_id, callback);
  } else {
    getOrders(params.company_id, callback);
  }
};

module.exports.order.simulate = function(params, callback) {
  startSimulation(params, callback);
};
