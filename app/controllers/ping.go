package controllers

import (
	"fmt"
	"net"
	"time"

	"github.com/tatsushid/go-fastping"
)

type response struct {
	addr *net.IPAddr
	rtt  time.Duration
}
type Ping struct {
	Response string `json:Response`
	Idle     string `json:Idle`
}

func pingServer() Ping {
	var ping Ping
	hostname := "8.8.8.8"
	p := fastping.NewPinger()
	ra, err := net.ResolveIPAddr("ip4:icmp", hostname)
	if err != nil {
		fmt.Println(err)
		fmt.Println("Ping Error: ", err)
	}
	p.AddIPAddr(ra)
	p.OnRecv = func(addr *net.IPAddr, rtt time.Duration) {
		ping.Response = rtt.String()
	}
	p.OnIdle = func() {
		ping.Idle = "idle"
	}
	err = p.Run()
	if err != nil {
		fmt.Println(err)
	}
	return ping
}
