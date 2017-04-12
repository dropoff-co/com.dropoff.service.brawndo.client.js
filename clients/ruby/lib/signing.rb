require 'openssl'

def do_hmac(data, key)
  digest = OpenSSL::Digest.new('sha512')
  OpenSSL::HMAC.hexdigest(digest, key, data)
end

module Signing
  def self.generate_signing_params(request, method, resource, uri, private_key, public_key)
    signing_params = {}
    signing_params['request'] = request
    signing_params['method'] = method
    signing_params['resource'] = resource
    signing_params['path'] = uri.path
    signing_params['query'] = uri.query
    signing_params['private_key'] = private_key
    signing_params['public_key'] = public_key
    signing_params
  end

  def self.generate_x_dropoff_date
    data = {}
    now = Time.now
    values = now.to_a
    now = Time.utc(*values)

    data['x_dropoff_date_key'] = now.strftime('%Y%m%d')
    data['x_dropoff_date'] = data['x_dropoff_date_key'] +
        'T' + now.strftime('%H%M%S') + 'Z'
    data
  end

  def self.create_hash(hash_params)
    canonical_string    = hash_params['canonical_string']
    private_key         = hash_params['private_key']
    resource            = hash_params['resource']
    x_dropoff_date      = hash_params['x_dropoff_date']
    x_dropoff_date_key  = hash_params['x_dropoff_date_key']

    string_to_sign = "HMAC-SHA512\n" + x_dropoff_date + "\n" + resource + "\n" + do_hmac(canonical_string, private_key)
    intermediate_key = do_hmac(x_dropoff_date_key, 'dropoff' + private_key)
    intermediate_key = do_hmac(resource, intermediate_key)
    do_hmac(string_to_sign, intermediate_key)
  end

  def self.sign(signing_params)
    request = signing_params['request']
    x_dropoff_date_data = self.generate_x_dropoff_date

    request['X-Dropoff-Date'] = '    ' + x_dropoff_date_data['x_dropoff_date']
    request['Accept'] = 'application/json'
    #request.add_field('User-Agent', 'brawndo-ruby-client')

    path = signing_params['path']
    path_index = path.index('/v1')

    if path_index == 0
      path = path[3..-1]
    end

    #Method and Path
    canonical_string = ''
    canonical_string += signing_params['method'].upcase
    canonical_string += "\n"
    canonical_string += path
    canonical_string += "\n"

    #Query
    if signing_params['query']
    end

    canonical_string += "\n"

    #Headers
    header_keys = []
    sorted_headers = []
    request.each_name {|key| sorted_headers.push(key) }
    sorted_headers = sorted_headers.sort()
    if sorted_headers.empty? == false
      sorted_headers.each { |key|
        value = request[key];
        value.strip!
        canonical_string += key + ':' + value
        canonical_string += "\n"
        header_keys.push(key)
      }
    end

    canonical_string += "\n"

    if header_keys.empty? == false
      canonical_string += (header_keys * ';')
    end

    canonical_string += "\n"

    hash_params = {}
    hash_params['canonical_string'] = canonical_string
    hash_params['resource'] = signing_params['resource']
    hash_params['private_key'] = signing_params['private_key']
    hash_params['x_dropoff_date'] = x_dropoff_date_data['x_dropoff_date']
    hash_params['x_dropoff_date_key'] = x_dropoff_date_data['x_dropoff_date_key']

    signature = self.create_hash(hash_params)

    signature = 'Authorization: HMAC-SHA512 Credential=' + signing_params['public_key'] +
                ',SignedHeaders=' + (header_keys * ';') + ',Signature=' + signature

    request['Authorization'] = signature
  end
end
