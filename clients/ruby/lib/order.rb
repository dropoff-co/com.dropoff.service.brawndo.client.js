require 'net/http'
require 'json'

require_relative 'signing'
require_relative 'tip'

class Order
  def tip
    @tip
  end

  def initialize(params)
    @public_key   = params['public_key']
    @private_key  = params['private_key']
    @hasher_url   = params['hasher_url']
    @host         = params['host']
    @api_url      = params['api_url']
    @tip          = Tip.new(params)
  end

  def create(params)
    order_uri = URI(@api_url + '/order')

    request = Net::HTTP::Post.new(order_uri)
    request['Content-Type'] = 'application/json'

    if params['company_id']
      qry = {}
      qry['company_id'] = params['company_id']
      order_uri.query = URI.encode_www_form(qry)
      params.delete('company_id')
    end

    request.body = params.to_json

    signing_params = Signing.generate_signing_params(request,
                                                     'POST',
                                                     'order',
                                                     order_uri,
                                                     @private_key,
                                                     @public_key)
    Signing.sign(signing_params)

    response = Net::HTTP.start(order_uri.hostname, order_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

  def read(params)
    order_uri = nil
    signing_params = {}

    # Get one order
    if params['order_id']
      order_uri = URI(@api_url + '/order/' + params['order_id'])
      if params['company_id']
        qry = {}
        qry['company_id'] = params['company_id']
        order_uri.query = URI.encode_www_form(qry)
      end
    # Get a page of orders starting at last_key
    elsif params['last_key']
      order_uri = URI(@api_url + '/order')
      qry = {}
      qry['last_key'] = params['last_key']
      if params['company_id']
        qry['company_id'] = params['company_id']
      end
      order_uri.query = URI.encode_www_form(qry)
    # Get the first page of orders
    else
      order_uri = URI(@api_url + '/order')
      if params['company_id']
        qry = {}
        qry['company_id'] = params['company_id']
        order_uri.query = URI.encode_www_form(qry)
      end
    end

    request = Net::HTTP::Get.new(order_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'GET',
                                                     'order',
                                                     order_uri,
                                                     @private_key,
                                                     @public_key)
    Signing.sign(signing_params)

    response = Net::HTTP.start(order_uri.hostname, order_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

  def estimate(params)
    params['origin'] || raise('Missing origin paramter')
    params['destination'] || raise('Missing destination paramter')

    estimate_uri = URI(@api_url + '/estimate')
    estimate_uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(estimate_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'GET',
                                                     'estimate',
                                                     estimate_uri,
                                                     @private_key,
                                                     @public_key)

    Signing.sign(signing_params)

    response = Net::HTTP.start(estimate_uri.hostname, estimate_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

  def cancel(params)
    order_id = nil
    company_id = nil

    if params.instance_of? String
      order_id = params
    end

    if params.instance_of? Object
      order_id = params['order_id']
      company_id = params['company_id']
    end

    order_id || raise('Missing order_id to cancel')

    cancel_uri = URI(@api_url + '/order/' + order_id + '/cancel')

    if company_id
      qry = {}
      qry['company_id'] = company_id
      cancel_uri.query = URI.encode_www_form(qry)
    end

    request = Net::HTTP::Post.new(cancel_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'POST',
                                                     'order',
                                                     cancel_uri,
                                                     @private_key,
                                                     @public_key)

    Signing.sign(signing_params)

    response = Net::HTTP.start(cancel_uri.hostname, cancel_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

  def simulate(market)
    market || raise('Missing market parameter')

    simulation_uri = URI(@api_url + '/order/simulate/' + market)
    simulation_uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(simulation_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'GET',
                                                     'order',
                                                     simulation_uri,
                                                     @private_key,
                                                     @public_key)

    Signing.sign(signing_params)

    response = Net::HTTP.start(simulation_uri.hostname, simulation_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end
end