export interface IHVSITP {
  _id: string;
  date: string;
  time: string;
  total: number;
  delta: number;
  datetime: Date;
}

export interface IGVS {
  _id: string;
  date: string;
  time: string;
  to: number;
  out: number;
  total: number;
  t1: number;
  t2: number;
  datetime: Date;
}

export interface IGVSAnalize {
  _id: string;
  date: string;
  time: string;
  to: number;
  out: number;
  total: number;
  t1: number;
  t2: number;
  datetime: Date;
  diff: number;
  temp_warning: number;
  delta: number;
  deviation: number;
  deviation_warning: number;
}

export interface IHVSITPForecast {
  _id: string;
  date: string;
  time: string;
  total: number;
  delta: number;
  datetime: Date;
  maintenance: number;
  forecast: number;
  delta_pred: number;
}
