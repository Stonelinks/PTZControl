import * as shell from "shelljs";
import * as usb from "usb";
import { MILLISECONDS_IN_SECOND } from "../common/time";

export const resetVideoUsbDevice = async (deviceId: string) => {
  return new Promise(res => {
    const usbInfo = shell.exec(`udevadm info -n ${deviceId} -q path`);
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
      const { busNumber, portNumbers } = device;
      if (portNumbers && portNumbers.length) {
        portNumbers.forEach(port => {
          if (busNumber === targetBusNumber && port === targetPort) {
            setTimeout(() => {
              device.open();
              setTimeout(() => {
                device.reset(() => {
                  setTimeout(() => {
                    device.close();
                    setTimeout(res, 10 * MILLISECONDS_IN_SECOND);
                  }, 10 * MILLISECONDS_IN_SECOND);
                });
              }, 10 * MILLISECONDS_IN_SECOND);
            }, 10 * MILLISECONDS_IN_SECOND);
          }
        });
      }
    });
    res();
  });
};
