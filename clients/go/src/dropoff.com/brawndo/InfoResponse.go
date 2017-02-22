package brawndo

type GetInfoManagedClient struct {
	CompanyName 	string			`json:"company_name"`
	Id	 	string			`json:"id"`
	Level		int			`json:"level"`
	Children      	[]*GetInfoManagedClient	`json:"children"`
}

type GetInfoClient struct {
	CompanyName 	string			`json:"company_name"`
	Id	 	string			`json:"id"`
}

type GetInfoUser struct {
	FirstName 	string			`json:"first_name"`
	LastName 	string			`json:"last_name"`
	Id	 	string			`json:"id"`
}

type InfoResponseData struct {
	User		*GetInfoUser		`json:"user"`
	Client		*GetInfoClient		`json:"client"`
	ManagedClients	*GetInfoManagedClient	`json:"managed_clients"`
}

type InfoResponse struct {
	Data		*InfoResponseData	`json:"data"`
}
