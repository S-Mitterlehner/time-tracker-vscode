import * as fs from 'fs';

export class FileManager {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public writeToFile(data: any) {
    fs.writeFileSync(this.filePath, JSON.stringify(data));
  }

  public readFromFile() {
    if (!fs.existsSync(this.filePath)) {
      return null;
    }

    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }
}
