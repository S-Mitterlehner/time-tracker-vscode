import * as vscode from 'vscode';
import { IInteractionService } from '../interfaces/interaction-service.interface';

export class VSCodeInteractionService implements IInteractionService {
  getWorkspacePath(): string {
    try {
      const result = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!result) throw new Error('No workspace opened');
      console.log('getWorkspacePath', result);
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
      // TODO: try
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
