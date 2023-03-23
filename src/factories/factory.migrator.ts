import { getPath, NEWEST_VERSION } from '../contants';
import { IFileManager } from '../interfaces/file-manager.interface';
import { IInteractionService } from '../interfaces/interaction-service.interface';
import { IMigrator } from '../interfaces/migrator.interface';

export class MigrationManager {
  private _migrators: IMigrator<any, any>[] = [];

  constructor(private fileManager: IFileManager, private interaction: IInteractionService, ...migrators: IMigrator<any, any>[]) {
    this._migrators = migrators;
  }

  async checkAndMigrate(userAction: boolean): Promise<boolean> {
    let storage = this.fileManager.readFromFile(getPath());

    if (storage.version >= NEWEST_VERSION) {
      if (userAction) this.interaction.showInformationMessage('times.json is already on the newest version.');
      return false;
    }

    if (!userAction) {
      const r = await this.interaction.showYesNoQuestion('Do you want to migrate to the newest version?');
      if (r) return await this.migrate(storage);
    } else {
      return await this.migrate(storage);
    }

    return false;
  }

  migrate(storage: any): Promise<boolean> {
    const newStorage = this.getMigrator(storage.version ?? '1', NEWEST_VERSION)?.migrate(storage);
    this.fileManager.writeToFile(getPath(), newStorage);
    this.interaction.showInformationMessage('times.json has been migrated to the newest version.');
    return Promise.resolve(true);
  }

  getMigrator<TOld, TNew>(oldVersion: string, newVersion: string): IMigrator<TOld, TNew> | undefined {
    const result = this._migrators.find((m) => m.oldVersion === oldVersion && m.newVersion === newVersion);
    return result;
  }
}
