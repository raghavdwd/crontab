import { type IAlertConfig } from "../models/CronJob";

export interface CronJobSnapshot {
  isActive: boolean;
  schedule: string;
  command: string;
  name: string | undefined;
  method: string | undefined;
  headers: { name: string; value: string; enabled: boolean }[] | undefined;
  body: string | undefined;
  timeout: number | undefined;
  expectedStatus: number | undefined;
  saveResponse: boolean;
  alertConfig: IAlertConfig | undefined;
}
