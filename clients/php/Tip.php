<?php
/**
 * Created by PhpStorm.
 * User: alwoss
 * Date: 2/25/16
 * Time: 1:33 PM
 */

namespace Dropoff;

require_once 'HTTP/Request2.php';

class Tip
{
    protected $utils;

    function __construct($utils) {
        $this->utils = $utils;
    }

    public function create($order_id, $amount, $company_id = NULL) {
        $request = NULL;
        if (!is_null($company_id)) {
            $query = array(
                'company_id' => company_id
            );
            $request = $this->utils->createSignedRequest('/order/'.$order_id.'/tip/'.$amount, 'order', \HTTP_Request2::METHOD_POST, $query);
        } else {
            $request = $this->utils->createSignedRequest('/order/'.$order_id.'/tip/'.$amount, 'order', \HTTP_Request2::METHOD_POST);
        }
        return $this->utils->sendRequest($request);
    }

    public function read($order_id, $company_id = NULL) {
        $request = NULL;
        if (!is_null($company_id)) {
            $query = array(
                'company_id' => company_id
            );
            $request = $this->utils->createSignedRequest('/order/'.$order_id.'/tip', 'order', \HTTP_Request2::METHOD_GET, $query);
        } else {
            $request = $this->utils->createSignedRequest('/order/'.$order_id.'/tip', 'order', \HTTP_Request2::METHOD_GET);
        }
        return $this->utils->sendRequest($request);
    }

    public function delete($order_id, $company_id = NULL) {
        $request = NULL;
        if (!is_null($company_id)) {
            $query = array(
                'company_id' => company_id
            );
            $request = $this->utils->createSignedRequest('/order/'.$order_id.'/tip', 'order', \HTTP_Request2::METHOD_DELETE, $query);
        } else {
            $request = $this->utils->createSignedRequest('/order/'.$order_id.'/tip', 'order', \HTTP_Request2::METHOD_DELETE);
        }
        return $this->utils->sendRequest($request);
    }
}
