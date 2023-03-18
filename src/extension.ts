import * as vscode from 'vscode';
import { FileManager } from './helper/file-manager';
import { VSCodeService } from './vscode-service';

export function activate(context: vscode.ExtensionContext): void {
  let filePath = `${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/.vscode/times.json`;
  const fileManager = new FileManager();

  const vscodeService = new VSCodeService();
  // context.subscriptions.push(vscodeService.statusBarItem);
  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.startTrackingTime', () => {
      vscodeService.startTrackingTime();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.stopTrackingTime', () => {
      vscodeService.stopTrackingTime();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.totalTimeSpent', () => {
      vscodeService.getTotalTime();
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders((event) => {
      vscodeService.checkTimesAvailability();
    }),
  );

  vscodeService.checkTimesAvailability();
}
