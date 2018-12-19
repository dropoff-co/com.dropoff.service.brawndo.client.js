'use strict';
/**
 * Created by alwoss on 3/5/15.
 */
var brawndo = require('./brawndo');

brawndo.configure({
  api_url : 'http://localhost:9094/v1',                                                      // required
  public_key : 'user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8',  // required
  private_key : '7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482'        // either this or hasher_url
//  hasher_url : 'http://www.myserver.com/api/do_hash'  // either this or private_key
});

var origin = {
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
  remarks : 'Be nice to napoleon'           // optional
};

var destination = {
  address_line_1 : '800 Brazos Street',     // required
  address_line_2 : '250',                   // optional
  company_name : 'Dropoff Inc.',            // required
  first_name : 'Algis',                     // required
  last_name : 'Woss',                       // required
  phone : '8444376763',                     // required
  email : 'deliveries@dropoff.com',         // required
  city : 'Austin',                          // required
  state : 'TX',                             // required
  zip : '78701',                            // required
  lat : '30.269967',                        // required
  lng : '-97.740838'                        // required
};

var details = {
  quantity : 1,                   // required
  weight : 5,                     // required
  eta : void(0),                  // required
  distance : void(0),             // required
  price : void(0),                // required
  type : void(0),                 // required
  ready_date : 1425578400,        // required
  reference_name : void(0),       // optional
  reference_code : void(0)        // optional
};

var estimateParameters = {
  origin : '117 San Jacinto Blvd, Austin, TX 78701, United States',   // required
  destination : '800 Brazos Street, Austin, TX 78701, United States', // required
  ready_timestamp : 1425578400,                                       // optional
  utc_offset : '-06:00'                                               // required
};

brawndo.order.estimate(estimateParameters, function(error, estimate_data) {
/*
 Example response:
 {
   success : true,
   timestamp: '2015-03-05T14:51:14+00:00',
   data : {
     "ETA": "243.1",
     "Distance": "0.62",
     "From": "78701",
     "To": "78701",
     "asap": {
       "Price": "19.00",
       "ETA": "243.1",
       "Distance": "0.62"
     },
     "two_hr": {
       "Price": "17.00",
       "ETA": "243.1",
       "Distance": "0.62"
     },
     "four_hr": {
       "Price": "15.00",
       "ETA": "243.1",
       "Distance": "0.62"
     },
     "after_hr": {
       "Price": "21.00",
       "ETA": "243.1",
       "Distance": "0.62"
     },
     "holiday": {
       "Price": "31.00",
       "ETA": "243.1",
       "Distance": "0.62"
     }
   }
 }

 */
  if (estimate_data && estimate_data.data) {
    details.eta = estimate_data.data.ETA;
    details.distance = estimate_data.data.Distance;
  }

  if (!error && estimate_data && estimate_data.data && estimate_data.data.asap) {
    details.price = estimate_data.data.asap.Price;
    details.type = 'asap';
  } else if (!error && estimate_data && estimate_data.data && estimate_data.data.two_hr) {
    details.price = estimate_data.data.two_hr.Price;
    details.type = 'two_hr';
  } else if (!error && estimate_data && estimate_data.data && estimate_data.data.four_hr) {
    details.price = estimate_data.data.four_hr.Price;
    details.type = 'four_hr';
  } else {
    console.log(error);
    console.log(estimate_data);
  }

  let items = [
    {
        "sku": "128UV9",
        "quantity": 3,
        "weight": 10,
        "height": 1.4,
        "width": 1.2,
        "depth": 2.3,
        "unit": "ft",
        "container": "BOX",
        "description": "Box of t-shirts",
        "price": "59.99",
        "temperature": "NA",
        "person_name": "T. Shirt"
    },
    {
        "sku": "128UV8",
        "height": 9.4,
        "width": 6.2,
        "depth": 3.3,
        "unit": "in",
        "container": "BAG",
        "description": "Bag of socks",
        "price": "9.99",
        "temperature": "NA",
        "person_name": "Jim"
    }
  ];

  brawndo.order.create({
    origin : origin,
    destination : destination,
    details : details,
    items: items
  }, function(error, data) {
    console.log(error);
    console.log(data);
  });
});

