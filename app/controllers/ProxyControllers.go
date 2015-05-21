package controllers

import (
	"github.com/elazarl/goproxy"
	"github.com/elazarl/goproxy/ext/image"
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

	proxy.OnRequest(goproxy.ReqHostIs(replace...)).DoFunc(
		func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {

			s := getBuffer(strings.Split(r.URL.Host, ".")[1]) //get the middle of the url: www.url.com...
			return nil,goproxy.NewResponse(r,goproxy.ContentTypeHtml,http.StatusUnauthorized,s)
		})
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

//Block websites from list of websites between the hours of 8am and 5pm
func BlockWebsites() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	proxy.OnRequest(goproxy.ReqHostIs(banned...)).DoFunc(
		func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
				return r, goproxy.NewResponse(r,
					goproxy.ContentTypeText, http.StatusForbidden,
					"Blocked Website!")
		})
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
	proxy.OnResponse().Do(goproxy_image.HandleImage(func(img image.Image, ctx *goproxy.ProxyCtx) image.Image {

		ReplacementImage, str, err := image.Decode(decoded)

		if err != nil {
			log.Println("ERROR: ", err, " ", str)
		}
		return ReplacementImage
	}))
	proxy.Verbose = false
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func CheckForHTTPS() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	// proxy.OnRequest().HandleConnect(goproxy.AlwaysMitm)
	proxy.OnRequest().DoFunc(func (req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		if req.URL.Scheme == "https" {
			// req.URL.Scheme = "http"
			HTTPSInterceptor()
		}
		return req, nil
	})

	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func HTTPSInterceptor() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	log.Println("making it to here!")
	proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
		
		// status := resp.Status
		// location := resp.Header.Get("Location")
		log.Println("URL: ", resp.Request.URL)
		// log.Println(resp.Request.Header)
		contentType := resp.Header.Get("Content-Type")
		//log.Println("location: ", location, " status", status, " type: ", contentType )
		// resp.Header.Set("Host", "bbc.co.uk")
			if !strings.Contains(contentType, "html") {
				// log.Println("returning: ", location)
				return resp	
			}
			// log.Println("URL: ", ctx.Req.URL)
			tr := &http.Transport{
		        TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		    }
		    client := &http.Client{Transport: tr}
		    response, err := client.Get("http://www.bbc.co.uk")
		    if err != nil {
		        log.Println(err)
		    }
		  	bs, err := ioutil.ReadAll(response.Body)
            if err != nil {
               log.Println("inject error: ", err)
            }
            body := string(bs) //needs to be a string for reading
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
	
	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}
//ERROR: want to inject code, but crashes out at the moment
func InjectScript(replace string, result string) net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	
		proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {

			if strings.Contains(ctx.Req.URL.Path, "css") {//get the Path out of the object
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

	go http.Serve(listener, proxy) // you can probably ignore this error
    return listener
}

func FlipImages() net.Listener {
	listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
	proxy := goproxy.NewProxyHttpServer()
	proxy.OnResponse().Do(goproxy_image.HandleImage(func(img image.Image, ctx *goproxy.ProxyCtx) image.Image {
		dx, dy := img.Bounds().Dx(), img.Bounds().Dy()

		nimg := image.NewRGBA(img.Bounds())
		for i := 0; i < dx; i++ {
			for j := 0; j <= dy; j++ {
				nimg.Set(i, j, img.At(i, dy-j-1))
			}
		}
		return nimg
	}))
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