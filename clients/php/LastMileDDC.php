<?php
/**
 * Created by PhpStorm.
 * User: alwoss
 * Date: 2/29/16
 * Time: 7:45 AM
 */

namespace Dropoff;

require_once 'HTTP/Request2.php';
require_once 'Utils.php';

class LastMileDDC
{
    protected $utils;

    function __construct($public_key,$secret_key,$url,$host) {
        $this->utils = new Utils($public_key,$secret_key,$url,$host);
    }

    public function estimate($params) {
        $request = $this->utils->createSignedRequest('/estimate', 'estimate', \HTTP_Request2::METHOD_POST);
        $request->setHeader('Content-type: application/json; charset=utf-8');
        $request->setBody(json_encode($params));
        return $this->utils->sendRequest($request);
    }

    public function book($params) {
        $request = $this->utils->createSignedRequest('/book', 'book', \HTTP_Request2::METHOD_POST);
        $request->setHeader('Content-type: application/json; charset=utf-8');
        $request->setBody(json_encode($params));
        return $this->utils->sendRequest($request);
    }

    public function status($delivery_id) {
        $request = $this->utils->createSignedRequest('/status/' . $delivery_id, 'status', \HTTP_Request2::METHOD_GET);
        return $this->utils->sendRequest($request);
    }

    public function cancel($delivery_id) {
        $request = $this->utils->createSignedRequest('/cancel/' . $delivery_id, 'cancel', \HTTP_Request2::METHOD_GET);
        return $this->utils->sendRequest($request);
    }
}