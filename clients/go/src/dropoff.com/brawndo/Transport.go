package brawndo

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	//"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strings"
	"time"
)

type Transport struct {
	ApiURL, Host, PublicKey, SecretKey string
	Client *http.Client
}

func (t Transport) ComputeHmac512(message string, secret string) string {
	key := []byte(secret)
	h := hmac.New(sha512.New, key)
	h.Write([]byte(message))
	return hex.EncodeToString(h.Sum(nil))
}

func (t Transport) SignRequest( method,path,resource string, request *http.Request ) {
	var x_dropoff_date = time.Now().Format("20060102T150405Z")
	var keys []string;

	request.Header.Add("X-Dropoff-Date", x_dropoff_date);
	request.Header.Add("Accept", "application/json");
	request.Header.Add("User-agent", "brawndo-client-go");
	request.Header.Add("Host", t.Host);

	for k,_ := range request.Header {
		keys = append(keys, k);
	}

	sort.Strings(keys);

	var header_string, header_key_string, auth_body, body_hash, final_string_to_hash, first_key, final_hash, auth_hash string

	for _,v := range keys {
		if (header_string != "") {
			header_string += "\n"
			header_key_string += ";"
		}
		header_key_string += strings.ToLower(v)
		header_string += strings.ToLower(v)
		header_string += ":"
		header_string += request.Header.Get(v)
	}

	if (header_string != "") {
		header_string += "\n"
	}

	auth_body = method + "\n" + path + "\n\n" + header_string + "\n" + header_key_string + "\n"

	//fmt.Println("________________________________________________________________")
	//fmt.Println(auth_body)

	body_hash = t.ComputeHmac512(auth_body, t.SecretKey)

	final_string_to_hash = "HMAC-SHA512\n" + x_dropoff_date + "\n" + resource + "\n" + body_hash
	//fmt.Println("________________________________________________________________")
	//fmt.Println(final_string_to_hash)
	//fmt.Println("________________________________________________________________")

	first_key = "dropoff" + t.SecretKey
	final_hash = t.ComputeHmac512(x_dropoff_date[:8], first_key)
	final_hash = t.ComputeHmac512(resource, final_hash)
	auth_hash = t.ComputeHmac512(final_string_to_hash, final_hash)

	var auth_header string
	auth_header = "Authorization: HMAC-SHA512 Credential=" + t.PublicKey;
	auth_header += ",SignedHeaders=" + header_key_string
	auth_header += ",Signature=" + auth_hash

	request.Header.Add("Authorization", auth_header);
}


func (t Transport) MakeRequest( method,path,resource,query string, body []byte ) (string, error) {
	if (t.Client == nil) {
		t.Client = &http.Client{}
	}

	var req *http.Request

	if (body != nil) {
		reqq, err := http.NewRequest(method, t.ApiURL + path + query, bytes.NewBuffer(body))

		if (err != nil) {
			return "", err
		}

		req = reqq
		req.Header.Set("Content-Type", "application/json")
	} else {
		reqq, err := http.NewRequest(method, t.ApiURL + path + query, nil)

		if (err != nil) {
			return "", err
		}

		req = reqq
	}

	t.SignRequest(method,path,resource,req)

	resp, err := t.Client.Do(req)

	if (err != nil) {
		return "", err;
	}

	defer resp.Body.Close()

	contents, err := ioutil.ReadAll(resp.Body)

	if (err != nil) {
		return "", err
	}

	return string(contents), nil;
}