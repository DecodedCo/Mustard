#!/bin/bash


######################################################################################
######################################################################################


# Authors: Alex Walker, Luuk Derksen


######################################################################################
######################################################################################


# Kill the access point - this needs maturing to kill all monX points
airmon-ng stop wlan1mon

# Stop the dhcp server
service isc-dhcp-server stop

# Kill all instances of airbase
kill -9 $(ps -ef | grep -i airbase | awk '{print $2}')
