require_relative '../brawndo'

config = {}
config['public_key'] = 'b2a38747596b36df857714081c66665f8f070ecd2c7849342ce051c502a99323'
config['private_key'] = '529594c117e11a8cd3058633bc89a061135b18416258c7c7dd57a8075a306a28'
config['api_url'] = 'https://sandbox-brawndo.dropoff.com/v1'
config['host'] = 'sandbox-brawndo.dropoff.com'

duration = 5

brawndo = Brawndo.new(config)

info_data = brawndo.info()

p info_data
