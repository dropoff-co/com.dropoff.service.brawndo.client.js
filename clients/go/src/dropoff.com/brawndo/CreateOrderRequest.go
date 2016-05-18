package brawndo

type CreateOrderAddress struct {
	CompanyName 		string `json:"company_name"`
	Email 			string `json:"email"`
	Phone 			string `json:"phone"`
	FirstName 		string `json:"first_name"`
	LastName 		string `json:"last_name"`
	AddressLine1 		string `json:"address_line_1"`
	AddressLine2 		string `json:"address_line_2,omitempty"`
	City	 		string `json:"city"`
	State 			string `json:"state"`
	Zip 			string `json:"zip"`
	Remarks			string `json:"remarks,omitempty"`
	Lat			float64 `json:"lat"`
	Lng			float64 `json:"lng"`
}

type CreateOrderDetails struct {
	Quantity	int64  `json:"quantity"`
	Weight		int64  `json:"weight"`
	ETA		string `json:"eta"`
	Distance	string `json:"distance"`
	Price		string `json:"price"`
	ReadyDate	int64 `json:"ready_date"`
	Type		string `json:"type"`
	ReferenceCode	string `json:"reference_code,omitempty"`
	ReferenceName	string `json:"reference_name,omitempty"`
}

type CreateOrderRequest struct {
	Details     *CreateOrderDetails `json:"details"`
	Origin      *CreateOrderAddress `json:"origin"`
	Destination *CreateOrderAddress `json:"destination"`
}
