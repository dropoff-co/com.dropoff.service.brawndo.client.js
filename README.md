# com.dropoff.service.brawndo.client

This is the 3rd party dropoff javascript client for creating and viewing orders.

## Using the client

This code should be identical in a browser (assuming you have browserified brawndo.js) or in nodejs.  Brawndo is access via a require call.

    var brawndo = require('brawndo');

### Configuration

You will then have to configure the brawndo instance with the configure function.

    var configure_params = {};
    configure_params.api_url = 'https://qa-brawndo.dropoff.com/v1';
    configure_params.public_key = 'user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8';

    configure_params.private_key = '7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482';

    // or .....

    configure_params.hasher_url = 'https://myserver.com/sign';

* **api_url** - the url of the brawndo api.  This field is required.
* **public_key** - the public key of the user that will be using the client.  This field is required.
* **private_key** - the private key of the user that will be using the client.  Can be substituted with **hasher_url**
* **hasher_url** - the endpoint that can be called to generate the Authorization header on the server side in case you don't want the private key to be stored on your client.

#### Implementing a hasher_url endpoint

It's pretty straightforward if you are storing the user information on the server side.  This example will assume that the public and private keys are part of the session.

    var brawndo = require('brawndo');

    // ..... express setup .....

    app.post('/do_sign', function(req, res) {
        if (req.session && req.session.public_key && req.session.private_key) {
            brawndo.configure({
                api_url : 'https://qa-brawndo.dropoff.com/v1',
                public_key : req.session.public_key,
                private_key : req.session.private_key
            });
            var signature = brawndo.createHash(params);
            res.status(200).json({ signature : signature });
        } else {
            res.status(401).end();
        }
    });

The client will handle the rest.

### Getting Pricing Estimates

Before you place an order you will first want to estimate the distance, eta, and cost for the delivery.  The client provides a **getEstimate** function for this operation.

    var estimate_params = {};
    estimate_params.origin = '117 San Jacinto Blvd, Austin, TX 78701, United States';  // required
    estimate_params.destination = '800 Brazos Street, Austin, TX 78701, United States'; // required
    estimate_params.utc_offset = '-06:00'; // required
    estimate_params.ready_timestamp = 1425578400; // optional

* **origin** - the origin (aka the pickup location) of the order.  Required.
* **destination** - the destination (aka the delivery location) of the order.  Required.
* **utc_offset** - the utc offset of the timezone where the order is taking place.  Required.
* **ready_timestamp** - the unix timestamp (in seconds) representing when the order is ready to be picked up.  If not set we assume immediate availability for pickup.

    brawndo.order.estimate(estimateParameters, function(error, estimate_data) {
    });

An example of a successful response will look like this:

    {
        success : true,
        timestamp: '2015-03-05T14:51:14+00:00',
        data : {
            ETA: '243.1',
            Distance: '0.62',
            From: '78701',
            To: '78701',
            asap: {
                Price: '19.00',
                ETA: '243.1',
                Distance: '0.62'
            },
            two_hr: {
                Price: '17.00',
                ETA: '243.1',
                Distance: '0.62'
            },
            four_hr: {
                Price: '15.00',
                ETA: '243.1',
                Distance: '0.62'
            },
            after_hr: {
                Price: '21.00',
                ETA: '243.1',
                Distance: '0.62'
            },
            holiday: {
                Price: '31.00',
                ETA: '243.1',
                Distance: '0.62'
            }
        }
    }

* **data** - contain the pricing information for the allowed delivery window based on the given ready time, so you will not always see every option.
* **Distance** - the distance from the origin to the destination.
* **ETA** - the estimated time (in seconds) it will take to go from the origin to the destination.
* **From** - the origin zip code.  Only available if you have a zip to zip rate card configured.
* **To** - the destination zip code.  Only available if you have a zip to zip rate card configured.
* **asap** - the pricing for an order that needs to delivered within an hour of the ready time.
* **two_hr** - the pricing for an order that needs to delivered within two hours of the ready time.
* **four_hr** - the pricing for an order that needs to delivered within four hours of the ready time.
* **after_hr** - the pricing for an order that needs to delivered on a weekend or after 5:30PM on a weekday.
* **holiday** - the pricing for an order that needs to delivered on a holiday.

### Placing an order

Given a successful estimate call, and a window that you like, then the order can be placed.  An order requires origin information, destination information, and specifics about the order.

#### Origin and Destination data.

The origin and destination contain information regarding the addresses in the order.

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

* **address_line_1** - the street information for the origin or destination.  Required.
* **address_line_2** - additional information for the address for the origin or destination (ie suite number).  Optional.
* **company_name** - the name of the business for the origin or destination.  Required.
* **first_name** -  the first name of the contact at the origin or destination.  Required.
* **last_name** - the last name of the contact at the origin or destination.  Required.
* **phone_number** -  the contact number at the origin or destination.  Required.
* **email** -  the email address for the origin or destination.  Required.
* **city** -  the city for the origin or destination.  Required.
* **state** -  the state for the origin or destination.  Required.
* **zip** -  the zip code for the origin or destination.  Required.
* **lat** -  the latitude for the origin or destination.  Required.
* **lng** -  the longitude for the origin or destination.  Required.
* **remarks** -  additional instructions for the origin or destination.  Optional.

#### Order details data.

The details contain attributes about the order

    var details = {
        quantity : 1,                   // required
        weight : 5,                     // required
        eta : void(0),                  // required
        distance : void(0),             // required
        price : void(0),                // required
        ready_date : 1425578400,        // required
        type : void(0),                 // required
        reference_name : void(0),       // optional
        reference_code : void(0)        // optional
    };

* **quantity** - the number of packages in the order. Required.
* **weight** - the weight of the packages in the order. Required.
* **eta** - the eta from the origin to the destination.  Should use the value retrieved in the getEstimate call. Required.
* **distance** - the distance from the origin to the destination.  Should use the value retrieved in the getEstimate call. Required.
* **price** - the price for the order.  Should use the value retrieved in the getEstimate call.. Required.
* **ready_date** - the unix timestamp indicating when the order can be picked up. Can be up to 60 days into the future.  Required.
* **type** - the order window.  Can be asap, two_hr, four_hr, after_hr, or holiday depending on the ready_date. Required.
* **reference_name** - a field for your internal referencing. Optional.
* **reference_code** - a field for your internal referencing. Optional.

Once this data is created, you can create the order.

    brawndo.order.create({
        origin : origin,
        destination : destination,
        details : details
    }, function(error, data) {
    });

The data in the callback will contain the id of the new order as well as the url where you can track the order progress.


### Getting a specific order

    brawndo.order.read({order_id : 'zzzz-zzzz-zzz'}, function(error, data) {
    });

### Getting a page order

    brawndo.order.read(function(error, data) {
    });

    brawndo.order.read({last_key : 'zhjklzvxchjladfshjklafdsknvjklfadjlhafdsjlkavdnjlvadslnjkdas'}, function(error, data) {
    });
