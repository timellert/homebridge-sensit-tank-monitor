import * as soap from 'soap';
import { SENSIT_CLOUD_URL } from './settings';
import { Logger } from 'homebridge';

export class SensitController {

  private readonly interval: number;
  private handler?: ReturnType<typeof setTimeout>;
  private tanks: TankInfo_V3[];

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

  public async getTanksInfo(log?: Logger): Promise<TankInfo_V3[]> {
    const soapClient = await soap.createClientAsync(SENSIT_CLOUD_URL);
    const authArgs: APPAuthenicate_v3Request = { emailaddress: this.emailAddress, password: this.password };
    const asyncResult = await soapClient.SoapMobileAPPAuthenicate_v3Async(authArgs);
    if (!asyncResult) {
      throw new Error('unable to initialise soap client');
    }
    const response: APPAuthenicate_v3Response = asyncResult[0];
    const body = response.SoapMobileAPPAuthenicate_v3Result;
    if (body && body.APIResult && body.APIResult.Code === 0) {
      this.tanks = body.Tanks.APITankInfo_V3;
      if (log) {
        log.info('Updated values from server');
      }
      return this.tanks;
    } else {
      throw new Error(body.APIResult.Description);
    }
  }

  public startServerPoll(log?: Logger) {
    if (this.handler) {
      clearTimeout(this.handler);
    }
    this.handler = setTimeout( async () => {
      await this.getTanksInfo(log);
      this.startServerPoll();
    }, this.interval);
  }

  public stopServerPoll() {
    if (this.handler) {
      clearTimeout(this.handler);
    }
  }

}

export interface SmartServReading {
  SignalmanNo: number;
  input1InAlarm: boolean;
  input1InUse: boolean;
  input2InAlarm: boolean;
  input2InUse: boolean;
  input3InAlarm: boolean;
  input3InUse: boolean;
  inputsMeaning: string;
  ReadingDate: Date;
}

export interface TankInfo_V3 {
  SignalmanNo: number;
  TankName: string;
  IsSmartServDevice: boolean;
  DisplayMobileApp: boolean;
  DisplayLevelAlert: boolean;
  DisplayDropAlert: boolean;
  DisplayConsumption: boolean;
  DisplayGetQuote: boolean;
  DisplayAdvancedProperties: boolean;
  HideLevelAlert: boolean;
  HideDropAlert: boolean;
  HideLOWBATTERY: boolean;
  HideNOECHO: boolean;
  HideConsumption: boolean;
  LevelPercentage: number;
  LevelLitres: number;
  UnitOfMeasurement: string;
  Measurement: number;
  SmartServReading: SmartServReading;
  ProductTypeID: number;
}

export interface SoapMobileAPPAuthenicate_v3Result {
  APIResult:{ Code: number; Description: string };
  APIUserID: string;
  EmailAddress: string;
  ConsumerServicesBrandID: number;
  ConsumerServicesBrandCode: string;
  Tanks: {
    APITankInfo_V3: TankInfo_V3[];
  };
  DisplayAccount: boolean;
  RoleID: number;
}

export interface APPAuthenicate_v3Request {
  emailaddress: string;
  password: string;
}

export interface APPAuthenicate_v3Response {
  SoapMobileAPPAuthenicate_v3Result: SoapMobileAPPAuthenicate_v3Result;
}


