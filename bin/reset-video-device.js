const usb = require("usb");
const shell = require("shelljs");

const device = process.argv.pop();

const usbInfo = shell.exec(`udevadm info -n ${device} -q path`);
const usbInfoParts = usbInfo.split("/");

let targetBusNumber = 0;
let targetPort = 0;

for (let i = 0; i < usbInfoParts.length; i++) {
  const part = usbInfoParts[i];
  if (part.startsWith("usb")) {
    targetBusNumber = parseInt(part.replace("usb", ""), 10);
    const nextPart = usbInfoParts[i + 1];
    targetPort = parseInt(nextPart.split("-").pop(), 10);
    break;
  }
}

usb.getDeviceList().forEach(device => {
  const { busNumber, deviceAddress, portNumbers } = device;
  portNumbers &&
    portNumbers.length &&
    portNumbers.forEach(port => {
      if (busNumber === targetBusNumber && port === targetPort) {
        device.open();
        device.reset(() => {
          device.close();
        });
      }
    });
});
