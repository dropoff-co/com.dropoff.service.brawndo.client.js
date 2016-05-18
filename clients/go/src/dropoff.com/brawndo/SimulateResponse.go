package brawndo

type SimulateOrderResponse struct {
	OrderId			string 	`json:"order_id"`
	OrderDetailsUrl		string 	`json:"order_details_url"`
	Timestamp 		string 	`json:"timestamp"`
	Success			bool	`json:"success"`
}