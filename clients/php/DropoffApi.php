<?php
/**
 * Created by PhpStorm.
 * User: alwoss
 * Date: 2/17/16
 * Time: 7:29 AM
 */

namespace Dropoff;

require_once 'HTTP/Request2.php';

class DropoffApi
{
    protected $order;
    public $secret_key = '';
    public $public_key = '';
    public $url = '';
    public $host = '';

    function __construct($public_key,$secret_key,$url,$host) {
        $this->secret_key = $secret_key;
        $this->public_key = $public_key;
        $this->url = $url;
        $this->host = $host;
    }

    private function createSignedRequest($path, $resource, $method, $query = NULL) {
        $request = new \HTTP_Request2($this->url.$path, $method);

        if (sizeof($query) > 0) {
            $estimate_url = $request->getUrl();
            $estimate_url->setQueryVariables($query);
        }

        $xdropoffdate = gmdate('Ymd\THis\Z');

        $request->setHeader('X-Dropoff-Date', $xdropoffdate);
        $request->setHeader('Accept', 'application/json');
        $request->setHeader('Host', $this->host);
        $request->setHeader('User-agent', 'brawndo-client-php');

        $headers = $request->getHeaders();
        ksort($headers);

        $header_string = '';
        $header_key_string = '';

        foreach ($headers as $key => $val) {
            if ($header_string != '') {
                $header_string = $header_string."\n";
                $header_key_string = $header_key_string.";";
            }
            $header_key_string = $header_key_string.$key;
            $header_string = $header_string.$key.':'.$val;
        }

        if ($header_string != '') {
            $header_string = $header_string."\n";
        }

        $auth_body = "{$method}\n{$path}\n\n{$header_string}\n{$header_key_string}\n";

        $body_hash = hash_hmac("sha512", $auth_body, $this->secret_key, false);
        $final_string_to_hash = "HMAC-SHA512\n".$xdropoffdate."\n".$resource."\n".$body_hash;

        $first_key = "dropoff".$this->secret_key;
        $final_hash = hash_hmac("sha512", substr($xdropoffdate, 0, 8), $first_key, false);
        $final_hash = hash_hmac("sha512", $resource, $final_hash, false);
        $auth_hash = hash_hmac("sha512", $final_string_to_hash, $final_hash, false);

        $request->setHeader('Authorization', 'Authorization: HMAC-SHA512 Credential='.$this->public_key.",SignedHeaders=".$header_key_string.",Signature=".$auth_hash);

        return $request;
    }

    private function sendRequest($request) {
        $response = $request->send();

        if ($response->getStatus() == 200) {
            return json_decode($response->getBody(), true);
        } else {
            $error_response = json_decode($response->getBody(), true);

            $error_return_value = array(
                'success'   => false,
                'status'    => $response->getStatus()
            );

            if (!is_null($error_response) && array_key_exists('message', $error_response)) {
                $error_return_value['message'] = $error_response['message'];
            }

            return $error_return_value;
        }
    }

    public function estimate($origin, $destination) {
        $query = array(
            'origin'        => $origin,
            'destination'   => $destination,
            'utc_offset'    => date('P'));
        $request = $this->createSignedRequest('/estimate', 'estimate', \HTTP_Request2::METHOD_GET, $query);
        return $this->sendRequest($request);
    }

    public function createOrder($order_data) {
        $request = $this->createSignedRequest('/order', 'order', \HTTP_Request2::METHOD_POST);
        $request->setHeader('Content-type: application/json; charset=utf-8');
        $request->setBody(json_encode($order_data));
        return $this->sendRequest($request);
    }

    public function getOrder($order_id) {
        $request = $this->createSignedRequest('/order/'.$order_id, 'order', \HTTP_Request2::METHOD_GET);
        return $this->sendRequest($request);
    }

    public function cancelOrder($order_id) {
        $request = $this->createSignedRequest('/order/'.$order_id.'/cancel', 'order', \HTTP_Request2::METHOD_POST);
        return $this->sendRequest($request);
    }

