RFKILL:

Computers can softblock and hard block wifi cards from turning on.
A soft block is the software version of disabling a wifi card.
A hard block is the hardware version, i.e a switch on the machine that stops it coming on.

If you experience an RFILL
`Operation not possible due to RF KILL`

then you need to check whether your device is either hard or soft (or both) blocked.

type:

`rfkill list`

You can see which wifi devices have hard and soft blocks on.
If the soft block is on, then you need to type

`rfkill unblock wifi`

Then you can run 

ifconfig [wifi adapter eg wlan1] up and it should come on line