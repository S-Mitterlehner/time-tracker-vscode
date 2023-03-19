import * as path from 'path';
import { FileManager } from './file-manager';
import { IInteractionService } from '../interfaces/interaction-service.interface';
import { ITimeTracker } from '../interfaces/time-tracker.interface';
import { FileContent, FileContentV1, FileContentV2, create } from '../models/file-content';
import { TimeEntry } from '../models/time-entry';

export enum TrackingStatus {
  NotTracking = 'NotTracking',
  Tracking = 'Tracking',
  NotInWorkspace = 'NotInWorkspace',
}

const FILE_REL_PATH = '.vscode/times.json';

export class TimeTracker implements ITimeTracker {
  private _content!: FileContent;
  private _version: string = '1';

  project: string = 'index';

  constructor(private fileManager: FileManager, private interaction: IInteractionService) {}

  get trackingStatus(): TrackingStatus {
    const result = this._getCurrentEntry() !== undefined ? TrackingStatus.Tracking : TrackingStatus.NotTracking;
    return result;
  }

  async init(): Promise<void> {
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
    this.interaction.showInformationMessage('Started tracking work time.');
  }

  async stopTracking(): Promise<void> {
    if (this.trackingStatus !== TrackingStatus.Tracking) throw new Error('Not tracking.');
    const current = this._getCurrentEntry() as TimeEntry;

    current.comment = await this.interaction.showInputBox('Enter a comment (optional):', undefined, []);
    current.till = new Date();

    this.fileManager.writeToFile(path.resolve(this.interaction.getWorkspacePath(), FILE_REL_PATH), this._content);
    this.interaction.showInformationMessage('Stopped tracking work time.');
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
        const times = contentV2.times[project];
        seconds = times.reduce((sum, x) => sum + this._getTimeSec(x), 0);
        break;
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = Math.floor(seconds - hours * 3600 - minutes * 60);

    this.interaction.showInformationMessage(`You have worked ${hours} hour(s) ${minutes} minute(s) ${seconds} second(s).`);
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
        if (!this.project) throw new Error('No project selected.');
        const times = contentV2.times[this.project];
        return times.find((x) => x.till === undefined);
      default:
        throw new Error(`Unknown version: ${this._version}`);
    }
  }
}