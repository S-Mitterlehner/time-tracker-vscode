import * as fs from 'fs';
import * as path from 'path';
import { IFileManager } from '../interfaces/file-manager.interface';

const formattedRegex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const utcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export class FileManager implements IFileManager {
  private _isSaving = false;
  isSaving(): boolean {
    const result = this._isSaving;
    if (result) setTimeout(() => (this._isSaving = false), 500); // Bugfix for init on save
    return result;
  }

  public writeToFile(filePath: string, data: any): void {
    this._isSaving = true;
    const folder = path.dirname(filePath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFileSync(
      filePath,
      JSON.stringify(
        data,
        (key, value) => {
          if (value !== undefined && utcRegex.test(value.toString())) {
            value = new Date(Date.parse(value));
            const year = value.getFullYear();
            const month = ('00' + (value.getMonth() + 1)).slice(-2);
            const day = ('00' + value.getDate()).slice(-2);
            const hour = ('00' + value.getHours()).slice(-2);
            const minute = ('00' + value.getMinutes()).slice(-2);
            const second = ('00' + value.getSeconds()).slice(-2);

            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          }
          return value;
        },
        2,
      ),
    );
  }

  public readFromFile(filePath: string): any {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data, (key, value) => {
      if (typeof value === 'string' && formattedRegex.test(value)) {
        return new Date(Date.parse(value));
      }
      return value;
    });
  }
}
