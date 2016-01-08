### Mustard 9000


# NOTES:

To start it is best to run with two tabs open. One to kill it when necessary

In tab one, navigate to:

```
go/src/github.com/DecodedCo/Mustard
```

and run

```
wifiScripts/scripts-wifi/start_accesspoint.sh
```

In the second tab to kill it run

```
go/src/github.com/DecodedCo/Mustard/wifiScripts/scripts-wifi/stop_accesspoint.sh
```

Remember to run as root


* Mustard 9000 is a MITM framework written in go.
* It is 9000 because this is the port I was developing on while building it, so my url was mustard:9000

### Prerequisites

* libpcap-dev
* go
* revel

### Configuration on Device.

* A few folders have to be setup before the device will work.
* They default to `/var/mustard/`
* The folders that need to be created are `/var/mustard/{pages,hars}
##### Transparent proxy

* The basic proxy can only currenty allow http requests through. This is a reestriction because you have to define what to do if it is HTTPS.
* The wolfpack hack handles both HTTP and HTTPS situations. If it is HTTPS it allows it through as it can't do anything about it. this prevents interception of HSTS and direct requests to HTTPS
* HTTP that gets redirected to HTTPS will get stripped
* HTTP will be allowed through.
* The problem with pages that are already http for the wolfpack hack is there is not interception etc, so scripts have to be used in this situation.

##### things....

* A proxy server for demonstrating MITM attacks and the kinds of things possible

* Uses `gopm` package manager (although not well tested as only I have used it...)
	* To use it, navigate to `app/controllers` and run `gopm get`. This should pull in the required libraries to your go path
	* See [gopm on github](https://github.com/gpmgo/gopm)
### Current Features

* Simple Proxy
	* Captures HARS but nothing more
* Redirect URLs
	* Designed to avoid pages that are over HSTS - however would require the user to click on a link to a page (i.e www.gnail.com) rather than type it in as their browser will force HTTPS otherwise.
	* If URLs are in a specific list, then the page will redirect to a local html page. Use Chrome SingleFile plugin to clone pages. Base64 encodes everything into one html document.
	* All URLs that are redirected will have a key logger injected automatically.
		* TODO: Add ability to add more scripts into redirected pages.
* Block URLs
	* Allows the attacker to block a list of URLs for whatever reason
* Inject Hook into HTTP
	* From a list of scripts, the attacker can inject scripts into pages. Can't be done over HTTPS
* WolfPackHack.
	* The cream.
		* Designed to intercept standard HTTPS and kill the connection. The Proxy will then make the same connection itself with the server and forward the response to the client over HTTP.
		* TODO: If the user requests HTTPS send a redirect to the client to make the request again, but over HTTP. The WolfPackHack can then return to the client over HTTP ;)

### Dashboard

* View Hars
	* As the client browses, HAR files are collected, however they are not continually displayed. The attacker can update the list of HARS that have been collected by clicking this
* View Key Logging
	* Updates the collected key logs for the session
	* TODO: These should be saved to file rather than stored in memory
* Discover Local Wifi Requests
	* Currently not implemented
		* Will use kismet to collect the wifi SSIDs requests by nearby devices
* Create Access Point
	* Currently not implemented
		Will allow the attacker to create a local wifi access point with a specific name - possibly from the list of SSIDs collected above.
* Connect to wifi for internet connection


~~~
# Mustard issues
​
1. Few USA banking websites work (with or without wolfpack). Many refuse to load at all:
​
Wells Fargo
Bank of America
Citibank
Chase
​
2. Some websites can't load CSS without wolfpack:
​
www.aetna.com/employers-organizations.html
​
3. Some websites capture POST data but crash on submit:
​
www.aetna.com/employers-organizations.html
​
Log In
​
4. Example websites that currently work, albeit v. slow or flaky:
​
google.com
bing.com including authentication
aetna.com/employers-organizations.html 
cnn.com
~~~

#### License

The MIT License (MIT)

Copyright (c) 2015 Decoded Co

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
