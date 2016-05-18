

# com.dropoff.service.brawndo.client

This is the 3rd party dropoff php client for creating and viewing orders and adding tips.

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

### Configuration <a id="configuration"></a>

You will have to configure the brawndo instance via the constructor.

	$public_key = 'user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8';
	$private_key = '7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482';
	$api_url = 'https://qa-brawndo.dropoff.com/v1';
	$host = 'qa-brawndo.dropoff.com';
	$brawndo = new \Dropoff\Brawndo($public_key, $private_key, $api_url, $host);

---
* **api_url** - the url of the brawndo api.  This field is required.
* **host** - the api host.  This field is required.
* **public_key** - the public key of the user that will be using the client.  This field is required.
* **private_key** - the private key of the user that will be using the client.

---

### Getting Pricing Estimates <a id="estimates"></a>

Before you place an order you will first want to estimate the distance, eta, and cost for the delivery.  The client provides a **getEstimate** function for this operation.

    $origin = '117 San Jacinto Blvd, Austin, TX 78701, United States';  // required
    $destination = '800 Brazos Street, Austin, TX 78701, United States'; // required
    $utc_offset = '-06:00'; // required
    $ready_timestamp = 1425578400; // optional

---
* **origin** - the origin (aka the pickup location) of the order.  Required.
* **destination** - the destination (aka the delivery location) of the order.  Required.
* **utc_offset** - the utc offset of the timezone where the order is taking place.  Required.
* **ready_timestamp** - the unix timestamp (in seconds) representing when the order is ready to be picked up.  If not set we assume immediate availability for pickup.

---
	$result = $brawndo->estimate('800 Brazos St, Austin, TX 78701', '2517 Thornton Rd, Austin, TX 78704', date('P'), time());

An example of a successful result will look like this:

	array(3) {
	  ["data"]=>
	  array(6) {
	    ["ETA"]=>
	    string(6) "1023.1"
	    ["Distance"]=>
	    string(4) "3.79"
	    ["asap"]=>
	    array(3) {
	      ["ETA"]=>
	      string(6) "1023.1"
	      ["Distance"]=>
	      string(4) "3.79"
	      ["Price"]=>
	      string(4) "2.06"
	    }
	    ["two_hr"]=>
	    array(3) {
	      ["ETA"]=>
	      string(6) "1023.1"
	      ["Distance"]=>
	      string(4) "3.79"
	      ["Price"]=>
	      string(5) "17.56"
	    }
	    ["four_hr"]=>
	    array(3) {
	      ["ETA"]=>
	      string(6) "1023.1"
	      ["Distance"]=>
	      string(4) "3.79"
	      ["Price"]=>
	      string(5) "15.96"
	    }
	    ["service_type"]=>
	    string(8) "standard"
	  }
	  ["success"]=>
	  bool(true)
	  ["timestamp"]=>
	  string(25) "2016-02-26T14:05:25+00:00"
	}

---
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

---
### Placing an order <a id="placing"></a>

Given a successful estimate call, and a window that you like, then the order can be placed.  An order requires origin information, destination information, and specifics about the order.

#### Origin and Destination data.

The origin and destination contain information regarding the addresses in the order.

	$destination = array(
	    'company_name' => 'Dropoff PHP Destination',     // required
	    'email' => 'awoss+phpd@dropoff.com',             // required
	    'phone' => '5555554444',                         // required
	    'first_name' => 'Del',                           // required
	    'last_name' => 'Fitzgitibit',                    // required
	    'address_line_1' => '800 Brazos Street',         // required
	    'address_line_2' => '250',                       // optional
	    'city' => 'Austin',                              // required
	    'state' => 'TX',                                 // required
	    'zip' => '78701',                                // required
	    'lat' => 30.269967,                              // required
		'lng' => -97.740838                              // required
	);

	$origin = array(
	    'company_name' => 'Dropoff PHP Destination',     // required
	    'email' => 'awoss+gus@dropoff.com',              // required
	    'phone' => '5124744877',                         // required
	    'first_name' => 'Napoleon',                      // required
	    'last_name' => 'Bonner',                         // required
	    'address_line_1' => '117 San Jacinto Blvd',      // required
	    'city' => 'Austin',                              // required
	    'state' => 'TX',                                 // required
	    'zip' => '78701',                                // required
	    'lat' => 30.263706,                              // required
	    'lng' => -97.741703,                             // required
	    'remarks' => 'Be nice to napoleon'               // optional
	);

