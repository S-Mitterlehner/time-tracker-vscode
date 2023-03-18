import { TimeEntry } from './time-entry';

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
  times?: Times;
}
