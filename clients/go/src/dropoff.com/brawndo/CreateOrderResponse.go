package brawndo

type CreateOrderData struct {
	OrderId 		string `json:"order_id"`
	ShortId			string `json:"short_id"`
	URL	 		string `json:"url"`
}

type CreateOrderResponse struct {
	Message			string 	`json:"message"`
	Timestamp 		string 	`json:"timestamp"`
	Success			bool	`json:"success"`
	Data 			*CreateOrderData `json:"data"`
}