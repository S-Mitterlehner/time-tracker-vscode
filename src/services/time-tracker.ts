import * as path from 'path';
import { FileManager } from './file-manager';
import { IInteractionService } from '../interfaces/interaction-service.interface';
import { ITimeTracker } from '../interfaces/time-tracker.interface';
import { FileContent, FileContentV1, FileContentV2, create, CURRENT_VERSION } from '../models/file-content';
import { TimeEntry } from '../models/time-entry';
import { TrackingStatus } from '../enums/tracking-status';
import { MigratorFactory } from '../migrators/factory.migrator';

const FILE_REL_PATH = '.vscode/times.json';

export class TimeTracker implements ITimeTracker {
  private _content!: FileContent;
  private _version: string = '1';

  project?: string;

  constructor(private fileManager: FileManager, private interaction: IInteractionService, private migratorFactory: MigratorFactory) {}

  get trackingStatus(): TrackingStatus {
    const result = this._getCurrentEntry() !== undefined ? TrackingStatus.Tracking : TrackingStatus.NotTracking;
    return result;
  }

  async init(): Promise<void> {
    this.project = undefined;
    this._version = '';
    this._content = this.fileManager.readFromFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH));

    if (!this._content) {
      this._content = create();
      this._version = this._content.version;
    } else {
      if ((this._content as any)['version']) {
        this._version = (this._content as FileContentV2).version;
      } else {
        this._version = '1';
      }
    }

    if (this._version < CURRENT_VERSION) {
      this.interaction.showYesNoQuestion('Do you want to migrate to the newest version?').then((result) => {
        if (result) this.migrate();
      });
    }

    this.interaction.setButtonStatus(this.trackingStatus);
  }

  async startTracking() {
    if (this.trackingStatus === TrackingStatus.Tracking) throw new Error('Already tracking.');
    switch (this._version) {
      case '1':
        const contentV1 = this._content as FileContentV1;
        contentV1.push({ from: new Date(), till: undefined, comment: undefined });
        break;
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (!contentV2.times) contentV2.times = {};
        this.project = await this._getProject();

        if (!contentV2.times[this.project]) {
          contentV2.times[this.project] = [];
        }

        contentV2.times[this.project].push({ from: new Date(), till: undefined, comment: undefined });
        break;
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
    this.fileManager.writeToFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH), this._content);
    this.interaction.setButtonStatus(TrackingStatus.Tracking);
    this.interaction.showInformationMessage('Started tracking work time.');
  }

  async stopTracking(): Promise<void> {
    if (this.trackingStatus !== TrackingStatus.Tracking) throw new Error('Not tracking.');
    const current = this._getCurrentEntry() as TimeEntry;

    current.comment = await this.interaction.showInputBox('Enter a comment (optional):', undefined, []);
    if (current.comment === '') current.comment = undefined;
    current.till = new Date();

    if (this._version === '2') {
      const contentV2 = this._getContentAsV2Safe();

      contentV2.defaultProductivityFactor = contentV2.defaultProductivityFactor ?? 1;

      if (contentV2.askForProductivityFactor) {
        const productivityFactor = await this.interaction.showInputBox(
          `Enter a productivity factor (optional, default: ${contentV2.defaultProductivityFactor}):`,
          undefined,
          [],
        );
        if (productivityFactor) {
          const f = parseFloat(productivityFactor);
          if (!Number.isNaN(f)) current.productivityFactor = f;
        }
      }
    }

    this.fileManager.writeToFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH), this._content);
    this.interaction.setButtonStatus(TrackingStatus.NotTracking);
    this.interaction.showInformationMessage('Stopped tracking work time.');
    this.project = undefined;
  }

  async printTime(): Promise<void> {
    let seconds = 0;
    switch (this._version) {
      case '1':
        const contentV1 = this._content as FileContentV1;
        seconds = contentV1.reduce((sum, x) => sum + this._getTimeSec(x), 0);
        break;
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (!contentV2.times) break;
        let project = await this._getProject(false);
        const times = contentV2.times[project] ?? [];
        seconds = times.reduce((sum, x) => sum + this._getTimeSec(x) * (x.productivityFactor ?? contentV2.defaultProductivityFactor ?? 1), 0);
        break;
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = Math.floor(seconds - hours * 3600 - minutes * 60);

    this.interaction.showInformationMessage(`You have worked ${hours} hour(s) ${minutes} minute(s) ${seconds} second(s).`);
  }

  migrate(): void {
    if (this._version >= CURRENT_VERSION) {
      this.interaction.showInformationMessage('times.json is already on the newest version.');
      return;
    }

    this._content = this.migratorFactory.getMigrator(this._version, CURRENT_VERSION)?.migrate(this._content as FileContent) as FileContent;
    this._version = CURRENT_VERSION;
    this.fileManager.writeToFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH), this._content);
    this.interaction.showInformationMessage('times.json has been migrated to the newest version.');
  }

  allowMultipleProjects(): Promise<void> {
    const contentV2 = this._getContentAsV2Safe();
    contentV2.allowMultipleProjects = true;
    this.fileManager.writeToFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH), this._content);
    this.interaction.showInformationMessage('Multiple projects are now allowed.');
    return Promise.resolve();
  }

  toggleAskProductivityFactor() {
    const contentV2 = this._getContentAsV2Safe();
    contentV2.askForProductivityFactor = !contentV2.askForProductivityFactor;
    this.fileManager.writeToFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH), this._content);
    this.interaction.showInformationMessage(
      contentV2.askForProductivityFactor
        ? 'You will now be asked for a productivity factor.'
        : 'You will no longer be asked for a productivity factor.',
    );
    return Promise.resolve();
  }

  private _getContentAsV2Safe(): FileContentV2 {
    if (this._version === '1') throw new Error('Not supported! Please migrate to a newer version first.');
    const contentV2 = this._content as FileContentV2;
    return this._content as FileContentV2;
  }

  private async _getProject(allowNew: boolean = true): Promise<string> {
    if (this.project) return this.project;

    switch (this._version) {
      case '1':
        throw new Error('Not supported');
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (contentV2.allowMultipleProjects !== true) return 'index';

        if (!allowNew) return (await this.interaction.showQuickPick('Select a project:', Object.keys(contentV2.times ?? {}))) ?? 'index';

        const projects = contentV2.times ? Object.keys(contentV2.times) : [];
        let result = await this.interaction.showInputBox('Enter a project name (index):', 'index', projects);
        if (result === undefined || result === null || result === '') result = 'index';
        return result;
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
  }

  private _getTimeSec(entry: TimeEntry) {
    return ((entry.till ?? new Date()).getTime() - entry.from.getTime()) / 1000;
  }

  private _getCurrentEntry(): TimeEntry | undefined {
    switch (this._version) {
      case '1':
        const contentV1 = this._content as FileContentV1;
        return contentV1.find((x) => x.till === undefined);
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (!contentV2.times) return undefined;

        for (let key of Object.keys(contentV2.times)) {
          const times = contentV2.times[key];
          const r = times.find((x) => x.till === undefined);
          if (r) return r;
        }
        return undefined;
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
  }
}
