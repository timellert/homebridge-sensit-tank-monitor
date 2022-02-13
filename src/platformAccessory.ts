import { Service, PlatformAccessory } from 'homebridge';

import { SensitHomebridgePlatform } from './platform';
import { PLATFORM_NAME } from './settings';

export class SensitPlatformAccessory {
  private service: Service;
  private readonly signalmanNo: number;

  constructor(
    private readonly platform: SensitHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // get the accessory UUID
    this.signalmanNo = accessory.context.tank.SignalmanNo;
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, PLATFORM_NAME)
      .setCharacteristic(this.platform.Characteristic.Model, `Type-${accessory.context.tank.ProductTypeID }`)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, `${this.signalmanNo}`);
    // get the HumiditySensor service if it exists, otherwise create a new HumiditySensor service
    this.service = this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);
    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.tank.TankName || 'default tank');
    // register handler for GET CurrentRelativeHumidity Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity).onGet(() => {
      const value = this.platform.sensit.getTankLevelPercentage(this.signalmanNo);
      if (!value) {
        this.platform.log.error(`Unable to read value for tank: ${accessory.context.tank.TankName}`);
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      this.platform.log.info(`Tank: ${accessory.context.tank.TankName} Fill Level: ${value}`);
      return value;
    });

  }

}
