package controllers

import (
	"net"
	"time"
	"sync"
	"fmt"
	"errors"
	"log"
)
//this package handles listeners that need to be closed and re opened
//which means that the user

type StoppableListener struct {
    *net.TCPListener          //Wrapped listener //TCP Listener so it can satisfy the net.Listener interface
    stop             chan int //Channel used only to indicate listener should shutdown
}
var StoppedError = errors.New("Listener stopped")
var stoppableListener *StoppableListener //a global stopable listener
var listener net.Listener
var wg sync.WaitGroup

//this function sets up the listeners when the application is run for the first time
func InitializeListeners() {
	fmt.Println("initiate listeners...")
	var err error
    listener, err = net.Listen(CONN_TYPE, CONN_HOST + ":" + CONN_PORT) 
    if err != nil {
        log.Println("error here: ", err)
    }   
    stoppableListener, err = New(listener) //create a stoppable listener from the listener
}

//a function to close the stoppable listener
func (sl *StoppableListener) Stop() {
    close(sl.stop)
}

//create a listener however one with the stop channel attached
func New(l net.Listener) (*StoppableListener, error) {
    tcpL, ok := l.(*net.TCPListener)

    if !ok {
        return nil, errors.New("Cannot wrap listener")
    }

    retval := &StoppableListener{}
    retval.TCPListener = tcpL
    retval.stop = make(chan int)

    return retval, nil
}

//hijack the lisen function of the stoppable listener
func (sl *StoppableListener) Accept() (net.Conn, error) {

    for {
        //Wait up to one second for a new connection
        sl.SetDeadline(time.Now().Add(time.Second))

        newConn, err := sl.TCPListener.Accept()

        //Check for the channel being closed
        select {
        case <-sl.stop:
            return nil, StoppedError
        default:
            //If the channel is still open, continue as normal
        }

        if err != nil {
            netErr, ok := err.(net.Error)

            //If this is a timeout, then continue to wait for
            //new connections
            if ok && netErr.Timeout() && netErr.Temporary() {
                continue
            }
        }

        return newConn, err
    }
}