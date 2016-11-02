<?php
/**
 * Created by PhpStorm.
 * User: alwoss
 * Date: 2/25/16
 * Time: 1:52 PM
 */

include 'LastMileDDC.php';

$delivery = new \Dropoff\LastMileDDC(
    '4d8ea344c3c2846a1abf94982c52c0fce5db3059ccf94fb85861b390c5437860',         //public_key
    '76cad072b930f42c63dc55a78f01c8abba233423d55c394bb58f2e75c0fa1cd9',         //private_key
    'https://qa-brawndo.dropoff.com/ddc',                                       //route
    'qa-brawndo.dropoff.com'                                                    //host
);

//
//$p = array(
//    'address' => '800 Brazos St',
//    'apt' => '250',
//    'city' => 'Austin',
//    'state' => 'TX',
//    'zip' => '78701',
//    'latitude' => 30.269884,
//    'longitude' => -97.741010
//);
//
//$d = array(
//    'address' => '2517 Thornton Rd',
//    'apt' => NULL,
//    'city' => 'Austin',
//    'state' => 'TX',
//    'zip' => '78704',
//    'latitude' => 30.242536,
//    'longitude' => -97.772884
//);
//
//$estimate = array(
//    'pickup' => $p,
//    'delivery' => $d
//);
//
//$result = $delivery->estimate($estimate);
//
//var_dump($result);
//
//$order = array(
//    'estimate_id' => $result['estimate_id'],
//    'order_id' => 'fake_order_id',
//    'items' => array(
//        array(
//            'name' => 'Grumple',
//            'quantity' => 3
//        ),
//        array(
//            'name' => 'Grimble',
//            'quantity' => 7
//        )
//    ),
//    'pickup' => array(
//        'location' => $p,
//        'contact' => array(
//            'merchant_name' => 'Dropoff Inc.',
//            'email' => 'awoss+orders@dropoff.com',
//            'phone_number' => '55555555555'
//        ),
//        'instructions' => 'Do some stuff and things'
//    ),
//    'delivery' => array(
//        'location' => $d,
//        'contact' => array(
//            'first_name' => 'Algis',
//            'last_name' => 'Woss',
//            'company_name' => 'Home',
//            'email' => 'awoss@dropoff.com',
//            'phone_number' => '5124173167'
//        ),
//        'instructions' => 'Be vewy quiet'
//    )
//);
//
//$result = $delivery->book($order);

//$result = $delivery->status('KN6O-vbV3-rrv');

//$result = $delivery->cancel('vbdw-xKNq-rw1');

//var_dump($result);

