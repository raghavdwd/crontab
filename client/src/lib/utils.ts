import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import parser from "cron-parser";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getNextRunTimes = (cronExpr: string, count = 5): Date[] => {
  try {
    const interval = parser.parseExpression(cronExpr);
    const times: Date[] = [];
    for (let i = 0; i < count; i++) {
      times.push(interval.next().toDate());
    }
    return times;
  } catch {
    return [];
  }
};
