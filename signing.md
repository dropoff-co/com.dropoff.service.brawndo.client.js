# Generic Signing Overview

If you are creating a new client to connect to brawndo it is important that you have a good understanding of how to sign your request.  This guide will go through the necessary steps.

## 1) Public and private keys

You will need to refer to the public and private keys for your api user.  We will refer to them as private_key and public_key.

## 2) Be aware of the headers that your request will be sending

The headers will be part of the main body that will be signed.

## 3) Be aware of the resource and resource request path that you are interacting with

For example if you are requesting GET /v1/order/efef1212abcd the resources is order and the resource path is /order/efef1212abcd.  In this case the first piece of the path **v1** is ignored.

## 4) Construct the body to be signed.

We will build an example body for GET /v1/order/efef1212abcd

### 4.1) Generate the X-Dropoff-Date

This should be the current UTC time.

Add this value to the request headers.

Format is YYYYMMDDTHHmmssZ

For example:  20160112T172134Z

### 4.2) Add the method of the body

In our case it is GET.
  
Make sure you add a new line character to it.  

Make sure the method is all uppercase.

Allowed values are GET,PUT,POST

In our case:

```
GET\n
```

### 4.3) Add the path to the body

In our case it is /order/efef1212abcd.  Make sure you add a new line character to it.

```
GET\n/order/efef1212abcd\n\n
```

### 4.4)  Write the headers to the body.

When writing the headers, the name of the header should be in lower case.  Headers are added in alphabetical order of the header names.

Header key and value are joined with a ':'.  Each pair is terminated with a new line.

There should be values in this section.

Terminate this section with a new line.

Let's assume that we know that we will be sending these headers :

```
  "Host": "example.brawndo.dropoff.com",
```

```
  "Accept": "application/json",
```

```
  "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
```

```
  "Connection": "keep-alive"
```

```
  "X-Dropoff-Date": "20160112T172134Z"
```

The body would be:

```
GET\n/order/efef1212abcd\n\naccept:application/json\nconnection:keep-alive\nhost:example.brawndo.dropoff.com;user-agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9\n;x-dropoff-date:20160112T172134Z\n\n
```

### 4.5)  Write the header names to the body.

Should be lowercase, in alphabetical order and separated with ';'

Should be terminated with a new line.

The body would be:

```
GET\n/order/efef1212abcd\n\naccept:application/json\nconnection:keep-alive\nhost:example.brawndo.dropoff.com;user-agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9\n\naccept;connection;host;user-agent;x-dropoff-date\n
```

### 4.6) Create the authorization header encoding key

This is the formula

1)  HMAC encode the YYYYMMDD portion of the X-Dropoff-Date value using the key ```'dropoff' + private_key``` into a hex string.
2)  Using the value from 1 as the key, HMAC encode the resource (in our case order) into a hex string.

You should use SHA512 to do the encoding.

### 4.7) HMAC encode the body string with the private_key

You should use SHA512 to do the encoding.

The result should be in the form of a hex string.

### 4.8) Create the final srting to encode

This is the format:

HMAC-SHA512\n<x-dropoff-date>\n<resource>\n<value from 4.7>

### 4.9) Encode the string from 4.8 using the key from 4.6

Should result in a hex string.


### 4.10) Add the signed string to the request headers
 
Should be under Authorization header name

The value should be in this format:

```
Authorization: HMAC-SHA512 Credential=<public_key>,SignedHeaders=<value used in 4.6>,Signature=<hex string from 4.9>
```

## 5) Send the request