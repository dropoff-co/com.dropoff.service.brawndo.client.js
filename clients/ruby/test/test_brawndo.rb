require_relative '../brawndo'

config = {}
config['public_key'] = 'user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8'
config['private_key'] = '7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482'
config['api_url'] = 'http://dev.dropoff.com:9094/v1'
config['host'] = 'dev.dropoff.com:9094'

duration = 5

brawndo = Brawndo.new(config)

info_data = brawndo.info()

p '(1.) Reading first page of orders'

order_data = brawndo.order.read({})

p order_data
sleep(duration)

last_key_params = {}
last_key_params['last_key'] = order_data['last_key']

p '(2.) Reading subsequent page of orders'

order_data = brawndo.order.read(last_key_params)

p order_data
sleep(duration)

order_id_params = {}
order_id_params['order_id'] = order_data['data'][0]['details']['order_id']

p "(3.) Reading specific order #{order_id_params['order_id']}"

order_data = brawndo.order.read(order_id_params)

p order_data
sleep(duration)

no_order_id_params = {}
no_order_id_params['order_id'] = 'zzzzz'

p '(4.) Reading order that DNE'

order_data = brawndo.order.read(no_order_id_params)

p order_data

origin = {
  'address_line_1' => '4729 Burnet Rd',        # required
  'company_name' => 'Pinthouse Pizza North',   # required
  'first_name' => 'Beer',                      # required
  'last_name' => 'Pizza',                      # required
  'phone' => '5124744877',                     # required
  'email' => 'awoss+pinthouse@dropoff.com',    # required
  'city' => 'Austin',                          # required
  'state' => 'TX',                             # required
  'zip' => '78756',                            # required
  'lat' => '30.263706',                        # required
  'lng' => '-97.741703',                       # required
  'remarks' => 'Be nice to napoleon'           # optional
}

destination = {
  'address_line_1' => '2517 Thornton Rd',      # required
  'company_name' => 'House of Algis',          # required
  'first_name' => 'Algis',                     # required
  'last_name' => 'Woss',                       # required
  'phone' => '8444376763',                     # required
  'email' => 'awoss@dropoff.com',              # required
  'city' => 'Austin',                          # required
  'state' => 'TX',                             # required
  'zip' => '78701',                            # required
  'lat' => '30.269967',                        # required
  'lng' => '-97.740838'                        # required
}

in_two_hours = Time.now.to_i + 7200

details = {
  'quantity' => 1,                   # required
  'weight' => 5,                     # required
  'eta' => '449.8',                  # required
  'distance' => '0.62',              # required
  'price' => '0.01',                 # required
  'ready_date' => in_two_hours,      # required
  'type' => 'two_hr'                 # required
}

estimate_params = {};
estimate_params['origin'] = '4729 Burnet Rd, Austin, TX 78756'
estimate_params['destination'] = '2517 Thornton Rd, Austin, TX 78704'
estimate_params['utc_offset'] = Time.now.utc_offset

p '(5.) Estimating order'
estimate_data = brawndo.order.estimate(estimate_params)

p estimate_data
sleep(duration)

details['eta'] = estimate_data['data']['ETA'];
details['distance'] = estimate_data['data']['Distance'];
details['price'] = estimate_data['data']['asap']['Price'];
details['type'] = 'asap';

p details

order_data = {
  'origin' => origin,
  'destination' => destination,
  'details' => details
}

p '(6.1) Creating new order'
p order_data

order_response_data = brawndo.order.create(order_data)

p order_response_data

order_id = order_response_data['data']['order_id']

p "(6.2) Created #{order_id}"
sleep(duration)

tip_params = {
  'order_id' => order_id,
  'amount' => 5.55
}

p "(6.3) Creating order tip #{order_id}"
tip_data = brawndo.order.tip.create(tip_params)

p tip_data
p "(6.4) Created order tip #{order_id}"
sleep(duration)


p "(6.5) Getting order tip #{order_id}"
tip_data = brawndo.order.tip.read(order_id)

p tip_data
sleep(duration)



p "(6.6) Deleting order tip #{order_id}"
tip_data = brawndo.order.tip.delete(order_id)

p tip_data
sleep(duration)


p "(6.7) Cancelling #{order_id}"
cancel_data = brawndo.order.cancel(order_id)

p cancel_data
