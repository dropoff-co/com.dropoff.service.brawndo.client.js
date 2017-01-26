package brawndo

type TipResponseData struct {
	Amount			string 	`json:"amount"`
	Description		string 	`json:"description"`
	CreateDate		string 	`json:"createdate"`
	UpdateDate 		string 	`json:"updatedate"`
}

type TipResponse struct {
	Message			string 	`json:"message"`
	Timestamp 		string 	`json:"timestamp"`
	Success			bool	`json:"success"`
	Tip		        *TipResponseData `json:"object,omitempty"`
}


type DeleteTipResponse struct {
	Message			string 	`json:"message"`
	Timestamp 		string 	`json:"timestamp"`
	Success			bool	`json:"success"`
}

type GetTipResponse struct {
	Amount			string 	`json:"amount,omitempty"`
	Description		string 	`json:"description,omitempty"`
	CreateDate		string 	`json:"createdate,omitempty"`
	UpdateDate 		string 	`json:"updatedate,omitempty"`
}