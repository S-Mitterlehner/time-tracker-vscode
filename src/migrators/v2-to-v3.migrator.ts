import { IMigrator } from '../interfaces/migrator.interface';
import * as V2 from '../V2';
import * as V3 from '../V3';

export class V2ToV3Migrator implements IMigrator<V2.Storage, V3.Storage> {
  get oldVersion(): string {
    return '2';
  }
  get newVersion(): string {
    return '3';
  }

  migrate(old: V2.Storage): V3.Storage {
    const result = new V3.Storage();
    result.version = '3';
    if (old.times) {
      for (let k of Object.keys(old.times)) {
        const proj = old.times[k];
        const project = new V3.Project();
        project.times = old.times[k];
        result.projects[k] = project;
      }
    }

    return result;
  }
}
