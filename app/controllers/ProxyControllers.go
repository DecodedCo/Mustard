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
	"strings"
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

	//handle SNI headers and print them out
	// proxy.HandleConnectFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
	// 	log.Println("Host: ", ctx.Req.Host)
	// 	ctx.ResponseWriter.Header().Set("Response", "201")
	// 	ctx.ResponseWriter.Write([]byte("Hello world"))
	// 	return goproxy.DONE
	// })


	// proxy.HandleRequestFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
	// // if ctx.Host() == "example.com" {
	// 	log.Println("REQUEST: logging to "+ctx.Host()+".har")
	// 	ctx.LogToHARFile(true)
	// 	proxy.FlushHARToDisk("public/hars/"+ctx.Host()+".har")
	// // }
	// return goproxy.NEXT
	// })
	// proxy.HandleResponseFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
	// // if ctx.Host() == "example.com" {
	// 	log.Println("RESPONSE: logging to "+ctx.Host()+".har")
	// 	ctx.LogToHARFile(true)
	// 	proxy.FlushHARToDisk("public/hars/"+ctx.Host()+".har")
	// // }
	// return goproxy.NEXT
	// })
	// //if you want to flush the HARs manually
	// proxy.NonProxyHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	if r.URL.Path == "/har" {
	// 		log.Println("NON PROXY: flushing HAR")
	// 		proxy.FlushHARToDisk("public/hars/forced.har")
	// 		w.WriteHeader(201)
	// 		w.Write([]byte("hello world!\n"))
	// 	}
	// })

interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
		// Check if the response from the server is a 301-moved-permanently and redirects to https.
		log.Println("URL: ", ctx.Resp.Request.URL)
		if ctx.Resp.Status == "301 Moved Permanently" {
			log.Println(ctx.Resp.Header.Get("Location"))
			if strings.Contains(ctx.Resp.Header.Get("Location"), "https") {
			// if ctx.Resp.Header.Get("Location")[0:5] == "https" {
				log.Println("...")
				log.Println("...")
				log.Println("---->>> CLIENT Requested URL: ", ctx.Resp.Request.URL)
				log.Println("<<<---- SERVER Response 301 to location: ", ctx.Resp.Header.Get("Location"))

				tr := &http.Transport{
		        	TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		    	}
		    	client := &http.Client{Transport: tr}
		    	// There we go
		    	// log.Println("---->>> REQUESTING 301 redirect from SERVER: ", ctx.Resp.Header.Get("Location"))
		    	server_ssl_response, err := client.Get( ctx.Resp.Header.Get("Location") )
		    	if err != nil {
		        	log.Println(err)
		    	}

		    	bs, err := ioutil.ReadAll(server_ssl_response.Body)
		    	if err != nil {
               		log.Println(err)
            	}
            	body := string(bs)
            	log.Println("301: body: ", body)	
				ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))	
			    return goproxy.FORWARD

			} else if ctx.Resp.Header.Get("Location")[0:5] == "http:" {
				// Redirecting to some HTTP page. Not interested...
				log.Println("Response is HTTP")
		    	bs, err := ioutil.ReadAll(ctx.Resp.Body)
		    	if err != nil {
	           		log.Println(err)
	        	}
		        log.Println("BODY: ", string(bs))
				return goproxy.NEXT
			}
		}
		log.Println("neither of the above, we are forwarding data")
    	// bs, err := ioutil.ReadAll(ctx.Resp.Body)
	    // 	if err != nil {
     //       		log.Println(err)
     //    	}
        // log.Println("HTTP: ", string(bs))
		return goproxy.NEXT
	}) // end of the proxy OnResponse.


	// proxy.HandleRequest((catchPost))
	proxy.HandleResponse((interceptResponse))

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