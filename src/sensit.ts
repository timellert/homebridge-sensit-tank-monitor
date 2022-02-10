import { APPAuthenicate_v3Request, APPAuthenicate_v3Response, TankInfo_V3 } from './types';
import * as soap from 'soap';
import { SENSIT_CLOUD_URL } from './settings';

export class SensitController {

  private readonly interval: number;
  private handler?: ReturnType<typeof setTimeout>;
  private tanks: TankInfo_V3[]

  constructor(public emailAddress: string, public password: string, public pollHours: number = 12) {
    this.tanks = [];
    this.interval = pollHours * 60 * 60 * 1000;
  }

  public getTankLevelPercentage(signalmanNo: number): number | undefined {
    const tank = this.tanks.find(tank => tank.SignalmanNo === signalmanNo);
    if (tank) {
      return tank.LevelPercentage;
    }
    return undefined;
  }

  public async getTanksInfo(): Promise<TankInfo_V3[]> {
    const soapClient = await soap.createClientAsync(SENSIT_CLOUD_URL);
    const authArgs: APPAuthenicate_v3Request = { emailaddress: this.emailAddress, password: this.password };
    const asyncResult = await soapClient.SoapMobileAPPAuthenicate_v3Async(authArgs);
    if (!asyncResult) {
      throw new Error('unable to initialise soap client');
    }
    const response: APPAuthenicate_v3Response = asyncResult[0];
    const body = response.SoapMobileAPPAuthenicate_v3Result;
    if (body && body.APIResult && body.APIResult.Code === 0) {
      console.log('Updating sensit tank info');
      this.tanks = body.Tanks.APITankInfo_V3;
      return this.tanks;
    } else {
      throw new Error(body.APIResult.Description);
    }
  }

  public startServerPoll() {
    if (this.handler) {
      clearTimeout(this.handler);
    }
    console.log('Started polling for sensit tank info');
    this.handler = setTimeout( async () => {
      this.startServerPoll();
      await this.getTanksInfo();
    }, this.interval);
  }

  public stopServerPoll() {
    if (this.handler) {
      clearTimeout(this.handler);
    }
  }

}
