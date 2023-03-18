/**
 *
 * THIS IS THE OLD VERSION -> Remove after rework
 *
 *
 */

// import * as vscode from 'vscode';
// import { FileManager } from './helper/file-manager';
// import { TimeTracker } from './time-tracker';

// export class VSCodeService {
//   constructor(private fileManager: FileManager, private timeTracker: TimeTracker) { }

//   public startTrackingTime(): void {
//     this.timeTracker.start();
//     vscode.window.showInformationMessage('Started tracking work time.');
//   }

//   public stopTrackingTime(): void {
//     vscode.window.showInputBox({ prompt: 'Enter a comment (optional):' }).then((comment?: string) => {
//       this.timeTracker.stop(comment);
//       vscode.window.showInformationMessage('Stopped tracking work time.');
//     });
//   }

//   public getTotalTime(): void {
//     this.timeTracker.getTotalTime();
//   }

//   public checkTimesAvailability(): void {
//     const data = this.fileManager.readFromFile(this.getRootPath());
//     if (data && data.length > 0) {
//       vscode.window.showInformationMessage('Do you want to start a new time tracking session?', 'Yes', 'No').then((choice) => {
//         if (choice === 'Yes') {
//           this.timeTracker.start();
//         }
//       });
//     }
//   }

//   private getRootPath(): string {
//     let r = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
//   }
// }
