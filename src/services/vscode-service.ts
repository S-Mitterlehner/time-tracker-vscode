import * as vscode from 'vscode';
import { TrackingStatus } from '../enums/tracking-status';
import { IInteractionService } from '../interfaces/interaction-service.interface';

export class VSCodeInteractionService implements IInteractionService {
  statusBarButton: vscode.StatusBarItem;

  constructor() {
    this.statusBarButton = vscode.window.createStatusBarItem('id', vscode.StatusBarAlignment.Left);
  }

  setButtonStatus(status: TrackingStatus): void {
    switch (status) {
      case TrackingStatus.NotTracking:
        this.statusBarButton.text = '▶ Start Tracking';
        this.statusBarButton.tooltip = 'Click to start tracking time';
        this.statusBarButton.command = 'time-tracker.startTrackingTime';
        this.statusBarButton.show();
        break;
      case TrackingStatus.Tracking:
        this.statusBarButton.text = 'Tracking...';
        this.statusBarButton.tooltip = 'Click to stop tracking time';
        this.statusBarButton.command = 'time-tracker.stopTrackingTime';
        this.statusBarButton.show();
        break;
      default:
        this.statusBarButton.hide();
        break;
    }
  }

  getWorkspacePath(): string {
    try {
      const result = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!result) throw new Error('No workspace opened');
      return result;
    } catch (e) {
      throw new Error('No workspace opened');
    }
  }

  showInformationMessage(message: string): void {
    vscode.window.showInformationMessage(message);
  }

  async showInputBox(message: string, placeholder: string | undefined = undefined, suggestions: string[] = []): Promise<string | undefined> {
    let disposable: vscode.Disposable | undefined;
    if (suggestions.length > 0) {
      disposable = vscode.languages.registerCompletionItemProvider('*', {
        provideCompletionItems(document, position) {
          let completionItems = suggestions.map((suggestion) => {
            let item = new vscode.CompletionItem(suggestion);
            item.kind = vscode.CompletionItemKind.Text;
            return item;
          });
          return completionItems;
        },
      });
    }

    const result = await vscode.window.showInputBox({ prompt: message, placeHolder: placeholder });
    disposable?.dispose();
    return result;
  }

  async showYesNoQuestion(message: string): Promise<boolean> {
    return (await vscode.window.showInformationMessage(message, 'Yes', 'No')) === 'Yes';
  }

  async showQuickPick(message: string, values: string[]): Promise<string> {
    return (await vscode.window.showQuickPick(values, { placeHolder: message })) ?? 'index';
  }
}
