import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { SensitHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SensitPlatformAccessory {
  private service: Service;
  private signalmanNo;

  constructor(
    private readonly platform: SensitHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.signalmanNo = accessory.context.tank.SignalmanNo;
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SENSiT')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.tank.ProductTypeID || 'default model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.signalmanNo || 'default serial');

    // get the HumiditySensor service if it exists, otherwise create a new HumiditySensor service
    this.service = this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.tank.TankName || 'default tank');

    // register handler for GET CurrentRelativeHumidity Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity).onGet(this.getValue.bind(this));

  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getValue(): Promise<CharacteristicValue> {
    const value = this.platform.sensit.getTankLevelPercentage(this.signalmanNo);
    if (value) {
      return value;
    } else {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

}
