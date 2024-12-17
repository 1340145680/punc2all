import { commentRegexMap } from "./config";

import * as vscode from "vscode";
// 辅助函数：检查光标是否在字符串中
export function isCursorInString(lineText: string, cursorPosition: number): boolean {
  let inString = false;
  let stringChar = "";
  for (let i = 0; i < cursorPosition; i++) {
    const char = lineText[i];
    if (char === '"' || char === "'") {
      if (!inString || stringChar !== char) {
        inString = !inString;
        stringChar = char;
      }
    }
  }
  return inString;
}

// 辅助函数：检查光标是否在单行注释中
export function isCursorInComment(document: vscode.TextDocument, position: vscode.Position): boolean {
  const languageId = document.languageId;
  const regexString = commentRegexMap[languageId];
  if (!regexString) {
    return false;
  }
  const commentRegex = new RegExp(regexString, "g");
  const lineText = document.lineAt(position.line).text;
  const textBeforeCursor = lineText.substring(0, position.character);

  let inComment = false;
  let match: RegExpExecArray | null;
  while ((match = commentRegex.exec(textBeforeCursor)) !== null) {
    if (match.index <= position.character && commentRegex.lastIndex >= position.character) {
      inComment = true;
      break;
    }
  }
  return inComment;
}
