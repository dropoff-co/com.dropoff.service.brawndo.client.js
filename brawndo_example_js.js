'use strict';

const brawndo = require('./brawndo');

brawndo.configure({
  host: 'localhost:9094',
  api_url : 'http://localhost:9094/v1',                                                      // required
  public_key : '4ee8515f32be9537f3e66613323d9493ccbf61a7634c3863f05aa2298f6f3fe2',  // required
  private_key : '6c6c4a8e0e9c4b28e3f5e9e41185286ca2283fb5b3bcb44e3354b5d55330f495'        // either this or hasher_url
//  hasher_url : 'http://www.myserver.com/api/do_hash'  // either this or private_key
});

// brawndo.configure({
//   host: 'qa-brawndo.dropoff.com',
//   api_url : 'https://qa-brawndo.dropoff.com/v1',                                                      // required
//   public_key : '4b3d8380de6ef6e1332da27a83a30e789118bf5d4b15a7d90648a1ae475ead74',  // required
//   private_key : '7d098381cd14868e2331a0e5d5562949d1a98bced24cbf431467d0ef28f2208a'        // either this or hasher_url
// //  hasher_url : 'http://www.myserver.com/api/do_hash'  // either this or private_key
// });

// brawndo.configure({
//   host: 'sandbox-brawndo.dropoff.com',
//   api_url : 'https://sandbox-brawndo.dropoff.com/v1',                                                      // required
//   public_key : '362050195cb91ec1a99b0f7cdf9e6c767a85c5a50dd3da166e120f2cd0f17dcb',  // required
//   private_key : '46c2c28c3b1c3185950fc528486f48e2b3d7e91d3b80462e3d67e5bdf855fe09'        // either this or hasher_url
// //  hasher_url : 'http://www.myserver.com/api/do_hash'  // either this or private_key
// });

// enterprise
// brawndo.configure({
//   host: 'localhost:9094',
//   api_url : 'http://localhost:9094/v1',                                                      // required
//   public_key : '7e4b41400754b266fcc6004b00013373a14e7e84bc3f7ae9c3326c2c09491807',  // required
//   private_key : '51a5a020d81916d71c58a29257d4c7cc0e11ba42a52481a3b2d7d627195489ee'        // either this or hasher_url
// //  hasher_url : 'http://www.myserver.com/api/do_hash'  // either this or private_key
// });

brawndo.info((err, data) => {
  if (err) {
    console.error('what is the err: ', err);
  } else if (data) {
    console.log('what is the data: ', data);
  }
});

// fe81ddc33df4b99e29010bf161b637cd
// brawndo.order.properties({company_id: 'c46e6081ed854c7a697198a85ff100bd'}, (err, data) => {
//   console.error('properties: ', err);
//   console.error('properties data: ', data);
// });

brawndo.order.driver_actions_meta((err, data) => {
  if (err) {
    console.error('error driver_actions meta: ', err);
  } else if (data) {
    console.log('driver_actions meta: ', data);
  }
});

let origin = {
  address_line_1 : '117 San Jacinto Blvd',  // required
  company_name : 'Gus\'s Fried Chicken',    // required
  first_name : 'Napoleon',                  // required
  last_name : 'Bonner',                     // required
  phone : '5124744877',                     // required
  email : 'orders@gussfriedchicken.com',    // required
  city : 'Austin',                          // required
  state : 'TX',                             // required
  zip : '78701',                            // required
  lat : '30.263706',                        // required
  lng : '-97.741703',                       // required
  remarks : 'Be nice to napoleon',          // optional
  phone : 5555555555,                       // optional
  // driver_actions : "1100,1300",
};

let destination = {
  address_line_1 : '800 Brazos Street',     // required
  address_line_2 : '250',                   // optional
  company_name : 'Dropoff Inc.',            // required
  first_name : 'Algis',                     // required
  last_name : 'Woss',                       // required
  phone : '8444376763',                     // required
  email : 'deliveries@blah.com',         // required
  city : 'Austin',                          // required
  state : 'TX',                             // required
  zip : '78701',                            // required
  lat : '30.269967',                        // required
  lng : '-97.740838',                    // required
  phone : '555-555-5555',                   //optional
  driver_actions : "2300,2500,2599",
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
estimate_params.destination = '800 Brazos Street, Austin, TX 78701, United States'; // required
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
  company_id: '7df2b0bdb418157609c0d5766fb7fb12'
}, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(data);
  }
})

// brawndo.order.read({
//   order_id: '9031c39a9262f9cf0f0b029e89c0a568'
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