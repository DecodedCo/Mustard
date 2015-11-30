#!/bin/bash


######################################################################################
######################################################################################


# Authors: Alex Walker, Luuk Derksen


######################################################################################
######################################################################################

# Stop the dhcp server
service isc-dhcp-server stop

# Kill all instances of airbase-ng
killall airbase-ng

# Stop Mustard
kill -9 $(ps aux | grep Mustard | grep -v grep | awk '{print $2}')
