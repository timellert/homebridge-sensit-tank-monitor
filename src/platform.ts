import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SensitPlatformAccessory } from './platformAccessory';
import { SensitController } from './sensit';

export class SensitHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public readonly sensit: SensitController;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.sensit = new SensitController(this.config.emailAddress, this.config.password, this.config.refresh || 12);
    this.log.debug('Finished initializing platform:', this.config.name);
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // discover devices then start hourly server poll to keep refreshed
      this.discoverDevices()
      this.sensit.startServerPoll();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const tanks = await this.sensit.getTanksInfo();
    for (const tank of tanks) {
      const uuid = this.api.hap.uuid.generate(`${tank.SignalmanNo}`);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
        new SensitPlatformAccessory(this, existingAccessory);
      } else {
        this.log.info('Adding new accessory:', tank.TankName);
        const accessory = new this.api.platformAccessory(tank.TankName, uuid);
        accessory.context.tank = tank;
        new SensitPlatformAccessory(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
