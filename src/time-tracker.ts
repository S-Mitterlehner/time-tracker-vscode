import * as vscode from 'vscode';
import { FileManager } from './file-manager';

export class TimeTracker {
  private startTime: Date | undefined;
  private readonly fileManager: FileManager;
  private totalTimeInSeconds = 0;

  constructor() {
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) {
      throw new Error('Unable to find root path.');
    }

    const filePath = `${rootPath}/work-time.json`;
    this.fileManager = new FileManager(filePath);
  }

  public start() {
    if (this.startTime) {
      vscode.window.showErrorMessage('Work time is already being tracked.');
      return;
    }

    this.startTime = new Date();
  }

  public stop(comment?: string) {
    if (!this.startTime) {
      vscode.window.showErrorMessage('Work time is not being tracked.');
      return;
    }

    const fromTime = this.getTimeString(this.startTime);
    const tillTime = this.getTimeString(new Date());
    const duration = (new Date().getTime() - this.startTime.getTime()) / 1000;
    this.totalTimeInSeconds += duration;

    const data = this.fileManager.readFromFile() || { entries: [] };
    data.entries.push({ from: fromTime, till: tillTime, comment: comment || '', duration: duration });
    this.fileManager.writeToFile(data);

    this.startTime = undefined;
  }

  public getTotalTime() {
    const data = this.fileManager.readFromFile();
    if (!data || !data.entries || data.entries.length === 0) {
      vscode.window.showInformationMessage('No work time has been tracked yet.');
      return;
    }

    const totalDurationInSeconds = data.entries.reduce((total: number, entry: any) => total + entry.duration, 0);
    const hours = Math.floor(totalDurationInSeconds / 3600);
    const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
    const seconds = Math.floor(totalDurationInSeconds % 60);
    const message = `Total work time: ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;

    vscode.window.showInformationMessage(message);
  }

  private getTimeString(date: Date) {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
