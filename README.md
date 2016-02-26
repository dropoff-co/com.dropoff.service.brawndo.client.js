

# com.dropoff.service.brawndo.client

This is the 3rd party dropoff javascript client for creating and viewing orders.

**For PHP documentation go [HERE](php_README.md "PHP")**

# Table of Contents
  + [Client Info](#client)
    - [Configuration](#configuration)
    - [Getting Pricing Estimates](#estimates)
    - [Placing an Order](#placing)
    - [Cancelling an Order](#cancel)
    - [Getting a Specific Order](#specific)
    - [Getting a Page of Order](#page)
  + [Tips](#tips)  
    - [Creating](#tip_create)
    - [Deleting](#tip_delete)
    - [Reading](#tip_read)
  + [Webhook Info](#webhook)
    - [Webhook Backoff Algorithm](#backoff)
    - [Webhook Events](#events)

## Using the client <a id="client"></a>

This code should be identical in a browser (assuming you have browserified brawndo.js) or in nodejs.  Brawndo is access via a require call.

    var brawndo = require('brawndo');

### Configuration <a id="configuration"></a>

You will then have to configure the brawndo instance with the configure function.

    var configure_params = {};
    configure_params.api_url = 'https://qa-brawndo.dropoff.com/v1';
    configure_params.host = 'qa-brawndo.dropoff.com';
    configure_params.public_key = 'user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8';

    configure_params.private_key = '7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482';

    // or .....

    configure_params.hasher_url = 'https://myserver.com/sign';

* **api_url** - the url of the brawndo api.  This field is required.
* **host** - the api host.  This field is required.
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

### Getting Pricing Estimates <a id="estimates"></a>

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

### Placing an order <a id="placing"></a>

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
* **ready_date** - the unix timestamp (seconds) indicating when the order can be picked up. Can be up to 60 days into the future.  Required.
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


### Cancelling an order <a id="cancel"></a>
    brawndo.order.cancel(order_id, function(error, data) {});
    
* **order_id** - the id of the order to cancel.

An order can be cancelled in these situations

* The order was placed less than **ten minutes** ago.
* The order ready time is more than **one hour** away.
* The order has not been picked up.
* The order has not been cancelled.

    
### Getting a specific order <a id="specific"></a>

    brawndo.order.read({order_id : 'zzzz-zzzz-zzz'}, function(error, data) {
    });

Example response

    {
         data: {
             destination: {
                 order_id: 'ac156e24a24484a382f66b8cadf6fa83',
                 short_id: '06ex-r3zV-BMb',
                 createdate: 1425653646,
                 updatedate: 1425653646,
                 order_status_code: 0,
                 company_name: 'Dropoff Inc.',
                 first_name: 'Algis',
                 last_name: 'Woss',
                 address_line_1: '800 Brazos Street',
                 address_line_2: '250',
                 city: 'Austin',
                 state: 'TX',
                 zip: '78701',
                 phone_number: '8444376763',
                 email_address: 'deliveries@dropoff.com',
                 lng: -97.740838,
                 lat: 30.269967
             },
             details: {
                 order_id: 'ac156e24a24484a382f66b8cadf6fa83',
                 short_id: '06ex-r3zV-BMb',
                 createdate: 1425653646,
                 customer_name: 'Algis Woss',
                 type: 'ASAP',
                 market: 'austin',
                 timezone: 'America/Chicago',
                 price: '15.00',
                 signed: 'false',
                 distance: '0.62',
                 order_status_code: 0,
                 wait_time: 0,
                 order_status_name: 'Submitted',
                 pickupETA: 'TBD',
                 deliveryETA: '243.1',
                 signature_exists: 'NO',
                 quantity: 1,
                 weight: 5,
                 readyforpickupdate: 1425578400,
                 updatedate: 1425653646
             },
             origin: {
                 order_id: 'ac156e24a24484a382f66b8cadf6fa83',
                 short_id: '06ex-r3zV-BMb',
                 createdate: 1425653646,
                 updatedate: 1425653646,
                 order_status_code: 0,
                 company_name: 'Gus's Fried Chicken',
                 first_name: 'Napoleon',
                 last_name: 'Bonner',
                 address_line_1: '117 San Jacinto Blvd',
                 city: 'Austin',
                 state: 'TX',
                 zip: '78701',
                 phone_number: '5124744877',
                 email_address: 'orders@gussfriedchicken.com',
                 lng: -97.741703,
                 lat: 30.263706,
                 market: 'austin',
                 remarks: 'Be nice to napoleon'
             }
        },
        success: true,
        timestamp: '2015-03-09T18:42:15+00:00'
    }

### Getting a page order <a id="page"></a>

    brawndo.order.read(function(error, data) {
    });

    brawndo.order.read({last_key : 'zhjklzvxchjladfshjklafdsknvjklfadjlhafdsjlkavdnjlvadslnjkdas'}, function(error, data) {
    });

Example response

    {
        data: [ ... ],
        count: 10,
        total: 248,
        last_key: 'zhjklzvxchjladfshjklafdsknvjklfadjlhafdsjlkavdnjlvadslnjkdas',
        success: true,
        timestamp: '2015-03-09T18:42:15+00:00'
    }

## Tips <a id="tips"></a>

You can create, delete, and read tips for individual orders.  Please note that tips can only be created or deleted for orders that were delivered within the current billing period.  Tips are paid out to our agents and will appear as an order adjustment charge on your invoice after the current billing period has expired.  Tip amounts must not be zero or negative.  You are limited to one tip per order.

### Creating a tip <a id="tip_create"></a>

Tip creation requires two parameters, the order id **(order_id)** and the tip amount **(amount)**.

	brawndo.order.tip.create({ order_id :'61AE-Ozd7-L12', amount : 4.44 }, function(error, data) {
	});

### Deleting a tip <a id="tip_delete"></a>

Tip deletion only requires the order id **(order_id)**.

	brawndo.order.tip.delete('61AE-Ozd7-L12', function(error, data) {
	});

### Reading a tip <a id="tip_read"></a>

Tip reading only requires the order id **(order_id)**.

	brawndo.order.tip.read('61AE-Ozd7-L12', function(error, data) {
	});

Example response:

	{
		amount: "4.44"
		createdate: "2016-02-18T16:46:52+00:00"
		description: "Tip added by Dropoff(Algis Woss)"
		updatedate: "2016-02-18T16:46:52+00:00"
	}

## Webhooks <a id="webhook"></a>

You may register a server route with Dropoff to receive real time updates related to your orders.

Your endpoint must handle a post, and should verify the X-Dropoff-Key with the client key given to you when registering the endpoint.

The body of the post should be signed using the HMAC-SHA-512 hashing algorithm combined with the client secret give to you when registering the endpoint.

The format of a post from Dropoff will be:

    {
        count : 2,
        data : [ ]
    }

* **count** contains the number of items in the data array.
* **data** is an array of events regarding orders and agents processing those orders.

### Backoff algorithm <a id="backoff"></a>

If your endpoint is unavailable Dropoff will try to resend the events in this manner:

*  Retry 1 after 10 seconds
*  Retry 2 after twenty seconds
*  Retry 3 after thirty seconds
*  Retry 4 after one minute
*  Retry 5 after five minutes
*  Retry 6 after ten minutes
*  Retry 7 after fifteen minutes
*  Retry 8 after twenty minutes
*  Retry 9 after thirty minutes
*  Retry 10 after forty five minutes
*  All subsequent retries will be after one hour until 24 hours have passed

**If all retries have failed then the cached events will be forever gone from this plane of existence.**

### Events <a id="events"></a>

There are two types of events that your webhook will receive, order update events and agent location events.

All events follow this structure:

    {
        event_name : <the name of the event ORDER_UPDATED or AGENT_LOCATION>
        data : { ... }
    }

* **event_name** is either **ORDER_UPDATED** or **AGENT_LOCATION**
* **data** contains the event specific information

#### Order Update Event

This event will be triggered when the order is either:

* Accepted by an agent.
* Picked up by an agent.
* Delivered by an agent.
* Cancelled.

This is an example of an order update event

    {
        event_name: 'ORDER_UPDATED',
        data: {
            order_status_code: 1000,
            company_id: '7df2b0bdb418157609c0d5766fb7fb12',
            timestamp: '2015-05-15T12:52:55+00:00',
            order_id: 'klAb-zwm8-mYz',
            agent_id: 'b7aa983243ccbfa43410888dd205c298'
        }
    }

* **order_status_code** can be -1000 (cancelled), 1000 (accepted), 2000 (picked up), or 3000 (delivered)
* **company_id** is your company id.
* **timestamp** is a utc timestamp of when the order occured.
* **order_id** is the id of the order.
* **agent_id** is the id of the agent that is carrying out your order.

#### Agent Location Update Event

This event is triggered when the location of an agent that is carrying out your order has changed.

    {
        event_name: 'AGENT_LOCATION',
        data: {
            agent_avatar: 'https://s3.amazonaws.com/com.dropoff.alpha.app.workerphoto/b7aa983243ccbfa43410888dd205c298/worker_photo.png?AWSAccessKeyId=AKIAJN2ULWKTZXXEOQDA&Expires=1431695270&Signature=AFKNQdT33lhlEddrGp0kINAR4uw%3D',
            latitude: 30.2640713,
            longitude: -97.7469492,
            order_id: 'klAb-zwm8-mYz',
            timestamp: '2015-05-15T12:52:50+00:00',
            agent_id: 'b7aa983243ccbfa43410888dd205c298'
        }
    }

* **agent_avatar** is an image url you can use to show the agent.  It expires in 15 minutes.
* **latitude** and **longitude** reflect the new coordinates of the agent.
* **timestamp** is a utc timestamp of when the order occured.
* **order_id** is the id of the order.
* **agent_id** is the id of the agent that is carrying out your order.


#### Simulating an order

You can simulate an order via the brawndo api in order to test your webhooks.

The simulation will create an order, assign it to a simulation agent, and move the agent from pickup to the destination.

**You can only run a simulation once every fifteen minutes.**

    brawndo.order.simulate({ market : 'austin' }, function(error, result) {});