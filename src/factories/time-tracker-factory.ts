import { IFileManager } from '../interfaces/file-manager.interface';
import { ITimeTracker } from '../interfaces/time-tracker.interface';
import { IInteractionService } from '../interfaces/interaction-service.interface';
import { getPath } from '../contants';
import * as V1 from '../V1';
import * as V2 from '../V2';

export type Storage = V1.Storage | StorageWithVersion;
export type StorageWithVersion = V2.Storage;

export class TimeTrackerFactory {
  constructor(private _fileManager: IFileManager, private _interaction: IInteractionService) {}

  private _createNewsest(): ITimeTracker {
    return new V2.TimeTracker(new V2.Storage(), this._fileManager, this._interaction);
  }

  create(storage: Storage | undefined): ITimeTracker {
    if (!storage) {
      return this._createNewsest();
    }

    if (!(storage as any)['version']) {
      return new V1.TimeTracker(storage as V1.Storage, this._fileManager, this._interaction);
    }

    const s = storage as StorageWithVersion;

    switch (s.version) {
      case '2':
        return new V2.TimeTracker(s, this._fileManager, this._interaction);
      default:
        throw new Error(`Unknown version: ${s.version}`);
    }
  }

  createFromWorkspace(): ITimeTracker {
    const storage = this._fileManager.readFromFile(getPath());
    return this.create(storage);
  }
}
