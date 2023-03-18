/**
 *
 * THIS IS THE OLD VERSION -> Remove after rework
 *
 *
 */

// import * as vscode from 'vscode';
// import { FileManager } from './helper/file-manager';
// import { TimeEntry } from './models/time-entry';

// export class TimeTracker {
//   private startTime: Date | undefined;

//   constructor(private fileManager: FileManager) {}

//   public start() {
//     if (this.startTime) {
//       vscode.window.showErrorMessage('Work time is already being tracked.');
//       return;
//     }

//     this.startTime = new Date();
//   }

//   public stop(comment?: string) {
//     if (!this.startTime) {
//       vscode.window.showErrorMessage('Work time is not being tracked.');
//       return;
//     }

//     const data: TimeEntry[] = this.fileManager.readFromFile() || [];
//     data.push({ from: this.startTime, till: new Date(), comment: comment });
//     this.fileManager.writeToFile(data);

//     this.startTime = undefined;
//   }

//   public getTotalTime() {
//     const data = this.fileManager.readFromFile();
//     if (!data || !data.entries || data.entries.length === 0) {
//       vscode.window.showInformationMessage('No work time has been tracked yet.');
//       return;
//     }

//     const totalDurationInSeconds = data.entries.reduce((total: number, entry: TimeEntry) => total + this.getSeconds(entry.from, entry.till), 0);
//     const hours = Math.floor(totalDurationInSeconds / 3600);
//     const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
//     const seconds = Math.floor(totalDurationInSeconds % 60);
//     const message = `Total work time: ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;

//     vscode.window.showInformationMessage(message);
//   }

//   public isTracking(): boolean {
//     return !!this.startTime;
//   }

//   private getSeconds(start: Date, end: Date) {
//     return (end.getTime() - start.getTime()) / 1000;
//   }
// }
