import { TrackingStatus } from '../enums/tracking-status';
import { IConfiguration } from './configuration.interface';

export interface IInteractionService {
  setButtonStatus(status: TrackingStatus): void;
  showInformationMessage(message: string): void;
  showInputBox(message: string, placeholder: string | undefined, suggestions: string[]): Promise<string | undefined>;
  showYesNoQuestion(message: string): Promise<boolean>;
  showQuickPick(message: string, values: string[]): Promise<string>;
  fillConfig(data: IConfiguration): void;
}
