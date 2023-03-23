import { TimeTrackerBase } from '../../base/time-tracker-base.service';
import { TrackingStatus } from '../../enums/tracking-status';
import { Storage } from '../models/storage.model';
import { TimeEntry } from '../models/time-entry.model';

export class TimeTracker extends TimeTrackerBase<Storage, TimeEntry> {
  override get version(): string {
    return '2';
  }

  override async startTracking(): Promise<void> {
    if (this.getTrackingStatus() === TrackingStatus.Tracking) throw new Error('Already tracking.');

    if (!this.storage.times) this.storage.times = {};
    const project = await this._getProject();

    if (!this.storage.times[project]) {
      this.storage.times[project] = [];
    }

    this.storage.times[project].push({ from: new Date(), till: undefined, comment: undefined });
    await super.startTracking();
  }

  override async stopTracking(): Promise<void> {
    if (this.getTrackingStatus() !== TrackingStatus.Tracking) throw new Error('Not tracking.');
    const current = this.getCurrentEntry() as TimeEntry;
    current.till = new Date();
    this.storage.defaultProductivityFactor = this.storage.defaultProductivityFactor ?? 1;

    current.comment = await this.interaction.showInputBox('Enter a comment (optional):', undefined, []);
    if (current.comment === '') current.comment = undefined;

    if (this.storage.askForProductivityFactor) {
      const productivityFactor = await this.interaction.showInputBox(
        `Enter a productivity factor (optional, default: ${this.storage.defaultProductivityFactor}):`,
        undefined,
        [],
      );
      if (productivityFactor) {
        const f = parseFloat(productivityFactor);
        if (!Number.isNaN(f)) current.productivityFactor = f;
      }
    }
    await super.stopTracking();
  }

  async printTime(): Promise<void> {
    if (!this.storage.times) return;
    let project = await this._getProject(false);
    const times = this.storage.times[project] ?? [];
    const seconds = times.reduce((sum, x) => sum + this._getTimeSec(x) * (x.productivityFactor ?? this.storage.defaultProductivityFactor ?? 1), 0);
    super.printTimeInternal(seconds);
  }

  override allowMultipleProjects(): Promise<void> {
    this.storage.allowMultipleProjects = true;
    this.saveStorage();
    this.interaction.showInformationMessage('Multiple projects are now allowed.');
    return Promise.resolve();
  }

  override toggleAskProductivityFactor(): Promise<void> {
    this.storage.askForProductivityFactor = !this.storage.askForProductivityFactor;
    this.saveStorage();
    this.interaction.showInformationMessage(
      this.storage.askForProductivityFactor
        ? 'You will now be asked for a productivity factor.'
        : 'You will no longer be asked for a productivity factor.',
    );
    return Promise.resolve();
  }

  override getCurrentEntry(): TimeEntry | undefined {
    if (!this.storage.times) return undefined;

    for (let key of Object.keys(this.storage.times)) {
      const times = this.storage.times[key];
      const r = times.find((x) => x.till === undefined);
      if (r) return r;
    }
    return undefined;
  }

  private async _getProject(allowNew: boolean = true): Promise<string> {
    if (this.storage.allowMultipleProjects !== true) return 'index';

    if (!allowNew) return (await this.interaction.showQuickPick('Select a project:', Object.keys(this.storage.times ?? {}))) ?? 'index';

    const projects = this.storage.times ? Object.keys(this.storage.times) : [];
    let result = await this.interaction.showInputBox('Enter a project name (index):', 'index', projects);

    if (result === undefined || result === null || result === '') result = 'index';

    return result;
  }

  private _getTimeSec(entry: TimeEntry) {
    return ((entry.till ?? new Date()).getTime() - entry.from.getTime()) / 1000;
  }
}
