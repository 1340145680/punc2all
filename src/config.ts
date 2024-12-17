//获取配置文件并使用懒加载更新
import * as vscode from "vscode";

const getConfig = <T>(key: string, defaultValue: T): T => vscode.workspace.getConfiguration("punc2all").get<T>(key, defaultValue);
let mapTable = getConfig("mapTable", {}); //初始化字符映射表
let commentRegexMap = getConfig<{ [languageId: string]: string }>("commentRegexMap", {});
// 监听配置变化并更新变量
vscode.workspace.onDidChangeConfiguration((e) => {
  mapTable = getConfig("mapTable", {});
  commentRegexMap = getConfig("commentRegexMap", {});
});

export { mapTable, commentRegexMap };
