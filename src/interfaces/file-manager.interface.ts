export interface IFileManager {
  isSaving(): boolean;
  writeToFile(filePath: string, data: any): void;
  readFromFile(filePath: string): any;
}
