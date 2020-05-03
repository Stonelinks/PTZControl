# PTZ Controls

Small webapp to control a PTZ camera

## Use

**To run in production**

`yarn start`

**To develop**

`yarn dev`

## udev rules for logitec PTZ


`sudo nano /etc/udev/rules.d/53-logitec-ptz.rules`


```
SUBSYSTEM=="usb", ATTR{idVendor}=="046d", ATTR{idProduct}=="085f", MODE="0666"
```

sudo udevadm control --reload-rules