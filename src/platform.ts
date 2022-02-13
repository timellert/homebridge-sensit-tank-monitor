import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SensitPlatformAccessory } from './platformAccessory';
import { SensitController, TankInfo_V3 } from './sensitController';

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
    const pollHours = this.config.refresh || 6;
    this.sensit = new SensitController(this.config.emailAddress, this.config.password, pollHours, this.log);
    // check we have valid config
    if (!this.config.emailAddress || !this.config.password) {
      log.error('Missing configuration details!');
      return;
    }
    this.log.debug('Finished initializing platform:', this.config.name);
    this.api.on('didFinishLaunching', async () => {
      log.debug('Executed didFinishLaunching callback');
      // discover devices then start server poll to keep then refreshed
      const hasDiscoveredDevices = await this.discoverDevices();
      if (hasDiscoveredDevices) {
        // only start polling for updates if we have discovered some devices
        this.sensit.startServerPoll();
        return;
      }
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices(): Promise<boolean> {
    // get the tanks info from the cloud
    let tanks: TankInfo_V3[] = [];
    try {
      tanks = await this.sensit.getTanksInfo();
    } catch (err) {
      this.log.error('DiscoverDevices: unable to get tank info from cloud - please check config');
      return false;
    }
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
    return !!tanks;
  }
}
