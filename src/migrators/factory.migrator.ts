import { IMigrator } from '../interfaces/migrator.interface';

export class MigratorFactory {
  private _migrators: IMigrator<any, any>[] = [];

  constructor(...migrators: IMigrator<any, any>[]) {
    this._migrators = migrators;
  }

  getMigrator<TOld, TNew>(oldVersion: string, newVersion: string): IMigrator<TOld, TNew> | undefined {
    const result = this._migrators.find((m) => m.oldVersion === oldVersion && m.newVersion === newVersion);
    return result;
  }
}
