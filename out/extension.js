"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const shortcuts_1 = require("./shortcuts");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    const shortcustProvider = new shortcuts_1.ShortcustProvider(rootPath);
    vscode.window.registerTreeDataProvider('shortcuts', shortcustProvider);
    const commandHandler = (url) => {
        vscode.env.openExternal(vscode.Uri.parse(url.url));
    };
    let disposable = vscode.commands.registerCommand('shortcuts-project-vscode.openShortcut', commandHandler);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map