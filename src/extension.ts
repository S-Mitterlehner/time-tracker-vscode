import * as vscode from 'vscode';
import { MigratorFactory } from './migrators/factory.migrator';
import { V1ToV2Migrator } from './migrators/v1-to-v2.migrator';
import { FileManager } from './services/file-manager';
import { TimeTracker } from './services/time-tracker';
import { VSCodeInteractionService } from './services/vscode-service';

const migratorFactory = new MigratorFactory(new V1ToV2Migrator());
const fileManager = new FileManager();
const vscService = new VSCodeInteractionService();
const timeTracker = new TimeTracker(fileManager, vscService, migratorFactory);

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
    vscode.commands.registerCommand('time-tracker.stopTrackingTime', async () => {
      try {
        await timeTracker.stopTracking();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
    vscode.commands.registerCommand('time-tracker.totalTimeSpent', () => {
      timeTracker.printTime();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.allowMultipleProjects', async () => {
      await timeTracker.allowMultipleProjects();
    }),
    vscode.commands.registerCommand('time-tracker.migrate', () => {
      timeTracker.migrate();
    }),
    vscode.commands.registerCommand('time-tracker.toggleAskProductivityFactor', () => {
      timeTracker.toggleAskProductivityFactor();
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      await timeTracker.stopTracking();
      await timeTracker.init();
    }),
  );

  const watcher = vscode.workspace.createFileSystemWatcher(`${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/.vscode/times.json`);
  context.subscriptions.push(
    watcher.onDidChange((event) => {
      vscode.commands.executeCommand('time-tracker.init');
    }),
    watcher.onDidCreate((event) => {
      vscode.commands.executeCommand('time-tracker.init');
    }),
  );

  const item = vscode.window.createStatusBarItem('id', vscode.StatusBarAlignment.Left);

  item.color = 'white';
  item.text = 'Time Tracker';
  item.tooltip = 'Click to start tracking time';
  item.command = 'time-tracker.startTrackingTime';

  await timeTracker.init();
}

export async function deactivate(): Promise<void> {
  await timeTracker.stopTracking();
}
