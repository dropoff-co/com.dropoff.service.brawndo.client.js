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

func (b Client) Info() (InfoResponse, error) {
	var ir InfoResponse
	resp, err := b.Transport.MakeRequest("GET", "/info", "info", "", nil)

	if (err != nil) {
		return ir, err
	}

	err = json.Unmarshal([]byte(resp), &ir)

	return ir, nil;
}

type EstimateRequest struct {
	Origin		string
	Destination	string
	UTCOffset	int
	ReadyTimestamp  int64
	CompanyId	string
}

func (b Client) Estimate(req *EstimateRequest) (EstimateResponse, error) {
	var origin = req.Origin;
	var destination = req.Destination;
	var ready_timestamp = req.ReadyTimestamp;
	var utc_offset = req.UTCOffset;
	var company_id = req.CompanyId;

	var er EstimateResponse
	query, err := url.ParseQuery("")

	if (err != nil) {
		return er, err
	}

	query.Add("origin", origin);
	query.Add("destination", destination);

	if (company_id != "") {
		query.Add("company_id", company_id);
	}

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
	var query_string string
	var company_id = req.CompanyId

	req.CompanyId = ""

	ba, err := json.Marshal(req)

	if (err != nil) {
		return cor, err
	}

	if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return cor, err
		}
		query.Add("company_id", company_id)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("POST", "/order", "order", query_string, ba)

	if (err != nil) {
		return cor, err
	}

	err = json.Unmarshal([]byte(resp), &cor)

	if (err != nil) {
		return cor, err
	}

	return cor, nil;
}

type OrderRequest struct {
	OrderId		string
	LastKey		string
	CompanyId	string
}

func (b Client) GetOrder(req *OrderRequest) (GetOrderResponse, error) {
	var gor GetOrderResponse

	var order_id = req.OrderId;
	var company_id = req.CompanyId;

	var query_string string

	if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return gor, err
		}
		query.Add("company_id", company_id)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("GET", "/order/" + order_id, "order", query_string, nil)

	if (err != nil) {
		return gor, err
	}

	err = json.Unmarshal([]byte(resp), &gor)

	if (err != nil) {
		return gor, err
	}

	return gor, nil;
}

func (b Client) GetOrderPage(req *OrderRequest) (GetOrdersResponse, error) {
	var gor GetOrdersResponse
	var query_string string
	var last_key = req.LastKey;
	var company_id = req.CompanyId;

	if (last_key != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return gor, err
		}
		query.Add("last_key", last_key)
		if (company_id != "") {
			query.Add("company_id", company_id)
		}
		query_string = "?" + query.Encode()
	} else if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return gor, err
		}
		query.Add("company_id", company_id)
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

func (b Client) CancelOrder(req *OrderRequest) (CancelOrderResponse, error) {
	var cor CancelOrderResponse
	var query_string string
	var order_id = req.OrderId;
	var company_id = req.CompanyId;

	if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return cor, err
		}
		query.Add("company_id", company_id)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("POST", "/order/" + order_id + "/cancel", "order", query_string, nil)

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


type OrderTipRequest struct {
	OrderId		string
	Amount		string
	CompanyId	string
}

func (b Client) CreateOrderTip(req *OrderTipRequest) (TipResponse, error) {
	var tr TipResponse

	var query_string string

	var order_id = req.OrderId;
	var amount = req.Amount;
	var company_id = req.CompanyId;

	if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return tr, err
		}
		query.Add("company_id", company_id)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("POST", "/order/" + order_id + "/tip/" + amount, "order", query_string, nil)

	if (err != nil) {
		return tr, err
	}

	err = json.Unmarshal([]byte(resp), &tr)

	if (err != nil) {
		return tr, err
	}

	return tr, nil;
}

func (b Client) GetOrderTip(req *OrderTipRequest) (GetTipResponse, error) {
	var tr GetTipResponse

	var query_string string
	var order_id = req.OrderId;
	var company_id = req.CompanyId;

	if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return tr, err
		}
		query.Add("company_id", company_id)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("GET", "/order/" + order_id + "/tip", "order", query_string, nil)

	if (err != nil) {
		return tr, err
	}

	err = json.Unmarshal([]byte(resp), &tr)

	if (err != nil) {
		return tr, err
	}

	return tr, nil;
}

func (b Client) DeleteOrderTip(req *OrderTipRequest) (DeleteTipResponse, error) {
	var tr DeleteTipResponse

	var query_string string
	var order_id = req.OrderId;
	var company_id = req.CompanyId;

	if (company_id != "") {
		query, err := url.ParseQuery("")
		if (err != nil) {
			return tr, err
		}
		query.Add("company_id", company_id)
		query_string = "?" + query.Encode()
	}

	resp, err := b.Transport.MakeRequest("DELETE", "/order/" + order_id + "/tip", "order", query_string, nil)

	if (err != nil) {
		return tr, err
	}

	err = json.Unmarshal([]byte(resp), &tr)

	if (err != nil) {
		return tr, err
	}

	return tr, nil;
}
