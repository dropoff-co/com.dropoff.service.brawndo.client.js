require 'net/http'
require 'json'
require_relative 'lib/signing'
require_relative 'lib/order'

class Brawndo
  def order
    @order
  end

  def initialize(params)
    @public_key   = params['public_key']
    @private_key  = params['private_key']
    @hasher_url   = params['hasher_url']
    @host         = params['host']
    @api_url      = params['api_url']
    @order        = Order.new(params)
  end

  def info()
    info_uri = URI(@api_url + '/info')
    request = Net::HTTP::Get.new(info_uri)

    signing_params = {};
    signing_params['request'] = request
    signing_params['method'] = 'GET'
    signing_params['path'] = info_uri.path
    signing_params['query'] = info_uri.query
    signing_params['resource'] = 'info'
    signing_params['private_key'] = @private_key
    signing_params['public_key'] = @public_key

    Signing.sign(signing_params)

    response = Net::HTTP.start(info_uri.hostname, info_uri.port) {|http|
      http.request(request)
    }

    info_data = {}

    if response.code == "200"
      info_data = JSON.parse(response.body)
    end

    info_data
  end
end