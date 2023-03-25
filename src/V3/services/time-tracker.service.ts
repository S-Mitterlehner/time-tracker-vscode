import { TimeTrackerBase } from '../../base/time-tracker-base.service';
import { IFileManager } from '../../interfaces/file-manager.interface';
import { IInteractionService } from '../../interfaces/interaction-service.interface';
import { TimeEntry } from '../models/time-entry.model';
import { Storage } from '../models/storage.model';

// TODO: Implement this class
export class TimeTracker extends TimeTrackerBase<Storage, TimeEntry> {
  override get version(): string {
    return '2';
  }

  constructor(storage: Storage, private _fileManager: IFileManager, private _interaction: IInteractionService) {
    super(storage, _fileManager, _interaction);
  }

  printTime(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected getCurrentEntry(): TimeEntry | undefined {
    throw new Error('Method not implemented.');
  }
}