---
* **address_line_1** - the street information for the origin or destination.  Required.
* **address_line_2** - additional information for the address for the origin or destination (ie suite number).  Optional.
* **company_name** - the name of the business for the origin or destination.  Required.
* **first_name** -  the first name of the contact at the origin or destination.  Required.
* **last_name** - the last name of the contact at the origin or destination.  Required.
* **phone** -  the contact number at the origin or destination.  Required.
* **email** -  the email address for the origin or destination.  Required.
* **city** -  the city for the origin or destination.  Required.
* **state** -  the state for the origin or destination.  Required.
* **zip** -  the zip code for the origin or destination.  Required.
* **lat** -  the latitude for the origin or destination.  Required.
* **lng** -  the longitude for the origin or destination.  Required.
* **remarks** -  additional instructions for the origin or destination.  Optional.

---

#### Order details data.

The details contain attributes about the order

	$details = array(
	    'quantity' => 1,                         // required
	    'weight' => 5,                           // required
	    'eta' => '448.5',                        // required
	    'distance' => '0.64',                    // required
	    'price' => '13.99',                      // required
	    'ready_date' => time(),                  // required
	    'type' => 'two_hr',                      // required
	    'reference_name' => 'Reference Name',    // optional
	    'reference_code' => 'Reference Code'     // optional
	);

---
* **quantity** - the number of packages in the order. Required.
* **weight** - the weight of the packages in the order. Required.
* **eta** - the eta from the origin to the destination.  Should use the value retrieved in the getEstimate call. Required.
* **distance** - the distance from the origin to the destination.  Should use the value retrieved in the getEstimate call. Required.
* **price** - the price for the order.  Should use the value retrieved in the getEstimate call.. Required.
* **ready_date** - the unix timestamp (seconds) indicating when the order can be picked up. Can be up to 60 days into the future.  Required.
* **type** - the order window.  Can be asap, two_hr, or four_hr depending on the ready_date. Required.
* **reference_name** - a field for your internal referencing. Optional.
* **reference_code** - a field for your internal referencing. Optional.

---
Once this data is created, you can create the order.

	$new_order = array(
	    'origin' => $origin,
	    'destination' => $destination,
	    'details' => $details
	);

	$result = $brawndo->order->create($new_order);

The data in the return value will contain the id of the new order as well as the url where you can track the order progress.


### Cancelling an order <a id="cancel"></a>
    $result = $brawndo->order->cancel(order_id);
    
* **order_id** - the id of the order to cancel.

An order can be cancelled in these situations

* The order was placed less than **ten minutes** ago.
* The order ready time is more than **one hour** away.
* The order has not been picked up.
* The order has not been cancelled.

    
### Getting a specific order <a id="specific"></a>

    $result = $brawndo->order->read('c969c2a46eb5bc7d007ddc0e10187116');

Example response

	array(3) {
	  ["data"]=>
	  array(3) {
	    ["destination"]=>
	    array(16) {
	      ["zip"]=>
	      string(5) "78701"
	      ["lng"]=>
	      float(-97.740838)
	      ["city"]=>
	      string(6) "Austin"
	      ["last_name"]=>
	      string(7) "Bobobob"
	      ["createdate"]=>
	      int(1455807688)
	      ["email_address"]=>
	      string(22) "deliveries@dropoff.com"
	      ["updatedate"]=>
	      int(1455807688)
	      ["company_name"]=>
	      string(12) "Dropoff Inc."
	      ["address_line_1"]=>
	      string(17) "800 Brazos Street"
	      ["order_status_code"]=>
	      int(0)
	      ["phone_number"]=>
	      string(10) "8444376763"
	      ["address_line_2"]=>
	      string(3) "250"
	      ["state"]=>
	      string(2) "TX"
	      ["first_name"]=>
	      string(5) "Algis"
	      ["order_id"]=>
	      string(13) "61AE-Ozd7-L12"
	      ["lat"]=>
	      float(30.269967)
	    }
	    ["details"]=>
	    array(23) {
	      ["distance"]=>
	      string(4) "0.64"
	      ["timezone"]=>
	      string(15) "America/Chicago"
	      ["time_frame"]=>
	      string(6) "two_hr"
	      ["simulation"]=>
	      bool(false)
	      ["createdate"]=>
	      int(1455807688)
	      ["type"]=>
	      string(3) "2HR"
	      ["utc_offset_minutes"]=>
	      int(-360)
	      ["updatedate"]=>
	      int(1455807688)
	      ["price"]=>
	      string(5) "13.99"
	      ["order_status_code"]=>
	      int(0)
	      ["quantity"]=>
	      int(1)
	      ["wait_time"]=>
	      int(0)
	      ["pickupETA"]=>
	      string(3) "TBD"
	      ["weight"]=>
	      int(5)
	      ["signed"]=>
	      string(5) "false"
	      ["readyforpickupdate"]=>
	      int(1455893912)
	      ["market"]=>
	      string(6) "austin"
	      ["service_type"]=>
	      string(8) "standard"
	      ["order_status_name"]=>
	      string(9) "Submitted"
	      ["signature_exists"]=>
	      string(2) "NO"
	      ["customer_name"]=>
	      string(10) "Algis Woss"
	      ["order_id"]=>
	      string(13) "61AE-Ozd7-L12"
	      ["deliveryETA"]=>
	      string(5) "448.5"
	    }
	    ["origin"]=>
	    array(17) {
	      ["zip"]=>
	      string(5) "78701"
	      ["lng"]=>
	      float(-97.741703)
	      ["city"]=>
	      string(6) "Austin"
	      ["last_name"]=>
	      string(6) "Bonner"
	      ["createdate"]=>
	      int(1455807688)
	      ["market"]=>
	      string(6) "austin"
	      ["email_address"]=>
	      string(27) "orders@gussfriedchicken.com"
	      ["updatedate"]=>
	      int(1455807688)
	      ["company_name"]=>
	      string(19) "Gus's Fried Chicken"
	      ["address_line_1"]=>
	      string(20) "117 San Jacinto Blvd"
	      ["order_status_code"]=>
	      int(0)
	      ["phone_number"]=>
	      string(10) "5124744877"
	      ["state"]=>
	      string(2) "TX"
	      ["first_name"]=>
	      string(8) "Napoleon"
	      ["order_id"]=>
	      string(13) "61AE-Ozd7-L12"
	      ["remarks"]=>
	      string(19) "Be nice to napoleon"
	      ["lat"]=>
	      float(30.263706)
	    }
	  }
	  ["success"]=>
	  bool(true)
	  ["timestamp"]=>
	  string(25) "2016-02-26T14:21:09+00:00"
	}


