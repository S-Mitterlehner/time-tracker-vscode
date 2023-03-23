import { TimeEntry } from './time-entry';

export const CURRENT_VERSION = '2';
export type FileContent = FileContentV1 | FileContentV2;
export type NewestContentVersion = FileContentV2;

export function create(): NewestContentVersion {
  return new FileContentV2();
}

export type Times = { [key: string]: TimeEntry[] };

export type FileContentV1 = TimeEntry[];
export class FileContentV2 {
  version: string = '2';
  allowMultipleProjects: boolean = false;
  askForProductivityFactor: boolean = false;
  defaultProductivityFactor: number = 1;
  times?: Times;
}
