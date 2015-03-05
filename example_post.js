'use strict';
/**
 * Created by alwoss on 3/5/15.
 */
var brawndo = require('brawndo');

brawndo.configure({
  public_key : 'my_public_key',                         // required
  api_url : 'https://brawndo-api.dropoff.com',          // required
  private_key : 'my_private_key',                       // either this or hasher_url
  hasher_url : 'http://www.myserver.com/api/do_hash'    // either this or private_key
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
  eta : '',                 // required
  distance : '',            // required
  reference_name : '',      // required
  reference_code : '',      // required
  price : '',               // required
  type : '',                // required
  ready_date : 1425578400   // required
};

var estimateParameters = {
  origin : '117 San Jacinto Blvd, Austin, TX 78701, United States',   // required
  destination : '800 Brazos Street, Austin, TX 78701, United States', // required
  ready_timestamp : 1425578400,                                       // optional
  utc_offset : '-06:00'                                               // required
};

brawndo.getEstimate(estimateParameters, function(error, estimate_date) {

});

