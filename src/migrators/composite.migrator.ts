import { IMigrator } from '../interfaces/migrator.interface';

export class CompositeMigrator<TOld, TNew> implements IMigrator<TOld, TNew> {
  get oldVersion(): string {
    return this._oldVersion;
  }
  get newVersion(): string {
    return this._newVersion;
  }

  constructor(private _oldVersion: string, private _newVersion: string, private migrators: IMigrator<any, any>[]) {}

  migrate(old: TOld): TNew {
    let result: any = old;

    for (let migrator of this.migrators) {
      result = migrator.migrate(result);
    }

    return result;
  }
}
