import { TimeTrackerBase } from '../../base/time-tracker-base.service';
import { IFileManager } from '../../interfaces/file-manager.interface';
import { IInteractionService } from '../../interfaces/interaction-service.interface';
import { TimeEntry } from '../models/time-entry.model';
import { Storage } from '../models/storage.model';
import { IConfiguration } from '../../interfaces/configuration.interface';
import { TrackingStatus } from '../../enums/tracking-status';
import { Project } from '../models/project.model';

export class TimeTracker extends TimeTrackerBase<Storage, TimeEntry> {
  override get version(): string {
    return '2';
  }

  constructor(storage: Storage, private _fileManager: IFileManager, private _interaction: IInteractionService, private _config: IConfiguration) {
    super(storage, _fileManager, _interaction);
  }

  override async startTracking(): Promise<void> {
    if (this.getTrackingStatus() === TrackingStatus.Tracking) throw new Error('Already tracking.');

    if (!this.storage.projects) this.storage.projects = {};
    const project = await this._getProject();

    if (!this.storage.projects[project]) {
      this.storage.projects[project] = new Project();
    }

    this.storage.projects[project].times!.push({ from: new Date(), till: undefined, comment: undefined });
    await super.startTracking();
  }

  override async stopTracking(): Promise<void> {
    if (this.getTrackingStatus() !== TrackingStatus.Tracking) throw new Error('Not tracking.');
    const current = this.getCurrentEntry() as TimeEntry;
    current.till = new Date();

    current.comment = await this.interaction.showInputBox('Enter a comment (optional):', undefined, []);
    if (current.comment === '') current.comment = undefined;

    if (this._config.askForProductivityFactor) {
      const productivityFactor = await this.interaction.showInputBox(
        `Enter a productivity factor (optional, default: ${this._config.askForProductivityFactor}):`,
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
    if (!this.storage.projects) return;
    let project = await this._getProject(false);
    const times = this.storage.projects[project].times ?? [];
    const seconds = times.reduce((sum, x) => sum + this._getTimeSec(x) * (x.productivityFactor ?? this._config.defaultProductivityFactor ?? 1), 0);
    super.printTimeInternal(seconds);
  }

  override allowMultipleProjects(): Promise<void> {
    throw new Error('Not supported for this version. Please set the allowMultipleProjects property in the vscode-settings.');
  }

  override toggleAskProductivityFactor(): Promise<void> {
    throw new Error('Not supported for this version. Please set the askProductivityFactor property in the vscode-settings.');
  }

  override getCurrentEntry(): TimeEntry | undefined {
    if (!this.storage.projects) return undefined;

    for (let key of Object.keys(this.storage.projects)) {
      const times = this.storage.projects[key].times!;
      const r = times.find((x) => x.till === undefined);
      if (r) return r;
    }
    return undefined;
  }

  private async _getProject(allowNew: boolean = true): Promise<string> {
    if (this._config.allowMultipleProjects !== true) return 'index';

    if (!allowNew) return (await this.interaction.showQuickPick('Select a project:', Object.keys(this.storage.projects ?? {}))) ?? 'index';

    const projects = this.storage.projects ? Object.keys(this.storage.projects) : [];
    let result = await this.interaction.showInputBox('Enter a project name (index):', 'index', projects);

    if (result === undefined || result === null || result === '') result = this._config.defaultProject ?? 'index';

    return result;
  }

  private _getTimeSec(entry: TimeEntry) {
    return ((entry.till ?? new Date()).getTime() - entry.from.getTime()) / 1000;
  }
}
