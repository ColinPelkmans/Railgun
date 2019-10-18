let device = undefined;

let connect = () => {
  log("Connecting to railgun ...");
  navigator.bluetooth.requestDevice({
    filters: [
      {services: [
          // All accessible services need to be added
          'battery_service',
          'cbdf2bed-623f-467f-b412-697d7b8339a4',
          '71773603-69ef-4cc1-aa86-2f4cad052100'
        ]
      },
      { name: 'Judas' }
    ]
  })
  .then(dev => {
    device = dev;
    log('Connecting to GATT Server ...');
    return device.gatt.connect();
  })
  .then(server => {
    log('Connected to GATT server');
    subscribeToBatteryNotifications();
  })
  .catch(error => {
    log('ERROR ' + error);
  });
}

let subscribeToBatteryNotifications = () => {
  if (device) {
    log('Getting Battery Level Service ...');
    device.gatt.getPrimaryService('battery_service')
    .then(service => {
      log('Getting Battery Level Characteristic ...');
      return service.getCharacteristic('battery_level');
    })
    .then(characteristic => {
      return characteristic.startNotifications().then(_ => {
        log('Subscribed to battery level notifications');
        characteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelNotification);
      });
    })
    .catch(error => {
      log('ERROR ' + error);
    });
  }
}

let handleBatteryLevelNotification = (event) => {
  let value = event.target.value;
  log('Batterylevel: ' + value.getUint8(0));
}

let shoot = () => {
  if (device) {
    log("firing railgun ...");
    log("Getting RailgunCommand Service ...");
    device.gatt.getPrimaryService('aff29153-b006-4cac-9b87-2b1c1a1c0963')
    .then(service => {
      log('Getting Charge Characteristic ...');
      return service.getCharacteristic('71773603-69ef-4cc1-aa86-2f4cad052100');
    })
    .then(characteristic => {
      log('Writing fire Characteristic ...');

      // Writing 1 is the signal to reset energy expended.
      let firingcmd = Uint8Array.of(10);
      return characteristic.writeValue(firingcmd);
    })
    .then(_ => {
      log('Railgun successfully fired');
    })
    .catch(error => {
      log('ERROR ' + error);
    });

  } else {
    log("Not connected to a railgun");
  }
}

let reload = () => {
  if (device) {
    log("Reloading railgun ...");
    log("Getting RailgunCommand Service ...");
    device.gatt.getPrimaryService('aff29153-b006-4cac-9b87-2b1c1a1c0963')
    .then(service => {
      log('Getting Charge Characteristic ...');
      return service.getCharacteristic('cbdf2bed-623f-467f-b412-697d7b8339a4');
    })
    .then(characteristic => {
      log('Writing Charge Characteristic ...');

      // Writing 1 is the signal to reset energy expended.
      let chargePercentage = Uint8Array.of(50);
      return characteristic.writeValue(chargePercentage);
    })
    .then(_ => {
      log('Railgun successfully recharged');
    })
    .catch(error => {
      log('ERROR ' + error);
    });

  } else {
    log("Not connected to a railgun");
  }
}

let disconnect = () => {
  if (device) {
    log("Disconnecting ...");
    device.gatt.disconnect();
    device = undefined;
    log("Successfully disconnected from railgun");
  } else {
    log("Not connected to a railgun");
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById("connect").addEventListener("click", connect);
  document.getElementById("shoot").addEventListener("click", shoot);
  document.getElementById("reload").addEventListener("click", reload);
  document.getElementById("disconnect").addEventListener("click", disconnect);
});
