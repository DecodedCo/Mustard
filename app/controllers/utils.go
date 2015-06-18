package controllers

import (
    "log"
    "bytes"
    "strings"
    "os"
    "io"
    "io/ioutil"
    "net/http"
)


// -----------------------------------------------------------------------------------------





// -----------------------------------------------------------------------------------------


func utilsGetBuffer( site string ) string {
    buf := bytes.NewBuffer(nil)
    var s string
        f, err := os.Open(fileLocation+"/"+site+".html") // Error handling elided for brevity.
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


func utilsInjector( body string, replace string, result string ) string {
    body = strings.Replace(body, replace, result, -1)
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


// -----------------------------------------------------------------------------------------

