package brawndo

type EstimateServiceType struct {
	ETA 		string			`json:"ETA"`
	Distance 	string			`json:"Distance"`
	Price 		string			`json:"Price"`
}

type EstimateData struct {
	ETA 		string			`json:"ETA"`
	Distance 	string			`json:"Distance"`
	ServiceType 	string			`json:"service_type"`
	Asap  		*EstimateServiceType	`json:"asap"`
	TwoHr  		*EstimateServiceType	`json:"two_hr"`
	FourHr 		*EstimateServiceType	`json:"four_hr"`
}

type EstimateResponse struct {
	Data      	*EstimateData		`json:"data"`
	Success   	bool			`json:"success"`
	Timestamp 	string			`json:"timestamp"`
}

