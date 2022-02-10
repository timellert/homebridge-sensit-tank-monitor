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

