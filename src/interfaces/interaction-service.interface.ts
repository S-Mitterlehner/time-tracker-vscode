export interface IInteractionService {
  getWorkspacePath(): string;
  showInformationMessage(message: string): void;
  showInputBox(message: string, placeholder: string | undefined, suggestions: string[]): Promise<string | undefined>;
  showYesNoQuestion(message: string): Promise<boolean>;
  showQuickPick(message: string, values: string[]): Promise<string>;
}
