require_relative('signing')

class Tip
  def initialize(params)
    @public_key   = params['public_key']
    @private_key  = params['private_key']
    @hasher_url   = params['hasher_url']
    @host         = params['host']
    @api_url      = params['api_url']
  end

  def create(params)
    order_id = params['order_id']
    amount = params['amount']
    company_id = params['company_id']

    order_id || raise('Missing order_id to cancel')
    amount || raise('Missing amount to cancel')

    tip_uri = URI("#{@api_url}/order/#{order_id}/tip/#{amount}")

    if company_id
      qry = {}
      qry['company_id'] = company_id
      tip_uri.query = URI.encode_www_form(qry)
    end

    request = Net::HTTP::Post.new(tip_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'POST',
                                                     'order',
                                                     tip_uri,
                                                     @private_key,
                                                     @public_key)

    Signing.sign(signing_params)

    response = Net::HTTP.start(tip_uri.hostname, tip_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

  def read(params)
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

    tip_uri = URI(@api_url + '/order/' + order_id + '/tip')

    if company_id
      qry = {}
      qry['company_id'] = company_id
      tip_uri.query = URI.encode_www_form(qry)
    end

    request = Net::HTTP::Get.new(tip_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'GET',
                                                     'order',
                                                     tip_uri,
                                                     @private_key,
                                                     @public_key)

    Signing.sign(signing_params)

    response = Net::HTTP.start(tip_uri.hostname, tip_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

  def delete(params)
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

    tip_uri = URI(@api_url + '/order/' + order_id + '/tip')

    if company_id
      qry = {}
      qry['company_id'] = company_id
      tip_uri.query = URI.encode_www_form(qry)
    end

    request = Net::HTTP::Delete.new(tip_uri)

    signing_params = Signing.generate_signing_params(request,
                                                     'DELETE',
                                                     'order',
                                                     tip_uri,
                                                     @private_key,
                                                     @public_key)

    Signing.sign(signing_params)

    response = Net::HTTP.start(tip_uri.hostname, tip_uri.port) {|http|
      http.request(request)
    }

    JSON.parse(response.body)
  end

end