    public function getOrders($last_key_hash = NULL) {
        $query = NULL;
        if (!is_null($last_key_hash)) {
            $query = array(
                'last_key_hash' => $last_key_hash
            );
        }
        $request = $this->createSignedRequest('/order', 'order', \HTTP_Request2::METHOD_GET, $query);
        return $this->sendRequest($request);
    }

    public function createTip($order_id, $amount) {
        $request = $this->createSignedRequest('/order/'.$order_id.'/tip/'.$amount, 'order', \HTTP_Request2::METHOD_POST);
        return $this->sendRequest($request);
    }

    public function getTip($order_id) {
        $request = $this->createSignedRequest('/order/'.$order_id.'/tip', 'order', \HTTP_Request2::METHOD_GET);
        return $this->sendRequest($request);
    }

    public function deleteTip($order_id) {
        $request = $this->createSignedRequest('/order/'.$order_id.'/tip', 'order', \HTTP_Request2::METHOD_DELETE);
        return $this->sendRequest($request);
    }
}

$dropoff = new DropoffApi('user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8','7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482','http://localhost:9094/v1','localhost:9094');
//$result = $dropoff->estimate('800 Brazos St, Austin, TX 78701', '2517 Thornton Rd, Austin, TX 78704');
$result = $dropoff->getOrder('c969c2a46eb5bc7d007ddc0e10187116');
//$result = $dropoff->getOrders();
//$result = $dropoff->getOrders('6XmJiCNsfeghh/+xYD99pnX/QPlxtOCCx7qiwsFN1kbIRnPw0NlxTDUOHVe7Z1jHRnu9dHAFvNJFIBaAjSCdZQ6nEHBJxvVtQFzdbYfs7FqvM/Cw7MMOsfT1uxLQOUAu9O2smQ3I5kcHxSaQSMkg+n2nCJ1ZDEEplRPyrINPlzo=');
//$result = $dropoff->getTip('c969c2a46eb5bc7d007ddc0e10187116');
//$result = $dropoff->createTip('c969c2a46eb5bc7d007ddc0e10187116', 13.33);
//$result = $dropoff->deleteTip('c969c2a46eb5bc7d007ddc0e10187116');
//
//$new_destination = array(
//    'company_name' => 'Dropoff PHP Destination',
//    'email' => 'awoss+phpd@dropoff.com',
//    'phone' => '5555554444',
//    'first_name' => 'Del',
//    'last_name' => 'Fitzgitibit',
//    'address_line_1' => '800 Brazos Street',
//    'address_line_2' => '250',
//    'city' => 'Austin',
//    'state' => 'TX',
//    'zip' => '78701',
//    'lat' => 30.269967,
//    'lng' => -97.740838
//);
//
//$new_origin = array(
//    'company_name' => 'Dropoff PHP Destination',
//    'email' => 'awoss+gus@dropoff.com',
//    'phone' => '5124744877',
//    'first_name' => 'Napoleon',
//    'last_name' => 'Bonner',
//    'address_line_1' => '117 San Jacinto Blvd',
//    'city' => 'Austin',
//    'state' => 'TX',
//    'zip' => '78701',
//    'lat' => 30.263706,
//    'lng' => -97.741703,
//    'remarks' => 'Be nice to napoleon'
//);
//$new_details = array(
//    'quantity' => 1,
//    'weight' => 5,
//    'eta' => '448.5',
//    'distance' => '0.64',
//    'price' => '13.99',
//    'ready_date' => time(),
//    'type' => 'two_hr'
//);
//$new_order = array(
//    'origin' => $new_origin,
//    'destination' => $new_destination,
//    'details' => $new_details
//);
//
//$result = $dropoff->createOrder($new_order);  //2aafc8569ede55dafdefc113626ee840

//$result = $dropoff->cancelOrder('2aafc8569ede55dafdefc113626ee840');

var_dump($result);
