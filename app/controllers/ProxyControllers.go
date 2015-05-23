package controllers

import (
	// "github.com/elazarl/goproxy"
	"github.com/abourget/goproxy"
	// "github.com/elazarl/goproxy/ext/image"
	"image"
	"image/jpeg"
	"log"
	"net"
	"net/http"
	// "strings"
	"bytes"
	"os"
	"io"
	"io/ioutil"
    "crypto/tls"
)

const (
    CONN_HOST = "localhost"
    CONN_PORT = "8080"
    CONN_TYPE = "tcp"
)
var listener net.Listener

var banned  = []string {
	"www.reddit.com",
	"www.nytimes.com",
	"www.ft.com",
}
var replace = []string {
	"www.lloyds.com",
	"www.hsbc.com",
	"www.barclays.com",
	"www.natwest.com",
}

func getBuffer(site string) string {
		buf := bytes.NewBuffer(nil)
	// for _, filename := range filenames {
	  f, _ := os.Open("public/ReplacementPages/"+site+".html") // Error handling elided for brevity.
	  io.Copy(buf, f)           // Error handling elided for brevity.
	  f.Close()
	// }
	s := string(buf.Bytes())
	return s
}
//replace a page with another page
func ReplacePage() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()

	/*proxy.OnRequest(goproxy.ReqHostIs(replace...)).DoFunc(
		func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {

			s := getBuffer(strings.Split(r.URL.Host, ".")[1]) //get the middle of the url: www.url.com...
			return nil,goproxy.NewResponse(r,goproxy.ContentTypeHtml,http.StatusUnauthorized,s)
		})
	*/
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

//Block websites from list of websites between the hours of 8am and 5pm
func BlockWebsites() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	/*proxy.OnRequest(goproxy.ReqHostIs(banned...)).DoFunc(
		func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
				return r, goproxy.NewResponse(r,
					goproxy.ContentTypeText, http.StatusForbidden,
					"Blocked Website!")
		})
		*/
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

//ERROR: issue is it doesnt recognise the image type
func ReplaceImages() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	image.RegisterFormat("jpeg", "jpeg", jpeg.Decode, jpeg.DecodeConfig)
	decoded, _ := os.Open("public/ReplacementImages/decoded.jpg")
	defer decoded.Close()
	proxy := goproxy.NewProxyHttpServer()
	/*proxy.OnResponse().Do(goproxy_image.HandleImage(func(img image.Image, ctx *goproxy.ProxyCtx) image.Image {

		ReplacementImage, str, err := image.Decode(decoded)

		if err != nil {
			log.Println("ERROR: ", err, " ", str)
		}
		return ReplacementImage
	}))
	*/
	proxy.Verbose = false
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func HTTPSInterceptor() net.Listener {
	// Create the listener on the connection and start the proxy server.
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST + ":" + CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	log.Println("HTTPS Proxy setup and we are listening...")


catchPost := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
log.Println("SNI URL: ", ctx.SNIHost())
        	log.Println("Request URL: ", ctx.Req.URL)
        	return goproxy.NEXT
	})
interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		// Check if the response from the server is a 301-moved-permanently and redirects to https.
		if ctx.Resp.Status == "301 Moved Permanently" {
			if ctx.Resp.Header.Get("Location")[0:5] == "https" {
				log.Println("...")
				log.Println("...")
				log.Println("---->>> CLIENT Requested URL: ", ctx.Resp.Request.URL)
				log.Println("<<<---- SERVER Response 301 to location: ", ctx.Resp.Header.Get("Location"))

				tr := &http.Transport{
		        	TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		    	}
		    	client := &http.Client{Transport: tr}
		    	// There we go
		    	log.Println("---->>> REQUESTING 301 redirect from SERVER: ", ctx.Resp.Header.Get("Location"))
		    	server_ssl_response, err := client.Get( ctx.Resp.Header.Get("Location") )
		    	if err != nil {
		        	log.Println(err)
		    	}
		    	log.Println("        TLS for: ", server_ssl_response.Header.Get("Location"))
		    	//cType := server_ssl_response.Header.Get("Content-Type")
		    	log.Println(server_ssl_response.TLS)
		    	// Read the server server_ssl_response.
		    	log.Println(server_ssl_response.Header)
		    	bs, err := ioutil.ReadAll(server_ssl_response.Body)
		    	if err != nil {
               		log.Println(err)
            	}
            	body := string(bs)
            	log.Println("301: body: ", body)	
				ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))	
			    return goproxy.NEXT

			} else if ctx.Resp.Header.Get("Location")[0:5] == "http:" {
				// Redirecting to some HTTP page. Not interested...
				log.Println("Response is HTTP")
				log.Println("HTTP: body: ", ctx.Resp.Header)
				return goproxy.NEXT
			}
		}
		log.Println("neither of the above, we are forwarding data")
		return goproxy.NEXT
	}) // end of the proxy OnResponse.


	proxy.HandleRequest((catchPost))
	proxy.HandleResponse((interceptResponse))
