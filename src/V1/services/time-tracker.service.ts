import { TimeTrackerBase } from '../../base/time-tracker-base.service';
import { TrackingStatus } from '../../enums/tracking-status';
import { Storage } from '../models/storage.model';
import { TimeEntry } from '../models/time-entry.model';

export class TimeTracker extends TimeTrackerBase<Storage, TimeEntry> {
  override get version(): string {
    return '1';
  }

  override async startTracking(): Promise<void> {
    if (this.getTrackingStatus() === TrackingStatus.Tracking) throw new Error('Already tracking.');

    this.storage.push({ from: new Date(), till: undefined, comment: undefined });
    await super.startTracking();
  }

  async stopTracking(): Promise<void> {
    if (this.getTrackingStatus() !== TrackingStatus.Tracking) throw new Error('Not tracking.');
    const current = this.getCurrentEntry() as TimeEntry;

    current.comment = await this.interaction.showInputBox('Enter a comment (optional):', undefined, []);
    if (current.comment === '') current.comment = undefined;
    current.till = new Date();

    await super.stopTracking();
  }

  printTime(): Promise<void> {
    let seconds = this.storage.reduce((sum, x) => sum + this._getTimeSec(x), 0);
    super.printTimeInternal(seconds);
    return Promise.resolve();
  }

  private _getTimeSec(entry: TimeEntry) {
    return ((entry.till ?? new Date()).getTime() - entry.from.getTime()) / 1000;
  }

  override getCurrentEntry(): TimeEntry | undefined {
    return this.storage.find((x) => x.till === undefined);
  }
}
