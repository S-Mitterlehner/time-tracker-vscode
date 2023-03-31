import { IConfiguration } from '../../interfaces/configuration.interface';
import { TimeEntry } from './time-entry.model';

export type Times = {
  [key: string]: TimeEntry[];
};

export class Storage implements IConfiguration {
  version: string = '2';
  defaultProject: string | undefined;
  allowMultipleProjects: boolean = false;
  askForProductivityFactor: boolean = false;
  defaultProductivityFactor: number = 1;
  times?: Times;
}
