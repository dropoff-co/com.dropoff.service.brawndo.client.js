package brawndo

import (
	"fmt"
	"encoding/json"
	"net/url"
	"strconv"
	//"net/http"
	//"crypto"
	//"crypto/hmac"
)

type Client struct {
	Transport *Transport
}

func (b Client) Estimate(origin string, destination string, utc_offset int, ready_timestamp int64 ) (EstimateResponse, error) {
	var er EstimateResponse
	query, err := url.ParseQuery("")

	if (err != nil) {
		return er, err
	}

	query.Add("origin", origin);
	query.Add("destination", destination);

	var utc_offset_string string

	var utc_offset_hours = utc_offset / 3600

	if (utc_offset_hours < 0) {
		utc_offset_string = "-"
		utc_offset_hours = utc_offset_hours * -1
	}

	if (utc_offset_hours < 10) {
		utc_offset_string += "0"
	}

	utc_offset_string += strconv.Itoa(utc_offset_hours) + ":00";

	query.Add("utc_offset", utc_offset_string);

	if (ready_timestamp > 0) {
		query.Add("ready_timestamp", strconv.FormatInt(ready_timestamp, 10));
	}

	resp, err := b.Transport.MakeRequest("GET", "/estimate", "estimate", "?" + query.Encode(), nil)

	if (err != nil) {
		return er, err
	}

	fmt.Println(resp);

	err = json.Unmarshal([]byte(resp), &er)

	return er, nil;
}

func (b Client) CreateOrder(req *CreateOrderRequest) (CreateOrderResponse, error) {
	var cor CreateOrderResponse

	ba, err := json.Marshal(req)

	if (err != nil) {
		return cor, err
	}

	resp, err := b.Transport.MakeRequest("POST", "/order", "order", "", ba)

	if (err != nil) {
		return cor, err
	}

	err = json.Unmarshal([]byte(resp), &cor)

	if (err != nil) {
		return cor, err
	}

	return cor, nil;
}

func (b Client) GetOrder(order_id string) (GetOrderResponse, error) {
	var gor GetOrderResponse
	resp, err := b.Transport.MakeRequest("GET", "/order/" + order_id, "order", "", nil)

	if (err != nil) {
		return gor, err
	}

	err = json.Unmarshal([]byte(resp), &gor)

	if (err != nil) {
		return gor, err
	}

	return gor, nil;
}

func (b Client) GetOrderPage(last_key string) (GetOrdersResponse, error) {
	var gor GetOrdersResponse
	var query_string string

	if (last_key != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return gor, err
		}
		query.Add("last_key", last_key)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("GET", "/order", "order", query_string, nil)

	if (err != nil) {
		return gor, err
	}

	err = json.Unmarshal([]byte(resp), &gor)

	if (err != nil) {
		return gor, err
	}

	return gor, nil;
}

func (b Client) CancelOrder(order_id string) (CancelOrderResponse, error) {
	var cor CancelOrderResponse

	resp, err := b.Transport.MakeRequest("POST", "/order/" + order_id + "/cancel", "order", "", nil)

	if (err != nil) {
		return cor, err
	}

	err = json.Unmarshal([]byte(resp), &cor)

	if (err != nil) {
		return cor, err
	}

	return cor, nil;
}

func (b Client) SimulateOrder(market string) (SimulateOrderResponse, error) {
	var sor SimulateOrderResponse
	resp, err := b.Transport.MakeRequest("GET", "/order/simulate/" + market, "order", "", nil)

	if (err != nil) {
		return sor, err
	}

	err = json.Unmarshal([]byte(resp), &sor)

	if (err != nil) {
		return sor, err
	}

	return sor, nil;
}

func (b Client) CreateOrderTip(order_id, amount string) (TipResponse, error) {
	var tr TipResponse
	resp, err := b.Transport.MakeRequest("POST", "/order/" + order_id + "/tip/" + amount, "order", "", nil)

	if (err != nil) {
		return tr, err
	}

	err = json.Unmarshal([]byte(resp), &tr)

	if (err != nil) {
		return tr, err
	}

	return tr, nil;
}

func (b Client) GetOrderTip(order_id string) (TipResponse, error) {
	var tr TipResponse
	resp, err := b.Transport.MakeRequest("GET", "/order/" + order_id + "/tip", "order", "", nil)

	if (err != nil) {
		return tr, err
	}

	err = json.Unmarshal([]byte(resp), &tr)

	if (err != nil) {
		return tr, err
	}

	return tr, nil;
}

func (b Client) DeleteOrderTip(order_id string) (TipResponse, error) {
	var tr TipResponse
	resp, err := b.Transport.MakeRequest("DELETE", "/order/" + order_id + "/tip", "order", "", nil)

	if (err != nil) {
		return tr, err
	}

	err = json.Unmarshal([]byte(resp), &tr)

	if (err != nil) {
		return tr, err
	}

	return tr, nil;
}
