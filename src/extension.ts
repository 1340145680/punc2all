import * as vscode from "vscode";
import { isCursorInString, isCursorInComment } from "./utils";
import { mapTable } from "./config";

const commandKey = "punc2all.enableCorrection"; //命令名称

//创建状态栏按钮
const EnableText = "$(check) 标点转换"; //开启状态栏文本
const DisableText = "$(chrome-close) 标点转换"; //关闭状态栏文本
const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 300);
statusBarItem.text = EnableText;
statusBarItem.show();

let correctionstatus = false; //是否开启转换

//插件激活生命周期
export function activate({ subscriptions }: vscode.ExtensionContext) {
  console.log("%c 插件启动 ", "background:#6ec1c2");
  const disposable = vscode.commands.registerCommand(commandKey, () => {
    correctionstatus = !correctionstatus;
    statusBarItem.text = correctionstatus ? EnableText : DisableText;
  });
  subscriptions.push(disposable); //注册命令
  let run = false;
  vscode.workspace.onDidChangeTextDocument((e) => {
    if (interceptor(e)) return;
    if (run) return; //防止重复执行
    run = true;
    main().then(() => (run = false));
  }); //监听文档变化
}
//前置拦截器，返回ture拦截不执行main函数
function interceptor(e: vscode.TextDocumentChangeEvent): boolean {
  const editor = vscode.window.activeTextEditor;
  //如果没有激活的文档则拦截
  if (!vscode.window.activeTextEditor) return true;
  //如果没有内容变化则拦截
  if (e.contentChanges.length <= 0) return true;
  //如果关闭转换则拦截
  if (correctionstatus) return true;
  // 检查光标是否在字符串中
  const cursorPosition = editor.selection.active;
  const lineText = editor.document.lineAt(cursorPosition.line).text;
  if (isCursorInString(lineText, cursorPosition.character)) return true;
  // 检查光标是否在注释中
  if (isCursorInComment(e.document, editor.selection.active)) return true;
  //最后检查最后一个字符是不在配置文件里则拦截,否则不拦截
  return !(e.contentChanges[0].text in mapTable);
}

//主函数
async function main() {
  const editor = vscode.window.activeTextEditor;
  const document = editor.document;
  const selection = editor.selection;
  const position = selection.active;
  const line = document.lineAt(position.line);
  const text = line.text;
  const lastText = text.charAt(position.character - 1);
  const newText = mapTable[lastText] || lastText;
  if (newText === lastText) return;
  const range = new vscode.Range(position.with({ character: position.character - 1 }), position);
  await editor.edit((editBuilder) => editBuilder.insert(position, newText));
  await vscode.commands.executeCommand("type", { text: newText });
  //如果是引号则再次补全引号
  if (newText == '"' || newText == "'") {
    const originalPosition = editor.selection.active;
    await vscode.commands.executeCommand("type", { text: newText });
    editor.selection = new vscode.Selection(originalPosition, originalPosition); // 复原光标位置
  }
  await editor.edit((editBuilder) => editBuilder.delete(range));
}