### Getting a page order <a id="page"></a>

	$result = $brawndo->order->readPage();
	$result = $brawndo->order->readPage('/YrqnazKwAui730mLfYT3eSEctmIAyzlEt80lkZJAJB4QyAhjH0ukYdJBI0w2Dcgl4/7k4pO6JTxP/U4hGXkH9kCVaqijcQU97FvxfABqjBSsJEt+Kh3igFeFgBZ3CV+JUn6ODMbhc9KXMnwEXx0fQ54D3lpY3jJHLh5xvFQmOM=');

Example response

	array(7) {
	  ["count"]=>
	  int(10)
	  ["data"]=>
	  array(10) { ..... }
	  ["total"]=>
	  int(804)
	  ["success"]=>
	  bool(true)
	  ["timestamp"]=>
	  string(25) "2016-02-26T14:26:32+00:00"
	  ["last_key"]=>
	  string(172) "/YrqnazKwAui730mLfYT3eSEctmIAyzlEt80lkZJAJB4QyAhjH0ukYdJBI0w2Dcgl4/7k4pO6JTxP/U4hGXkH9kCVaqijcQU97FvxfABqjBSsJEt+Kh3igFeFgBZ3CV+JUn6ODMbhc9KXMnwEXx0fQ54D3lpY3jJHLh5xvFQmOM="
	}

Use **last_key** to get the subsequent page of orders.

## Tips <a id="tips"></a>

You can create, delete, and read tips for individual orders.  Please note that tips can only be created or deleted for orders that were delivered within the current billing period.  Tips are paid out to our agents and will appear as an order adjustment charge on your invoice after the current billing period has expired.  Tip amounts must not be zero or negative.  You are limited to one tip per order.

### Creating a tip <a id="tip_create"></a>

Tip creation requires two parameters, the order id **(order_id)** and the tip amount **(amount)**.

	$result = $brawndo->order->tip->create('c969c2a46eb5bc7d007ddc0e10187116', 13.33);

### Deleting a tip <a id="tip_delete"></a>

Tip deletion only requires the order id **(order_id)**.

	$result = $brawndo->order->tip->delete('c969c2a46eb5bc7d007ddc0e10187116');

### Reading a tip <a id="tip_read"></a>

Tip reading only requires the order id **(order_id)**.

	$result = $brawndo->order->tip->read('c969c2a46eb5bc7d007ddc0e10187116');

Example response:

	array(4) {
	  ["amount"]=>
	  string(5) "13.33"
	  ["description"]=>
	  string(32) "Tip added by Dropoff(Algis Woss)"
	  ["createdate"]=>
	  string(25) "2016-02-26T14:33:15+00:00"
	  ["updatedate"]=>
	  string(25) "2016-02-26T14:33:15+00:00"
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

    $result = $brawndo->$order->$simulate('austin');