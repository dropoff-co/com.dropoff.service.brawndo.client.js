<?php
/**
 * Created by PhpStorm.
 * User: alwoss
 * Date: 2/25/16
 * Time: 1:34 PM
 */
namespace Dropoff;

require_once 'HTTP/Request2.php';

class Utils
{
    function __construct($public_key,$secret_key,$url,$host) {
        $this->secret_key = $secret_key;
        $this->public_key = $public_key;
        $this->url = $url;
        $this->host = $host;
    }

    public function createSignedRequest($path, $resource, $method, $query = NULL) {
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

    public function sendRequest($request) {
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
}