import * as path from 'path';
import * as vscode from 'vscode';

export const FILE_REL_PATH = '.vscode/times.json'; // TODO: move to config
export const NEWEST_VERSION = '3';

export function getPath(): string {
  try {
    const result = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!result) throw new Error('No workspace opened');
    return path.resolve(result, FILE_REL_PATH);
  } catch (e) {
    throw new Error('No workspace opened');
  }
}
