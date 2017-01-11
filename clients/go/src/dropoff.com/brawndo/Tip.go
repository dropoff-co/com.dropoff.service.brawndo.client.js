package brawndo

type TipResponseData struct {
	Amount			string 	`json:"amount"`
	Description		string 	`json:"description"`
	CreateDate		string 	`json:"createdate"`
	UpdateDate 		string 	`json:"updatedate"`
}

type TipResponse struct {
	TipId			string 	`json:"order_adjustment_id,omitempty"`
	ShortId			string 	`json:"short_id,omitempty"`
	Amount			string 	`json:"amount,omitempty"`
	Description		string 	`json:"description,omitempty"`
	CreateDate		string 	`json:"createdate,omitempty"`
	UpdateDate 		string 	`json:"updatedate,omitempty"`
	Message			string 	`json:"message"`
	Timestamp 		string 	`json:"timestamp"`
	Success			bool	`json:"success"`
	Data		       *CreateOrderData `json:"object,omitempty"`
}