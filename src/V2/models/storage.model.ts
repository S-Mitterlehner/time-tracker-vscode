import { TimeEntry } from './time-entry.model';

export type Times = {
  [key: string]: TimeEntry[];
};

export class Storage {
  version: string = '2';
  allowMultipleProjects: boolean = false;
  askForProductivityFactor: boolean = false;
  defaultProductivityFactor: number = 1;
  times?: Times;
}
