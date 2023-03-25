import * as vscode from 'vscode';
import { TrackingStatus } from './enums/tracking-status';
import { IFileManager } from './interfaces/file-manager.interface';
import { IInteractionService } from './interfaces/interaction-service.interface';
import { ITimeTracker } from './interfaces/time-tracker.interface';
import { FileManager } from './services/file-manager';
import { TimeTrackerFactory } from './factories/time-tracker-factory';
import { VSCodeInteractionService } from './services/vscode-service';
import { createMigratorManager } from './migrations';

const fileManager: IFileManager = new FileManager();
const vscService: IInteractionService = new VSCodeInteractionService();
const migrator = createMigratorManager(fileManager, vscService);
const factory = new TimeTrackerFactory(fileManager, vscService);
let timeTracker: ITimeTracker | undefined = undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // V1
  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.init', async () => {
      if (fileManager.isSaving()) return;
      timeTracker = factory.createFromWorkspace();
    }),
    vscode.commands.registerCommand('time-tracker.startTrackingTime', async () => {
      try {
        await timeTracker?.startTracking();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
    vscode.commands.registerCommand('time-tracker.stopTrackingTime', async () => {
      try {
        await timeTracker?.stopTracking();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
    vscode.commands.registerCommand('time-tracker.totalTimeSpent', () => {
      try {
        timeTracker?.printTime();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
  );

  // V2
  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.allowMultipleProjects', async () => {
      try {
        await timeTracker?.allowMultipleProjects();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
    vscode.commands.registerCommand('time-tracker.toggleAskProductivityFactor', () => {
      try {
        timeTracker?.toggleAskProductivityFactor();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
  );

  // Migrate
  context.subscriptions.push(
    vscode.commands.registerCommand('time-tracker.migrate', () => {
      try {
        migrator.checkAndMigrate(true).then((migrated) => {
          if (migrated) vscode.commands.executeCommand('time-tracker.init');
        });
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }),
  );

  // Watcher
  const watcher = vscode.workspace.createFileSystemWatcher(`${vscode.workspace.workspaceFolders?.[0].uri.fsPath}/.vscode/times.json`);
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      if (timeTracker?.getTrackingStatus() === TrackingStatus.Tracking) await timeTracker?.stopTracking();
      vscode.commands.executeCommand('time-tracker.init');
    }),
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

  migrator.checkAndMigrate(false).then((migrated) => {
    if (migrated) vscode.commands.executeCommand('time-tracker.init');
  });
  timeTracker = factory.createFromWorkspace();
}

export async function deactivate(): Promise<void> {
  if (timeTracker?.getTrackingStatus() === TrackingStatus.Tracking) await timeTracker?.stopTracking();
}