/*	proxy.OnResponse().DoFunc( func( resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
		
		// Check if the response from the server is a 301-moved-permanently and redirects to https.
		if resp.Status == "301 Moved Permanently" {
			if resp.Header.Get("Location")[0:5] == "https" {
				log.Println("...")
				log.Println("...")
				log.Println("---->>> CLIENT Requested URL: ", resp.Request.URL)
				log.Println("<<<---- SERVER Response 301 to location: ", resp.Header.Get("Location"))
				// We know we are now being asked to redirect to HTTPS
				// Obviously all HTTPS are belong to us, so we are going to request that page,
				// decrypt it and pass it on over HTTP.
				
				// Setup the transport layer.
				tr := &http.Transport{
		        	TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		    	}
		    	client := &http.Client{Transport: tr}
		    	// There we go
		    	log.Println("---->>> REQUESTING 301 redirect from SERVER: ", resp.Header.Get("Location"))
		    	server_ssl_response, err := client.Get( resp.Header.Get("Location") )
		    	if err != nil {
		        	log.Println(err)
		    	}
		    	log.Println("        TLS for: ", server_ssl_response.Header.Get("Location"))
		    	//cType := server_ssl_response.Header.Get("Content-Type")
		    	log.Println(server_ssl_response.TLS)
		    	// Read the server server_ssl_response.
		    	log.Println(server_ssl_response.Header)
		    	bs, err := ioutil.ReadAll(server_ssl_response.Body)
		    	if err != nil {
               		log.Println(err)
            	}
            	body := string(bs)

            	client_response_header := make(http.Header)
            	client_response_header.Add("Content-Type", server_ssl_response.Header.Get("Content-Type") )
            	// client_response_header.Add("Content-Type",cType)
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
			    return client_response

			} else if resp.Header.Get("Location")[0:5] == "http:" {
				// Redirecting to some HTTP page. Not interested...
				return resp
			}
		}

		//log.Println(resp.Request.URL)
		// if resp.Request.URL.String() == "http://www.nytimes.com/" {
		// 	log.Println(resp)
		// 	log.Println(resp.ProtoMajor)
		// 	log.Println(resp.ProtoMinor)
		// }
		

		// status := resp.Status
		// location := resp.Header.Get("Location")
		// log.Println(resp.Request.Header)
		
		// Get the content-type of the response header. This is needed for filtering on HTML.
		contentType := resp.Header.Get("Content-Type")
		//log.Println("CONTENT: ", contentType)
		// For HTML show the response
		if strings.Contains(contentType, "html") {
			// Log everything.
			// log.Println("\n\nClient Requested URL: ", resp.Request.URL)
			// log.Println("\t\tServer Response status: ", resp.Status)
			// log.Println("\t\tServer Response location: ", resp.Header.Get("Location"))
			// log.Println("\t\tServer Response Header", resp.Header)
		}
		// If the page is not HTML let it straight through.
		if !strings.Contains(contentType, "html") {
			//return resp	
		}

		return resp

	}) // end of the proxy OnResponse.
*/	
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}




//ERROR: want to inject code, but crashes out at the moment
func InjectScript(replace string, result string) net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	
	/*	proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {

		log.Println("URL: ", resp.Request.URL)
		contentType := resp.Header.Get("Content-Type")
			if !strings.Contains(contentType, "html") {
				return resp	
			}
			//start reading the response for editing
			bs, err := ioutil.ReadAll(resp.Body)
			if err != nil {
			   log.Println("inject error: ", err)
			}
			body := string(bs) //needs to be a string for reading
			body = strings.Replace(body, replace, result, -1)

			cpy := &http.Response{
				Status: resp.Status,
				StatusCode: resp.StatusCode,
			  	Proto: resp.Proto,
				ProtoMajor: resp.ProtoMajor,
				ProtoMinor: resp.ProtoMinor,
				Body: ioutil.NopCloser(bytes.NewBufferString(body)),
				ContentLength: int64(len(body)),
			}
		    return cpy
		})
	*/
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func FlipImages() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	/*proxy.OnResponse().Do(goproxy_image.HandleImage(func(img image.Image, ctx *goproxy.ProxyCtx) image.Image {
		dx, dy := img.Bounds().Dx(), img.Bounds().Dy()

		nimg := image.NewRGBA(img.Bounds())
		for i := 0; i < dx; i++ {
			for j := 0; j <= dy; j++ {
				nimg.Set(i, j, img.At(i, dy-j-1))
			}
		}
		return nimg
	}))
	*/
	proxy.Verbose = false
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

//simple pass through
func PassThrough() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
    proxy := goproxy.NewProxyHttpServer()
    proxy.Verbose = false
	// log.Fatal(http.Serve(listener, proxy))
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}