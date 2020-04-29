const usb = require("usb");
const shell = require("shelljs");

const device = process.argv.pop();

const usbInfo = shell.exec(`udevadm info -n ${device} -q path`);

console.log(usbInfo.split("/"));

usb.getDeviceList().forEach(device => {
  const { busNumber, deviceAddress, portNumbers } = device;
  portNumbers &&
    portNumbers.length &&
    portNumbers.forEach(port => {
      if (busNumber === 1 && port === 4) {
        device.open();
        device.reset(() => {
          device.close();
        });
      }
    });
});
