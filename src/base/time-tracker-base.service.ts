import { getPath } from '../contants';
import { TrackingStatus } from '../enums/tracking-status';
import { IFileManager } from '../interfaces/file-manager.interface';
import { IInteractionService } from '../interfaces/interaction-service.interface';
import { ITimeTrackerSpecific } from '../interfaces/time-tracker.interface';

export abstract class TimeTrackerBase<TStorage, TTimeEntry> implements ITimeTrackerSpecific<TStorage> {
  abstract get version(): string;

  constructor(protected storage: TStorage, protected fileManager: IFileManager, protected interaction: IInteractionService) {
    this.interaction.setButtonStatus(this.getTrackingStatus());
  }

  getTrackingStatus(): TrackingStatus {
    return this.getCurrentEntry() !== undefined ? TrackingStatus.Tracking : TrackingStatus.NotTracking;
  }

  async startTracking(): Promise<void> {
    await this.fileManager.writeToFile(getPath(), this.storage);
    this.interaction.setButtonStatus(TrackingStatus.Tracking);
    this.interaction.showInformationMessage('Started tracking work time.');
  }

  async stopTracking(): Promise<void> {
    await this.fileManager.writeToFile(getPath(), this.storage);
    this.interaction.setButtonStatus(TrackingStatus.NotTracking);
    this.interaction.showInformationMessage('Stopped tracking work time.');
  }

  abstract printTime(): Promise<void>;

  allowMultipleProjects(): Promise<void> {
    throw new Error('Not available in this version. Please migrate to a newer version.');
  }

  toggleAskProductivityFactor(): Promise<void> {
    throw new Error('Not available in this version. Please migrate to a newer version.');
  }

  protected abstract getCurrentEntry(): TTimeEntry | undefined;

  protected saveStorage(): void {
    this.fileManager.writeToFile(getPath(), this.storage);
  }

  protected printTimeInternal(seconds: number): void {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = Math.floor(seconds - hours * 3600 - minutes * 60);

    this.interaction.showInformationMessage(`You have worked ${hours} hour(s) ${minutes} minute(s) ${seconds} second(s).`);
  }
}
