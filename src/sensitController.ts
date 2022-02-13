import * as soap from 'soap';
import { SENSIT_CLOUD_URL } from './settings';
import { Logger } from 'homebridge';

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

export class SensitController {

  private readonly interval: number;
  private handler?: ReturnType<typeof setTimeout>;
  private tanks: TankInfo_V3[];

  constructor(private emailAddress: string, private password: string, private pollHours: number = 6, private log: Logger) {
    this.tanks = [];
    this.interval = pollHours * 60 * 60 * 1000;
    this.log.info(`Controller created with of poll: ${pollHours} hours`);
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
      throw new Error('Unable to initialise soap / cloud client');
    }
    const response: APPAuthenicate_v3Response = asyncResult[0];
    const body = response.SoapMobileAPPAuthenicate_v3Result;
    if (body && body.APIResult && body.APIResult.Code === 0) {
      this.tanks = body.Tanks.APITankInfo_V3;
      this.log.info('Received updated tank values from cloud');
      return this.tanks;
    } else {
      throw new Error(body.APIResult.Description);
    }
  }

  public startServerPoll() {
    // stop the poll timer if available
    if (this.handler) {
      clearTimeout(this.handler);
    }
    this.log.info(`Scheduling next cloud poll in ${ this.pollHours } hours`);
    this.handler = setTimeout( async () => {
      try {
        await this.getTanksInfo();
      } catch (err) {
        this.log.error('Poll: unable to update tank info from cloud - please check config');
      }
      // start the poll timer
      this.startServerPoll();
    }, this.interval);
  }

}


