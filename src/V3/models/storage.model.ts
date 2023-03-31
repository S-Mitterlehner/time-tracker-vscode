import { Project } from './project.model';

export type Projects = {
  [key: string]: Project;
};

export class Storage {
  version: string = '3';
  projects: Projects = {};
}
