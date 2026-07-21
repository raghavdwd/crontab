import { type IAlertConfig } from "../models/CronJob";

export interface CreateJobRequest {
  name?: string;
  schedule: string;
  url: string;
  method?: string;
  headers?: { name: string; value: string; enabled: boolean }[];
  body?: string;
  timeout?: number;
  expectedStatus?: number;
  saveResponse?: boolean;
  alertConfig?: IAlertConfig;
}
