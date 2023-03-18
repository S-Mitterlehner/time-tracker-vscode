import path = require('path');
import { FileManager } from '../helper/file-manager';
import { FileContent, FileContentV1, FileContentV2, create } from '../models/file-content';
import { TimeEntry } from '../models/time-entry';
import { IInteractionService } from './vscode-service';

export enum TrackingStatus {
  NotTracking = 'NotTracking',
  Tracking = 'Tracking',
  NotInWorkspace = 'NotInWorkspace',
}

export interface ITimeTracker {
  get trackingStatus(): TrackingStatus;
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  getTotalTimeMin(): Promise<number>;
}

const FILE_REL_PATH = '.vscode/times.json';

export class TimeTracker implements ITimeTracker {
  private _content!: FileContent;
  private _version: string = '1';

  project: string = 'index';

  constructor(private _fileManager: FileManager, private _workspacePath: string, private interaction: IInteractionService) {
    this._content = this._fileManager.readFromFile(path.resolve(this._workspacePath, FILE_REL_PATH));
    if (!this._content) {
      this._content = create();
    } else {
      if ((this._content as any)['version']) {
        this._version = (this._content as FileContentV2).version;
      } else {
        this._version = '1';
      }
    }
  }

  get trackingStatus(): TrackingStatus {
    return this._getCurrentEntry() !== undefined ? TrackingStatus.Tracking : TrackingStatus.NotTracking;
  }

  async startTracking() {
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
    this._fileManager.writeToFile(path.resolve(this._workspacePath, FILE_REL_PATH), this._content);
    this.interaction.showInformationMessage('Started tracking work time.');
  }

  async stopTracking(): Promise<void> {
    if (this.trackingStatus !== TrackingStatus.Tracking) throw new Error('Not tracking.');
    const current = this._getCurrentEntry() as TimeEntry;

    current.comment = await this.interaction.showInputBox('Enter a comment (optional):', undefined, []);
    current.till = new Date();

    this._fileManager.writeToFile(path.resolve(this._workspacePath, FILE_REL_PATH), this._content);
    this.interaction.showInformationMessage('Stopped tracking work time.');
  }

  async getTotalTimeMin(): Promise<number> {
    switch (this._version) {
      case '1':
        const contentV1 = this._content as FileContentV1;
        return contentV1.reduce((sum, x) => sum + this._getTimeMin(x), 0);
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (!contentV2.times) return 0;
        let project = await this._getProject(false);
        const times = contentV2.times[project];
        return times.reduce((sum, x) => sum + this._getTimeMin(x), 0);
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
  }

  private async _getProject(allowNew: boolean = true): Promise<string> {
    if (this.project) return this.project;

    switch (this._version) {
      case '1':
        throw new Error('Not supported');
        break;
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (contentV2.allowMultipleProjects !== true) return 'index';

        if (!allowNew) return (await this.interaction.showQuickPick('Select a project:', Object.keys(contentV2.times ?? {}))) ?? 'index';

        const projects = contentV2.times ? Object.keys(contentV2.times) : [];
        return (await this.interaction.showInputBox('Enter a project name (index):', 'index', projects)) ?? 'index';
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
  }

  private _getTimeMin(entry: TimeEntry) {
    return (entry.till ?? new Date()).getTime() - entry.from.getTime() / 1000 / 60;
  }

  private _getCurrentEntry(): TimeEntry | undefined {
    switch (this._version) {
      case '1':
        const contentV1 = this._content as FileContentV1;
        return contentV1.find((x) => x.till === undefined);
      case '2':
        const contentV2 = this._content as FileContentV2;
        if (!contentV2.times) return undefined;
        if (!this.project) throw new Error('No project selected.');
        const times = contentV2.times[this.project];
        return times.find((x) => x.till === undefined);
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
  }
}
