import * as vscode from 'vscode';
import { FileManager } from './file-manager';
import { TimeTracker } from './time-tracker';

export function activate(context: vscode.ExtensionContext) {
  const rootPath = vscode.workspace.rootPath;
  if (!rootPath) {
    throw new Error('Unable to find root path.');
  }

  const filePath = `${rootPath}/.vscode/times.json`;
  const fileManager = new FileManager(filePath);
  const timeTracker = new TimeTracker(fileManager);

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.startTrackingTime', () => {
      timeTracker.start();
      vscode.window.showInformationMessage('Started tracking work time.');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.stopTrackingTime', () => {
      vscode.window.showInputBox({ prompt: 'Enter a comment (optional):' }).then((comment?: string) => {
        timeTracker.stop(comment);
        vscode.window.showInformationMessage('Stopped tracking work time.');
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.totalTimeSpent', () => {
      timeTracker.getTotalTime();
    }),
  );
}
