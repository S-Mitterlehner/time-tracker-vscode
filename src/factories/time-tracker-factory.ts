import { IFileManager } from '../interfaces/file-manager.interface';
import { ITimeTracker } from '../interfaces/time-tracker.interface';
import { IInteractionService } from '../interfaces/interaction-service.interface';
import { getPath } from '../contants';
import * as V1 from '../V1';
import * as V2 from '../V2';
import * as V3 from '../V3';
import { IConfiguration } from '../interfaces/configuration.interface';

export type Storage = V1.Storage | StorageWithVersion;
export type StorageWithVersion = V2.Storage | V3.Storage;

export class TimeTrackerFactory {
  constructor(private _fileManager: IFileManager, private _interaction: IInteractionService) {}

  private _createNewsest(config: IConfiguration): ITimeTracker {
    return new V3.TimeTracker(new V3.Storage(), this._fileManager, this._interaction, config);
  }

  create(storage: Storage | undefined): ITimeTracker {
    let config: IConfiguration = {
      allowMultipleProjects: false,
      askForProductivityFactor: false,
      defaultProductivityFactor: 1,
      defaultProject: 'index',
    };
    this._interaction.fillConfig(config);

    if (!storage) {
      return this._createNewsest(config);
    }

    if (!(storage as any)['version']) {
      return new V1.TimeTracker(storage as V1.Storage, this._fileManager, this._interaction);
    }

    const s = storage as StorageWithVersion;

    switch (s.version) {
      case '3':
        return new V3.TimeTracker(s as V3.Storage, this._fileManager, this._interaction, config);
      case '2':
        return new V2.TimeTracker(s as V2.Storage, this._fileManager, this._interaction);
      default:
        throw new Error(`Unknown version: ${s.version}`);
    }
  }

  createFromWorkspace(): ITimeTracker {
    const storage = this._fileManager.readFromFile(getPath());
    return this.create(storage);
  }
}
