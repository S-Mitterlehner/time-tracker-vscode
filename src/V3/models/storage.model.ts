import { IConfiguration } from '../../interfaces/configuration.interface';
import { Project } from './project.model';
import { TimeEntry } from './time-entry.model';

export type Projects = {
  [key: string]: Project;
};

export class Storage {
  version: string = '3';
  projects: Projects = {};
}
