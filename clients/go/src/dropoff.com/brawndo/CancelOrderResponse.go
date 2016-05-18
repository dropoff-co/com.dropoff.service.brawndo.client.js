package brawndo

type CancelOrderResponse struct {
	Message			string 	`json:"message"`
	Timestamp 		string 	`json:"timestamp"`
	Success			bool	`json:"success"`
}
