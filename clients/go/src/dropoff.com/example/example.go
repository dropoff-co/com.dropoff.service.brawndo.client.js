package main

import (
	"fmt"
	"time"
	"dropoff.com/brawndo"
)

func testCreateNewOrder(b *brawndo.Client) string {
	var cor brawndo.CreateOrderRequest
	var cor_det brawndo.CreateOrderDetails
	var cor_o, cor_d brawndo.CreateOrderAddress

	cor_det.Quantity = 1;
	cor_det.Weight = 5;
	cor_det.ETA = "448.5";
	cor_det.Distance = "0.64";
	cor_det.Price = "13.99";
	cor_det.ReadyDate = time.Now().Unix();
	cor_det.Type = "two_hr";
	cor_det.ReferenceCode = "reference code 0001";
	cor_det.ReferenceName = "reference name";

	cor_o.CompanyName = "Dropoff GO Origin";
	cor_o.Email = "noreply+origin@dropoff.com";
	cor_o.Phone = "5124744877";
	cor_o.FirstName = "Napoleon";
	cor_o.LastName = "Bonner";
	cor_o.AddressLine1 = "117 San Jacinto Blvd";
	//cor_o.AddressLine2 = "";
	cor_o.City = "Austin";
	cor_o.State = "TX";
	cor_o.Zip = "78701";
	cor_o.Lat = 30.263706;
	cor_o.Lng = -97.741703;
	cor_o.Remarks = "Be nice to napoleon";

	cor_d.CompanyName = "Dropoff GO Destination";
	cor_d.Email = "noreply+destination@dropoff.com";
	cor_d.Phone = "5555554444";
	cor_d.FirstName = "Del";
	cor_d.LastName = "Fitzgitibit";
	cor_d.AddressLine1 = "800 Brazos Street";
	cor_d.AddressLine2 = "250";
	cor_d.City = "Austin";
	cor_d.State = "TX";
	cor_d.Zip = "78701";
	cor_d.Lat = 30.269967;
	cor_d.Lng = -97.740838;
	//cor_d.Remarks = "Be nice to napoleon";

	cor.Details = &cor_det
	cor.Destination = &cor_d
	cor.Origin = &cor_o

	res,err := b.CreateOrder(&cor)

	if (err != nil) {
		fmt.Println(err);
		return ""
	} else {
		fmt.Println(res);
		return res.Data.OrderId;
	}
}

func testGetOrder(b *brawndo.Client) {
	res, err := b.GetOrder("23ff7ab8bfe0435a6e81775712e93e54")

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testGetOrderPageWithLastKey(b *brawndo.Client) {
	res, err := b.GetOrderPage("/YrqnazKwAui730mLfYT3eSEctmIAyzlEt80lkZJAJB4QyAhjH0ukYdJBI0w2Dcgl4/7k4pO6JTxP/U4hGXkH9wWfKGaTMfo0y52Qq/Th0NDsxzV18o5dFZ0rQ41k8qCTzNXV0sKQx+zrNa3WRIHCpyvMTGt2NALKwgJBjrpIWs=")

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testGetOrderPage(b *brawndo.Client) {
	res, err := b.GetOrderPage("")

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testEstimate(b *brawndo.Client) {
	_, o := time.Now().Zone();
	origin := "2517 Thornton Rd, Austin, TX 78704"
	destination := "800 Brazos St, Austin, TX 78704"

	est_res, est_err := b.Estimate(origin, destination, o, -1);

	if (est_err != nil) {
		fmt.Println(est_err);
	} else {
		fmt.Println(est_res.Data);
		fmt.Println(est_res.Data.TwoHr);
		fmt.Println(est_res.Data.FourHr);
		fmt.Println(est_res.Data.Asap);
	}
}

func testCancelOrder(b *brawndo.Client, order_id string) {
	res, err := b.CancelOrder(order_id);

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testSimulateOrder(b *brawndo.Client, market string) {
	res, err := b.SimulateOrder(market);

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testCreateTip(b *brawndo.Client, order_id string) {
	res, err := b.CreateOrderTip(order_id, "5.55");

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testGetTip(b *brawndo.Client, order_id string) {
	res, err := b.GetOrderTip(order_id);

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func testDeleteTip(b *brawndo.Client, order_id string) {
	res, err := b.DeleteOrderTip(order_id);

	if (err != nil) {
		fmt.Println(err);
	} else {
		fmt.Println(res);
	}
}

func main() {
	var t brawndo.Transport
	t.Host = "localhost:9094"
	t.ApiURL = "http://localhost:9094/v1"
	t.PublicKey = "user::91e9b320b0b5d71098d2f6a8919d0b3d5415db4b80d4b553f46580a60119afc8"
	t.SecretKey = "7f8fee62743d7bb5bf2e79a0438516a18f4a4a4df4d0cfffda26a3b906817482"

	var b brawndo.Client
	b.Transport = &t

	//testGetOrder(&b)
	//testGetOrderPage(&b)
	//testGetOrderPageWithLastKey(&b)
	testEstimate(&b)
	//new_order_id := testCreateNewOrder(&b)
	//
	//if (new_order_id != "") {
	//	testCancelOrder(&b, new_order_id);
	//} else {
	//	fmt.Println("No order to cancel");
	//}
	//testCancelOrder(&b, "bogus");
	//
	//testSimulateOrder(&b, "austin");

	//testCreateTip(&b, "3b1e9dd931993c11a050acdacec193ca");
	//testGetTip(&b, "3b1e9dd931993c11a050acdacec193ca");
	//testDeleteTip(&b, "3b1e9dd931993c11a050acdacec193ca");
}