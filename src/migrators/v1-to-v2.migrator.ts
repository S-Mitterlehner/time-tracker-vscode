import { IMigrator } from '../interfaces/migrator.interface';
import * as V1 from '../V1';
import * as V2 from '../V2';

export class V1ToV2Migrator implements IMigrator<V1.Storage, V2.Storage> {
  get oldVersion(): string {
    return '1';
  }
  get newVersion(): string {
    return '2';
  }

  migrate(old: V1.Storage): V2.Storage {
    const result = new V2.Storage();
    result.version = '2';
    result.allowMultipleProjects = false;
    result.times = { index: old };
    return result;
  }
}
