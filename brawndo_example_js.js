'use strict';

const brawndo = require('./brawndo');

brawndo.configure({
  host: 'sandbox-brawndo.dropoff.com',
  api_url : 'https://sandbox-brawndo.dropoff.com/v1',                                                      // required
  public_key : '',  // required
  private_key : ''        // either this or hasher_url
//  hasher_url : 'http://www.myserver.com/api/do_hash'  // either this or private_key
});

brawndo.info((err, data) => {
  if (err) {
    console.error('what is the err: ', err);
  } else if (data) {
    console.log('what is the data: ', data);
  }
});

// brawndo.order.properties({company_id: ''}, (err, data) => {
//   console.error('properties: ', err);
//   console.error('properties data: ', data);
// });

const driver_action_params = {};
driver_action_params.company_id = '';

console.log(driver_action_params);
brawndo.order.driver_actions_meta(driver_action_params, (err, data) => {
  if (err) {
    console.error('error driver_actions meta: ', err);
  } else if (data) {
    console.log('driver_actions meta: ', data);
  }
});

let origin = {
  address_line_1 : '117 San Jacinto Blvd',    // required
  company_name : 'Dropoff Javascript Origin', // required
  first_name : 'Napoleon',                    // required
  last_name : 'Bonner',                       // required
  phone : '5125555555',                       // required
  email : 'noreply+origin@dropoff.com',       // required
  city : 'Austin',                            // required
  state : 'TX',                               // required
  zip : '78701',                              // required
  lat : '30.263706',                          // required
  lng : '-97.741703',                         // required
  remarks : 'Be nice to napoleon',            // optional
  phone : 5555555555,                         // optional
  // driver_actions : "1400",                 // optional
};

let destination = {
  address_line_1 : '1601 S MoPac Expy',      // required
  address_line_2 : 'C301',                   // optional
  company_name : 'Dropoff Inc.',             // required
  first_name : 'Del',                        // required
  last_name : 'Fitzgitibit',                 // required
  phone : '5125555555',                      // required
  email : 'noreply+destination@dropoff.com', // required
  city : 'Austin',                           // required
  state : 'TX',                              // required
  zip : '78746',                             // required
  lat : '30.260228',                         // required
  lng : '-97.793359',                        // required
  // driver_actions : "2400,2500,2599",      // optional
};

let details = {
  quantity : 1,                   // required
  weight : 5,                     // required
  eta : void(0),                  // required
  distance : void(0),             // required
  price : void(0),                // required
  ready_date : (Date.now()/1000) + 10000,        // required
  type : void(0),                 // required
  reference_name : void(0),       // optional
  reference_code : void(0)        // optional
};

console.log(details.ready_date);

// exit();

let properties = [];
// let items = [
//   {
//       "sku": "128UV9",
//       "quantity": 3,
//       "weight": 10,
//       "height": 1.4,
//       "width": 1.2,
//       "depth": 2.3,
//       "unit": "ft",
//       // "container": brawndo.CONTAINERS.BOX,
//       "description": "Box of t-shirts",
//       "price": "59.99",
//       "temperature": brawndo.TEMPERATURES.NA,
//       "person_name": "T. Shirt",
//       "nested_items": [
//         {
//           "quantity": "2",  // ?
//           "height": "3",
//           "depth": 3,
//           "width": 1,
//           "unit": "ft",
//           // "container": brawndo.CONTAINERS.BAG,
//           "description": "bag in a box?",
//           "sku": "999",
//           "price": "1000",
//           "temperature": brawndo.TEMPERATURES.NA,
//           "person_name": "Bob2",
//           "pickup_barcode": "ABC123!!",
//           "dropoff_barcode": "DEFaail1"
//         }
//       ]
//   },
//   {
//       "sku": "128UV8",
//       "height": 9.4,
//       "width": 6.2,
//       "depth": 3.3,
//       "unit": "in",
//       // "container": brawndo.CONTAINERS.BAG,
//       "description": "Bag of socks",
//       "price": "9.99",
//       "temperature": brawndo.TEMPERATURES.AMBIENT,
//       "person_name": "Jim"
//   }
// ];

// console.error(items);
/*
quantity: Joi.number().integer(),
    weight: Joi.number(),

    //Dimensions
    height: Joi.number(),
    width: Joi.number(),
    depth: Joi.number(),
    unit: Joi.string().lowercase().allow(['in','ft','cm','mm','m']),

    container: Joi.number().allow(config.lineItems.IDS),
    description: Joi.string(),
    sku: Joi.string(),

    price: Joi.number(),

    //Temperature constraints
    temperature: Joi.number().integer().allow(config.temperatures.IDS),
    temperature_max: Joi.number().integer(),
    temperature_min: Joi.number().integer(),
    temperature_unit: Joi.string().allow(['F', 'C']),

    person_name: vogels.types.encrypted(config.encryption.alias.order.item), //NEVER CHANGE THIS
    */

var estimate_params = {};
estimate_params.origin = '117 San Jacinto Blvd, Austin, TX 78701, United States';  // required
estimate_params.destination = '1601 S MoPac Expy, Austin, TX 78746, United States'; // required
estimate_params.utc_offset = '-06:00'; // required

brawndo.order.estimate(estimate_params, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(data);
  }
})

brawndo.order.create({
  origin: origin,
  destination: destination,
  details: details,
  properties: properties,
  // items: items,
  company_id: ''
}, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(data);
  }
})

// brawndo.order.signature({
//   order_id: '',
//   company_id: ''
// }, (err, data) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(data);
//   }
// })

// brawndo.order.pickup_signature({
//   order_id: '',
//   company_id: ''
// }, (err, data) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(data);
//   }
// })

// brawndo.order.read({
//   order_id: ''
// }, (err, data) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.error(data);
//   }
// })

// brawndo.order.items( (err, data) => {
//   if (err) {
//     console.error('Err: ', err);
//   } else {
//     console.log('items: ', data);
//   }
// })