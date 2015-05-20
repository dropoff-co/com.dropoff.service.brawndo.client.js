var express       = require('express');
var router        = express.Router();
var CryptoJS      = { enc : {} };

CryptoJS.HmacSHA512  = require('crypto-js/hmac-sha512');
CryptoJS.enc.Hex     = require('crypto-js/enc-hex');

var my_key = process.env.COMPANY_KEY;
var my_secret = process.env.COMPANY_SECRET;

router.post('/webhook', function(req, res) {
  console.log(JSON.stringify(req.headers, null, '  '));
  var key = req.headers['X-Dropoff-Key'];
  if (!key) {
    key = req.headers['x-dropoff-key'];
  }

  if (my_key === key) {
    var signature = req.headers['X-Dropoff-Signature'];
    if (!signature) {
      key = req.headers['x-dropoff-signature'];
    }

    var signature_match = CryptoJS.HmacSHA512(JSON.stringify(req.body), my_secret).toString(CryptoJS.enc.Hex);
    if (signature_match === signature) {
      console.log(JSON.stringify(req.body, null, '  '));
    } else {
      console.log('No signature match');
    }
  } else {
    console.log('No key match');
  }
  res.status(200).end();
});

module.exports = router;
