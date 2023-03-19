import * as vscode from 'vscode';
import { FileManager } from './services/file-manager';
import { TimeTracker } from './services/time-tracker';
import { VSCodeInteractionService } from './services/vscode-service';

const fileManager = new FileManager();
const vscService = new VSCodeInteractionService();
const timeTracker = new TimeTracker(fileManager, vscService);

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  context.subscriptions.push(vscode.commands.registerCommand('time-tracker.init', async () => await timeTracker.init()));

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.startTrackingTime', async () => {
      try {
        await timeTracker.startTracking();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.stopTrackingTime', async () => {
      try {
        await timeTracker.stopTracking();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.totalTimeSpent', () => {
      timeTracker.printTime();
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      await timeTracker.stopTracking();
      await timeTracker.init();
    }),
  );

  await timeTracker.init();
}

export async function deactivate(): Promise<void> {
  await timeTracker.stopTracking();
}
