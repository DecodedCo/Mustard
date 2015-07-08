# MITM Proxy

* A proxy server for demonstrating MITM attacks and the kinds of things possible

* Uses `gopm` package manager (although not well tested as only I have used it...)
	* To use it, navigate to `app/controllers` and run `gopm get`. This should pull in the required libraries to your go path
	* See [gopm on github](https://github.com/gpmgo/gopm)
### Current Features

* Simple Proxy
	* Captures HARS but nothing more
* Replace All Images
	* Currently not implemented
		* Will demonstrate replacing all the images on a page with anything the attacker likes
		* TODO: allow picure URL or upload
* Flip Images
	* Currently not implemented
		* Will allow the attacker to flip all the pictures of the victims request
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




#### To Do

* wolfpack needs to allow cookies
* wolfpack needs to allow normal http
* need to turn on transparent proxying - see nonproxyhandler of transparent proxy example
* Improve UI (work in progress...)
* Do not redirect on requests to local host - so once we have them on a page, they can be directed wherever from there. At the moment a url that is redirected means they can never go to sub domains of that url.
* Send emails from page (linkedIn, facebook etc..)
* users in a list rather than all users at the same place
* Click on users (i.e have a list of unique users IPs (MITM they will all get one...))
	* add users' HARs to the harviewer.
	* add users key logging to the key logs
* update key logs regularly (every 2 seconds?) and flash the "View Key logging" button if data changes
* CSS pop ups
	* list of pages to request login
* dashboard
	* tick boxes
* user tracking UUIDs and IP address
