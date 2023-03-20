import { IMigrator } from '../interfaces/migrator.interface';
import { FileContentV1, FileContentV2 } from '../models/file-content';

export class V1ToV2Migrator implements IMigrator<FileContentV1, FileContentV2> {
  get oldVersion(): string {
    return '1';
  }
  get newVersion(): string {
    return '2';
  }

  migrate(old: FileContentV1): FileContentV2 {
    const result = new FileContentV2();
    result.version = '2';
    result.allowMultipleProjects = false;
    result.times = { index: old };
    return result;
  }
}
